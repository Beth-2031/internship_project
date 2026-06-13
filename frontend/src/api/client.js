import axios from 'axios'

const isProduction = import.meta.env.PROD
const apiBase = isProduction 
  ? (import.meta.env.VITE_API_URL_PRODUCTION || 'https://iles-django-7119b58af980.herokuapp.com/') + 'api'
  : '/api'

const api = axios.create({
  baseURL: apiBase,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
})

// Helper function to ensure CSRF token is fetched
let csrfFetched = false
const ensureCsrfToken = async () => {
  if (csrfFetched) return
  
  try {
    console.log('Ensuring CSRF token is present...')
    await api.get('/csrf-token/')
    csrfFetched = true
    console.log('CSRF token confirmed!')
  } catch (err) {
    console.error('Failed to fetch CSRF token:', err)
  }
}

api.interceptors.request.use(async config => {
  // Ensure we have a CSRF token for any state-changing request
  if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
    await ensureCsrfToken()
  }
  
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1]
  
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken
  }
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    const publicPaths = ['/', '/login', '/register', '/forgot-password', '/reset-password']
    const isMeEndpoint = err.config?.url?.includes('/me/')
    
    if (err.response?.status === 401 && !publicPaths.includes(window.location.pathname) && !isMeEndpoint) {
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

// ── Password reset ──
export const requestPasswordReset = (email) =>
  api.post('/password-reset/request/', { email })

export const confirmPasswordReset = ({ uid, token, new_password }) =>
  api.post('/password-reset/confirm/', { uid, token, new_password })

// ── Student endpoints ──
export const getMyPlacement = () =>
  api.get('/placements/').then(res => ({ ...res, data: Array.isArray(res.data) ? (res.data[0] ?? null) : res.data }))
export const createPlacement = data => api.post('/placements/', data)
export const getWeeklyLogs  = () => api.get('/weekly-logs/')
export const submitLog      = data => api.post('/weekly-logs/', data)
export const getEvaluation = () => api.get('/evaluations/')
export const createEvaluation = data => api.post('/evaluations/', data)
export const updateEvaluation = (id, data) => api.patch(`/evaluations/${id}/`, data)
export const getSafetyReports    = () => api.get('/safety-reports/')
export const submitSafetyReport  = data => api.post('/safety-reports/', data)
export const getCourseCompletion = () =>
  api.get('/course-completions/').then(res => ({ ...res, data: Array.isArray(res.data) ? (res.data[0] ?? null) : res.data }))

// ── Workplace supervisor endpoints ──
export const getSupervisorStudents   = () => api.get('/placements/')
export const getPendingLogs          = () => api.get('/weekly-logs/?is_verified=false')
export const verifyLog               = (id, comments = '') => api.patch(`/weekly-logs/${id}/`, { is_verified: true, comments })
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
export const getUser                 = id => api.get(`/users/${id}/`)
export const createUser              = data => api.post('/users/', data)
export const deleteUser              = id => api.delete(`/users/${id}/`)
export const getAdminStats           = () => api.get('/admin/stats/')
export const exportData              = type => api.get(`/export/?type=${type}`, { responseType: 'blob' })

// ── Notifications ──
export const getNotifications        = () => api.get('/notifications/')
export const markNotificationRead     = id  => api.patch(`/notifications/${id}/`, { is_read: true })
export const markAllNotificationsRead = ()  => api.get('/notifications/').then(res => {
  const unread = (res.data || []).filter(n => !n.is_read)
  return Promise.all(unread.map(n => api.patch(`/notifications/${n.id}/`, { is_read: true })))
})