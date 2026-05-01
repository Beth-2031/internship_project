import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../api/client'
import { useAuth } from './Authcontext'

const NotificationContext = createContext(null)

const POLL_INTERVAL = 30_000 // 30 seconds

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchNotifications = useCallback(async () => {
    if (!user) return
    try {
      const res = await getNotifications()
      setNotifications(res.data || [])
    } catch {
      // Silently fail — notifications are non-critical
    }
  }, [user])

  // Initial fetch + polling
  useEffect(() => {
    if (!user) { setNotifications([]); return }
    setLoading(true)
    fetchNotifications().finally(() => setLoading(false))

    const interval = setInterval(fetchNotifications, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [user, fetchNotifications])

  const markRead = useCallback(async (id) => {
    try {
      await markNotificationRead(id)
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      )
    } catch { /* non-critical */ }
  }, [])

  const markAllRead = useCallback(async () => {
    try {
      await markAllNotificationsRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch { /* non-critical */ }
  }, [])

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, loading, markRead, markAllRead, refetch: fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}
