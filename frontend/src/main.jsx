import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './context/Authcontext'
import { NotificationProvider as ToastProvider } from './components/layout/Notification'
import { NotificationProvider } from './context/NotificationContext'
import './STYLES/index.css'
import App from './App'

function Root() {
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
