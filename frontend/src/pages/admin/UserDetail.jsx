import { useParams, Link } from 'react-router-dom'
import { getUser } from '../../api/client'
import { useFetch } from '../../hooks/useFetch'
import { Card, Badge, LoadingScreen } from '../../components/ui'

const TYPE_LABELS = {
  student:               'Student',
  workplace_supervisor:  'Workplace Supervisor',
  academic_supervisor:   'Academic Supervisor',
  internship_admin:      'Admin',
}
const TYPE_COLORS = {
  student:               'blue',
  workplace_supervisor:  'green',
  academic_supervisor:   'amber',
  internship_admin:      'purple',
}

export default function UserDetail() {
  const { id } = useParams()
  const { data: user, loading } = useFetch(() => getUser(id), [id])

  if (loading) return <LoadingScreen />
  if (!user) return <div style={{ padding: 24, color: 'var(--text3)' }}>User not found.</div>

  const infoRows = [
    { label: 'Full Name', value: `${user.first_name || ''} ${user.last_name || ''}`.trim() || '—' },
    { label: 'Email',     value: user.email || '—' },
    { label: 'Username',  value: user.username },
    { label: 'Role',      value: <Badge variant={TYPE_COLORS[user.user_type] || 'gray'}>{TYPE_LABELS[user.user_type] || user.user_type}</Badge> },
    { label: 'Course',    value: user.course || '—' },
    { label: 'Department',value: user.department || '—' },
  ]

  return (
    <div className="fade-up" style={{ maxWidth: 680 }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>User Details</h1>
          <p>Full information for user: {user.username}</p>
        </div>
        <Link to="/admin/users" className="btn btn-sm">← Back to Users</Link>
      </div>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
          <div className={`item-icon icon-${TYPE_COLORS[user.user_type] || 'blue'}`} style={{ width: 60, height: 60, fontSize: 24 }}>
            {((user.first_name?.[0] || '') + (user.last_name?.[0] || '')) || user.username?.slice(0,2).toUpperCase()}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 20 }}>{user.first_name} {user.last_name}</h2>
            <p style={{ margin: 0, color: 'var(--text3)', fontSize: 14 }}>{user.email}</p>
          </div>
        </div>

        <div className="detail-grid">
          {infoRows.map(row => (
            <div key={row.label} style={{ marginBottom: 16 }}>
              <div className="form-label" style={{ marginBottom: 4 }}>{row.label}</div>
              <div style={{ fontSize: 15, color: 'var(--text1)' }}>{row.value}</div>
            </div>
          ))}
        </div>

        {user.skills && (
          <div style={{ marginTop: 20 }}>
            <div className="form-label">Skills</div>
            <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text2)', background: 'var(--surface2)', borderRadius: 'var(--radius)', padding: '12px 14px', marginTop: 8 }}>
              {user.skills}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
