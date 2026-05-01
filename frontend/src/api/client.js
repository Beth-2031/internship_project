import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})
api.interceptors.response.use(
  res => res,
  err => {
    const publicPaths = ['/', '/login', '/register']
    if (err.response?.status === 401 && !publicPaths.includes(window.location.pathname)) {
      window.location.href = '/login'
    }
    return Promise.reject(err)

  }
)

export default api

// ── Auth ──
export const login = (email, password) =>
  api.post('/login/', { email, password })
export const getMe = () => api.get('/me/')

export const register = (data) =>
  api.post('/register/', data)

export const logout = () => api.post('/logout/')

// ── Student endpoints ──
export const getMyPlacement = () =>
  api.get('/placements/').then(res => ({ ...res, data: Array.isArray(res.data) ? (res.data[0] ?? null) : res.data }))
export const createPlacement = data => api.post('/placements/', data)
export const getWeeklyLogs  = () => api.get('/weekly-logs/')
export const submitLog      = data => api.post('/weekly-logs/', data)
export const getSafetyReports    = () => api.get('/safety-reports/')
export const submitSafetyReport  = data => api.post('/safety-reports/', data)
export const getCourseCompletion = () =>
  api.get('/course-completions/').then(res => ({ ...res, data: Array.isArray(res.data) ? (res.data[0] ?? null) : res.data }))

// ── Workplace supervisor endpoints ──
export const getSupervisorStudents   = () => api.get('/placements/')
export const getPendingLogs          = () => api.get('/weekly-logs/?is_verified=false')
export const verifyLog               = id  => api.patch(`/weekly-logs/${id}/`, { is_verified: true })
export const getSupervisorSafetyReports = () => api.get('/safety-reports/')

// ── Academic supervisor endpoints ──
export const getAcademicPlacements   = () => api.get('/placements/')
export const getPendingPlacements    = () => api.get('/placements/?is_approved=false')
export const approvePlacement        = id  => api.patch(`/placements/${id}/`, { is_approved: true })
export const denyPlacement           = id  => api.delete(`/placements/${id}/`)
export const getCourseCompletions    = () => api.get('/course-completions/')
export const getAcademicSafetyReports = () => api.get('/safety-reports/')

// ── Admin endpoints ──
export const getAllPlacements        = () => api.get('/placements/')
export const adminApprovePlacement   = id  => api.patch(`/placements/${id}/`, { is_approved: true })
export const adminDenyPlacement      = id  => api.delete(`/placements/${id}/`)
export const updatePlacement         = (id, data) => api.patch(`/placements/${id}/`, data)
export const getAllSafetyReports     = () => api.get('/safety-reports/')
export const resolveReport           = id  => api.patch(`/safety-reports/${id}/`, { is_resolved: true })
export const getUsers                = (type = '') => api.get(`/users/${type ? `?type=${type}` : ''}`)
export const createUser              = data => api.post('/users/', data)
export const getAdminStats           = () => api.get('/admin/stats/')
export const exportData              = type => api.get(`/export/?type=${type}`, { responseType: 'blob' })

// ── Notifications ──
export const getNotifications        = () => api.get('/notifications/')
export const markNotificationRead     = id  => api.patch(`/notifications/${id}/`, { is_read: true })
export const markAllNotificationsRead = ()  => api.get('/notifications/').then(res => {
  const unread = (res.data || []).filter(n => !n.is_read)
  return Promise.all(unread.map(n => api.patch(`/notifications/${n.id}/`, { is_read: true })))
})