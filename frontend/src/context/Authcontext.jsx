import { createContext, useContext, useState, useEffect } from 'react'
import { login as apiLogin, getMe, logout as apiLogout } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user')
      setUser(raw ? JSON.parse(raw) : null)
    } catch {
      localStorage.removeItem('user')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const login = async (email, password, role) => {
    await apiLogin(email, password, role)
    const nextUser = { email, role }
    localStorage.setItem('user', JSON.stringify(nextUser))
    setUser(nextUser)
    return nextUser
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

export const useAuth = () => useContext(AuthContext)
