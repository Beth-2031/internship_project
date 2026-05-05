import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/Authcontext'

const Icon = ({ d, d2 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />{d2 && <path d={d2} />}
  </svg>
)

const NAV = {
  student: [
    { label: 'Overview', links: [
      { to: '/student/dashboard', icon: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z', text: 'Dashboard' },
      { to: '/student/placements', icon: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z', text: 'My Placement' },
    ]},
    { label: 'Activity', links: [
      { to: '/student/placements/request', icon: 'M12 5v14M5 12h14', text: 'Request Placement' },
      { to: '/student/logs',       icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z', text: 'Weekly Logs' },
      { to: '/student/logs/new',   icon: 'M12 5v14M5 12h14', text: 'Submit Log' },
      { to: '/student/safety',     icon: 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z', text: 'Safety Report' },
      { to: '/student/course',     icon: 'M9 11l3 3L22 4', text: 'Course Status' },
    ]},
  ],
  workplace_supervisor: [
    { label: 'Overview', links: [
      { to: '/supervisor/dashboard',          icon: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z', text: 'Dashboard' },
      { to: '/supervisor/students', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M12 7a4 4 0 100 8 4 4 0 000-8z', text: 'My Students' },
    ]},
    { label: 'Actions', links: [
      { to: '/supervisor/logs',     icon: 'M9 11l3 3L22 4', text: 'Verify Logs', badge: 'pendingLogs' },
      { to: '/supervisor/safety',   icon: 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z', text: 'Safety Reports' },
    ]},
  ],
  academic_supervisor: [
    { label: 'Overview', links: [
      { to: '/academic/dashboard',              icon: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z', text: 'Dashboard' },
      { to: '/academic/students',     icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M12 7a4 4 0 100 8 4 4 0 000-8z', text: 'My Students' },
    ]},
    { label: 'Actions', links: [
      { to: '/academic/placements',   icon: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z', text: 'Approve Placements', badge: 'pendingPlacements' },
      { to: '/academic/courses',      icon: 'M9 11l3 3L22 4', text: 'Course Completions' },
      { to: '/academic/safety',       icon: 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z', text: 'Safety Reports' },
    ]},
  ],
  internship_admin: [
    { label: 'Overview', links: [
      { to: '/admin/dashboard',               icon: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z', text: 'Dashboard' },
    ]},
    { label: 'Placements', links: [
      { to: '/admin/placements',    icon: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z', text: 'All Placements' },
      { to: '/admin/placements/pending', icon: 'M12 2a10 10 0 100 20A10 10 0 0012 2z', text: 'Pending', badge: 'pendingPlacements' },
    ]},
    { label: 'Users', links: [
      { to: '/admin/users',         icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M12 7a4 4 0 100 8 4 4 0 000-8z', text: 'Manage Users' },
      { to: '/admin/users/new',     icon: 'M12 5v14M5 12h14', text: 'Register User' },
    ]},
    { label: 'Reports', links: [
      { to: '/admin/safety',        icon: 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z', text: 'Safety Reports', badge: 'openSafety' },
      { to: '/admin/export',        icon: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3', text: 'Export Data' },
    ]},
  ],
}

export default function Sidebar({ badges = {} }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const sections = NAV[user?.user_type] || []
  const initials = ((user?.first_name?.[0] || '') + (user?.last_name?.[0] || '')) || user?.username?.slice(0,2).toUpperCase()

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <span className="brand-name">Internship Management System</span>
      </div>

      <nav className="sidebar-nav">
        {sections.map(section => (
          <div className="nav-section" key={section.label}>
            <span className="nav-label">{section.label}</span>
            {section.links.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to.split('/').length <= 2}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={link.icon}/>
                </svg>
                {link.text}
                {link.badge && badges[link.badge] > 0 && (
                  <span className="nav-badge">{badges[link.badge]}</span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="user-avatar">{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
            </div>
            <div className="user-role">{user?.user_type?.replace(/_/g,' ')}</div>
          </div>
          <button
            onClick={async () => { await logout(); navigate('/') }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: '2px' }}
            title="Sign out"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  )
}
