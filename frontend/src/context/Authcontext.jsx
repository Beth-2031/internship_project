import { createContext, useContext, useState, useEffect } from 'react'
import { login as apiLogin, getMe, logout as apiLogout } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMe()
      .then(r => setUser(r.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
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

export const useAuth = () => useContext(AuthContext)
