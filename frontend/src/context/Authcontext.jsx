import { createContext, useContext, useState, useEffect } from 'react'
import { login as apiLogin, getMe, logout as apiLogout } from '../api/client'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchCsrfToken = async () => {
    try {
      console.log('Fetching CSRF token...')
      await api.get('/csrf-token/')
      console.log('CSRF token fetched successfully!')
    } catch (err) {
      console.error('Failed to fetch CSRF token:', err)
    }
  }

  useEffect(() => {
    // Fetch CSRF token first
    fetchCsrfToken()
      // Then try to get current user
      .then(() => getMe())
      .then(r => setUser(r.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    // Ensure CSRF token is present before logging in
    await fetchCsrfToken()
    
    const { data } = await apiLogin(email, password)
    const currentUser = data?.user ?? null
    setUser(currentUser)
    return currentUser
  }

  const logout = async () => {
    try {
      await apiLogout()
    } catch {
      // Ignore network/auth logout errors and clear local state anyway.
    }
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)