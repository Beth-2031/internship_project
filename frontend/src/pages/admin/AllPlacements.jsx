import { useState } from 'react'
import { getAllPlacements, adminApprovePlacement, adminDenyPlacement } from '../../api/client'
import { useFetch } from '../../hooks/useFetch'
import { Card, Badge, Empty, LoadingScreen } from '../../components/ui'

export default function AllPlacements({ pendingOnly = false }) {
  const { data: placements, loading, refetch } = useFetch(getAllPlacements)
  const [acting, setActing] = useState(null)
  const [search, setSearch] = useState('')

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
    try { await adminApprovePlacement(id); refetch() } finally { setActing(null) }
  }
  const handleDeny = async id => {
    if (!confirm('Reject and remove this placement?')) return
    setActing(id)
    try { await adminDenyPlacement(id); refetch() } finally { setActing(null) }
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
                {pendingOnly && <th>Actions</th>}
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
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-sm btn-danger"  onClick={() => handleDeny(p.id)}    disabled={acting===p.id}>Reject</button>
                        <button className="btn btn-sm btn-primary" onClick={() => handleApprove(p.id)} disabled={acting===p.id}>Approve</button>
                      </div>
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