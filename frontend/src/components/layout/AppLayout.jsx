import { Outlet } from 'react-router-dom'
import Sidebar from './sidebar'

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
          {topbarAction && <div className="topbar-right">{topbarAction}</div>}
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
