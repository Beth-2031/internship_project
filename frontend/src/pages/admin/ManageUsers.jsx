import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { getUsers, deleteUser } from '../../api/client'
import { useFetch } from '../../hooks/useFetch'
import { Card, Badge, Empty, LoadingScreen } from '../../components/ui'
import { useAuth } from '../../context/Authcontext'

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

export default function ManageUsers() {
  const { user: currentUser } = useAuth()
  const [searchParams] = useSearchParams()
  const typeFilter = searchParams.get('type') || ''
  const { data: users, loading, refetch } = useFetch(() => getUsers(typeFilter), [typeFilter])
  const [search, setSearch] = useState('')

  const handleDelete = async (user) => {
    if (user.id === currentUser?.id) {
      alert("You cannot delete your own account.")
      return
    }
    if (!window.confirm(`Are you sure you want to delete ${user.first_name} ${user.last_name}?`)) return
    try {
      await deleteUser(user.id)
      refetch()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete user')
    }
  }

  if (loading) return <LoadingScreen />

  const list = (users ?? []).filter(u =>
    !search || u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.last_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fade-up">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Manage Users</h1>
          <p>{list.length} users{typeFilter ? ` · ${TYPE_LABELS[typeFilter]}` : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            className="form-control" placeholder="Search users…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: 200 }}
          />
          <Link to="/admin/users/new" className="btn btn-primary btn-sm">+ Register User</Link>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
        {[['', 'All'], ...Object.entries(TYPE_LABELS)].map(([val, label]) => (
          <Link
            key={val}
            to={val ? `/admin/users?type=${val}` : '/admin/users'}
            className="btn btn-sm"
            style={typeFilter === val ? { background: 'var(--surface2)', borderColor: 'var(--border2)', color: 'var(--accent)' } : {}}
          >
            {label}
          </Link>
        ))}
      </div>

      <Card>
        {list.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className={`item-icon icon-${TYPE_COLORS[u.user_type] || 'blue'}`} style={{ width: 30, height: 30, fontSize: 11 }}>
                        {((u.first_name?.[0] || '') + (u.last_name?.[0] || '')) || u.username?.slice(0,2).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 500 }}>{u.first_name} {u.last_name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text3)', fontFamily: 'monospace', fontSize: 12 }}>{u.username}</td>
                  <td style={{ color: 'var(--text3)', fontSize: 12 }}>{u.email || '—'}</td>
                  <td><Badge variant={TYPE_COLORS[u.user_type] || 'gray'}>{TYPE_LABELS[u.user_type] || u.user_type}</Badge></td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <Link 
                        to={`/admin/users/${u.id}`}
                        className="btn btn-sm"
                        style={{ padding: '2px 8px', fontSize: 11 }}
                      >
                        View
                      </Link>
                      <button 
                        className="btn btn-sm" 
                        onClick={() => handleDelete(u)}
                        disabled={u.id === currentUser?.id}
                        style={{ 
                          color: u.id === currentUser?.id ? '#9ca3af' : '#ef4444', 
                          borderColor: u.id === currentUser?.id ? '#e5e7eb' : '#ef4444', 
                          padding: '2px 8px', 
                          fontSize: 11,
                          cursor: u.id === currentUser?.id ? 'not-allowed' : 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <Empty text="No users found" />}
      </Card>
    </div>
  )
}
