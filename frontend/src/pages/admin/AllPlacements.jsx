import { useState, useEffect } from 'react'
import { getAllPlacements, adminDenyPlacement, updatePlacement, getUsers } from '../../api/client'
import { useFetch } from '../../hooks/useFetch'
import { Card, Badge, Empty, LoadingScreen } from '../../components/ui'

export default function AllPlacements({ pendingOnly = false }) {
  const { data: placements, loading, refetch } = useFetch(getAllPlacements)
  const [acting, setActing] = useState(null)
  const [search, setSearch] = useState('')
  const [supervisors, setSupervisors] = useState({ workplace: [], academic: [] })
  const [assignments, setAssignments] = useState({})

  useEffect(() => {
    if (pendingOnly) {
      getUsers('workplace').then(r => setSupervisors(s => ({ ...s, workplace: r.data })))
      getUsers('academic').then(r => setSupervisors(s => ({ ...s, academic: r.data })))
    }
  }, [pendingOnly])

  if (loading) return <LoadingScreen />

  let list = placements ?? []
  if (pendingOnly) list = list.filter(p => !p.is_approved)
  if (search) list = list.filter(p =>
    p.student_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.company_name?.toLowerCase().includes(search.toLowerCase())
  )
  list = [...list].sort((a,b) => new Date(b.start_date) - new Date(a.start_date))

  const handleApprove = async id => {
    setActing(id)
    const assign = assignments[id] || {}
    try {
      await updatePlacement(id, {
        is_approved: true,
        ...(assign.workplace_supervisor ? { workplace_supervisor: Number(assign.workplace_supervisor) } : {}),
        ...(assign.academic_supervisor ? { academic_supervisor: Number(assign.academic_supervisor) } : {}),
      })
      refetch()
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to approve placement')
    } finally {
      setActing(null)
    }
  }

  const handleDeny = async id => {
    if (!confirm('Reject and remove this placement?')) return
    setActing(id)
    try { await adminDenyPlacement(id); refetch() } finally { setActing(null) }
  }

  const setAssign = (id, field, value) => {
    setAssignments(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }))
  }

  const displayName = u => {
    const name = [u.first_name, u.last_name].filter(Boolean).join(' ')
    return name || u.username || u.email
  }

  return (
    <div className="fade-up">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>{pendingOnly ? 'Pending Placements' : 'All Placements'}</h1>
          <p>{list.length} records</p>
        </div>
        <input
          className="form-control"
          placeholder="Search student or company…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 240 }}
        />
      </div>

      <Card>
        {list.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Company</th>
                <th>Department</th>
                <th>Duration</th>
                <th>Status</th>
                {pendingOnly && <th style={{ minWidth: 220 }}>Assign Supervisors</th>}
                {!pendingOnly && <th>Supervisors</th>}
              </tr>
            </thead>
            <tbody>
              {list.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 500 }}>{p.student_name}</td>
                  <td>{p.company_name}</td>
                  <td style={{ color: 'var(--text3)' }}>{p.department}</td>
                  <td style={{ color: 'var(--text3)', fontSize: 12 }}>{p.start_date} – {p.end_date}</td>
                  <td><Badge variant={p.is_approved ? 'green' : 'amber'}>{p.is_approved ? 'Active' : 'Pending'}</Badge></td>
                  {pendingOnly && (
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <select
                          className="form-control"
                          style={{ fontSize: 12, padding: '4px 8px' }}
                          value={assignments[p.id]?.workplace_supervisor || ''}
                          onChange={e => setAssign(p.id, 'workplace_supervisor', e.target.value)}
                        >
                          <option value="">Select Workplace Supervisor</option>
                          {supervisors.workplace.map(s => (
                            <option key={s.id} value={s.id}>{displayName(s)}</option>
                          ))}
                        </select>
                        <select
                          className="form-control"
                          style={{ fontSize: 12, padding: '4px 8px' }}
                          value={assignments[p.id]?.academic_supervisor || ''}
                          onChange={e => setAssign(p.id, 'academic_supervisor', e.target.value)}
                        >
                          <option value="">Select Academic Supervisor</option>
                          {supervisors.academic.map(s => (
                            <option key={s.id} value={s.id}>{displayName(s)}</option>
                          ))}
                        </select>
                        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDeny(p.id)} disabled={acting===p.id}>Reject</button>
                          <button className="btn btn-sm btn-primary" onClick={() => handleApprove(p.id)} disabled={acting===p.id}>
                            {acting===p.id ? 'Saving…' : 'Assign & Approve'}
                          </button>
                        </div>
                      </div>
                    </td>
                  )}
                  {!pendingOnly && (
                    <td style={{ fontSize: 12, color: 'var(--text3)' }}>
                      <div>WP: {p.workplace_supervisor_name || '—'}</div>
                      <div>AC: {p.academic_supervisor_name || '—'}</div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : <Empty text={pendingOnly ? 'No pending placements' : 'No placements found'} />}
      </Card>
    </div>
  )
}