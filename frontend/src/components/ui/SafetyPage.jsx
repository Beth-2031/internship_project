import { useState } from 'react'
import { Badge, Card, Empty, LoadingScreen } from '../../components/ui'

export default function SafetyPage({ reports, loading, onResolve, title = 'Safety Reports', canResolve = false }) {
  const [acting, setActing] = useState(null)

  if (loading) return <LoadingScreen />

  const handleResolve = async id => {
    if (!onResolve) return
    setActing(id)
    try { await onResolve(id) }
    finally { setActing(null) }
  }

  const open     = reports?.filter(r => !r.is_resolved) ?? []
  const resolved = reports?.filter(r => r.is_resolved)  ?? []

  return (
    <div className="fade-up">
      <div className="page-header">
        <h1>{title}</h1>
        <p>{open.length} open · {resolved.length} resolved</p>
      </div>

      {open.length > 0 && (
        <Card title="Open Reports" subtitle="Requiring attention" style={{ marginBottom: 16 }}>
          {open.map(r => (
            <div key={r.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{r.student_name}</div>
                  <div style={{ color: 'var(--text3)', fontSize: 11 }}>{r.date_reported}</div>
                </div>
                <Badge variant="red">Open</Badge>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text2)', background: 'var(--surface2)', borderRadius: 'var(--radius)', padding: '10px 12px', marginBottom: canResolve ? 8 : 0 }}>
                {r.description}
              </div>
              {canResolve && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn btn-sm btn-primary" onClick={() => handleResolve(r.id)} disabled={acting === r.id}>
                    {acting === r.id ? 'Saving…' : 'Mark Resolved'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </Card>
      )}

      <Card title="Resolved Reports">
        {resolved.length > 0 ? resolved.map(r => (
          <div className="item-row" key={r.id}>
            <div className="item-icon icon-green">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div className="item-body">
              <div className="item-name">{r.student_name} — {r.description?.substring(0,60)}…</div>
              <div className="item-meta">{r.date_reported}</div>
            </div>
            <Badge variant="green">Resolved</Badge>
          </div>
        )) : <Empty text="No resolved reports yet" />}
      </Card>
    </div>
  )
}
