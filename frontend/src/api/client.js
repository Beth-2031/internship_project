import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach access token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh on 401
api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refresh = localStorage.getItem('refresh')
        const { data } = await axios.post('/api/auth/refresh/', { refresh })
        localStorage.setItem('access', data.access)
        original.headers.Authorization = `Bearer ${data.access}`
        return api(original)
      } catch {
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api

// ── Auth ──
export const login = (email, password, role) =>
  api.post('/login/', { email, password, role })

// Backend does not currently expose /api/auth/me/
export const getMe = () => api.get('/me/')

export const register = (data) =>
  api.post('/register/', data)

// ── Student endpoints ──
export const getMyPlacement = () => api.get('/placements/my/')
export const getWeeklyLogs  = () => api.get('/logs/')
export const submitLog      = data => api.post('/logs/', data)
export const getSafetyReports    = () => api.get('/safety-reports/')
export const submitSafetyReport  = data => api.post('/safety-reports/', data)
export const getCourseCompletion = () => api.get('/course-completions/my/')

// ── Workplace supervisor endpoints ──
export const getSupervisorStudents   = () => api.get('/placements/my-students/')
export const getPendingLogs          = () => api.get('/logs/pending/')
export const verifyLog               = id  => api.patch(`/logs/${id}/verify/`)
export const getSupervisorSafetyReports = () => api.get('/safety-reports/my-students/')

// ── Academic supervisor endpoints ──
export const getAcademicPlacements   = () => api.get('/placements/academic/')
export const getPendingPlacements    = () => api.get('/placements/pending/')
export const approvePlacement        = id  => api.patch(`/placements/${id}/approve/`)
export const denyPlacement           = id  => api.delete(`/placements/${id}/`)
export const getCourseCompletions    = () => api.get('/course-completions/')
export const getAcademicSafetyReports = () => api.get('/safety-reports/academic/')

// ── Admin endpoints ──
export const getAllPlacements        = () => api.get('/placements/')
export const adminApprovePlacement   = id  => api.patch(`/placements/${id}/approve/`)
export const adminDenyPlacement      = id  => api.delete(`/placements/${id}/`)
export const getAllSafetyReports     = () => api.get('/safety-reports/')
export const resolveReport           = id  => api.patch(`/safety-reports/${id}/resolve/`)
export const getUsers                = (type = '') => api.get(`/users/${type ? `?type=${type}` : ''}`)
export const createUser              = data => api.post('/users/', data)
export const getAdminStats           = () => api.get('/admin/stats/')
export const exportData              = type => api.get(`/export/?type=${type}`, { responseType: 'blob' })
