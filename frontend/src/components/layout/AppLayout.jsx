import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './sidebar'
import NotificationBell from './NotificationBell'

export default function AppLayout({ badges, topbarTitle, topbarSub, topbarAction }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <Sidebar badges={badges} onClose={() => setSidebarOpen(false)} />
      </div>
      
      <div className="main-area">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Hamburger button for mobile */}
            <button 
              className="hamburger-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 12h18M3 6h18M3 18h18"/>
              </svg>
            </button>
            <div>
              <span className="topbar-title">{topbarTitle}</span>
              {topbarSub && <span className="topbar-sub">— {topbarSub}</span>}
            </div>
          </div>
          <div className="topbar-right">
            <NotificationBell />
            {topbarAction}
          </div>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
