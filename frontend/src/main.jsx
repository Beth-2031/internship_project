import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './context/Authcontext'
import { NotificationProvider as ToastProvider } from './components/layout/Notification'
import { NotificationProvider } from './context/NotificationContext'
import './STYLES/index.css'
import App from './App'
import api from './api/client'

function Root() {
  useEffect(() => {
    // Fetch CSRF token on app load
    api.get('/csrf-token/').catch(() => {})
  }, [])

  return (
    <AuthProvider>
      <ToastProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </ToastProvider>
    </AuthProvider>
  )
}

createRoot(document.getElementById("root")).render(<Root />)
