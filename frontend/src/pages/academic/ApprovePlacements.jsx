import { useState } from 'react'
import { getPendingPlacements, approvePlacement, denyPlacement } from '../../api/client'
import { useFetch } from '../../hooks/useFetch'
import { Card, Empty, LoadingScreen } from '../../components/ui'

export default function ApprovePlacements() {
  const { data: pending, loading, refetch } = useFetch(getPendingPlacements)
  const [acting, setActing] = useState(null)

  if (loading) return <LoadingScreen />

  const handleApprove = async id => {
    setActing(id)
    try { await approvePlacement(id); refetch() } finally { setActing(null) }
  }
  const handleDeny = async id => {
    if (!confirm('Deny and remove this placement?')) return
    setActing(id)
    try { await denyPlacement(id); refetch() } finally { setActing(null) }
  }

  return (
    <div className="fade-up">
      <div className="page-header">
        <h1>Approve Placements</h1>
        <p>{pending?.length ?? 0} placements awaiting your approval</p>
      </div>
      {pending?.length > 0 ? pending.map(p => (
        <Card key={p.id} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, fontFamily: 'var(--font-head)' }}>{p.student_name}</div>
              <div style={{ color: 'var(--text3)', fontSize: 12, marginTop: 3 }}>{p.company_name} — {p.department} — {p.location}</div>
              <div style={{ color: 'var(--text3)', fontSize: 12, marginTop: 2 }}>{p.start_date} → {p.end_date}</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            {[['Workplace Supervisor', p.workplace_supervisor_name ?? '—'], ['Academic Supervisor', p.academic_supervisor_name ?? '—']].map(([l,v]) => (
              <div key={l} style={{ background: 'var(--surface2)', borderRadius: 'var(--radius)', padding: '8px 12px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text3)', marginBottom: 3 }}>{l}</div>
                <div style={{ fontSize: 13 }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-danger" onClick={() => handleDeny(p.id)}    disabled={acting===p.id}>Deny</button>
            <button className="btn btn-primary" onClick={() => handleApprove(p.id)} disabled={acting===p.id}>
              {acting===p.id ? 'Saving…' : 'Approve Placement'}
            </button>
          </div>
        </Card>
      )) : <Card><Empty text="No pending placements to review" /></Card>}
    </div>
  )
}