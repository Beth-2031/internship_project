import { createContext, useContext, useState, useEffect } from 'react'
<<<<<<< HEAD
import { login as apiLogin } from '../api/client'
=======
import { login as apiLogin, getMe, logout as apiLogout } from '../api/client'
>>>>>>> 0dd4b50f06a16c2d17639cce34f89964ed7958a3

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
<<<<<<< HEAD
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

  const logout = () => {
    localStorage.removeItem('user')
=======
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
>>>>>>> 0dd4b50f06a16c2d17639cce34f89964ed7958a3
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
