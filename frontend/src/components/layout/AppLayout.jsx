import { Outlet } from 'react-router-dom'
import Sidebar from './sidebar'
import NotificationBell from './NotificationBell'

export default function AppLayout({ badges, topbarTitle, topbarSub, topbarAction }) {
  return (
    <div className="layout">
      <Sidebar badges={badges} />
      <div className="main-area">
        <header className="topbar">
          <div>
            <span className="topbar-title">{topbarTitle}</span>
            {topbarSub && <span className="topbar-sub">— {topbarSub}</span>}
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
