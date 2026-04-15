import { useState } from 'react'
import { getPendingLogs, verifyLog } from '../../api/client'
import { useFetch } from '../../hooks/useFetch'
import { Card, Badge, Empty, LoadingScreen } from '../../components/ui'
import { Link } from 'react-router-dom'

export default function VerifyLogs() {
  const { data: logs, loading, refetch } = useFetch(getPendingLogs)
  const [verifying, setVerifying] = useState(null)

  if (loading) return <LoadingScreen />

  const handleVerify = async id => {
    setVerifying(id)
    try { await verifyLog(id); refetch() }
    finally { setVerifying(null) }
  }

  return (
    <div className="fade-up">
      <div className="page-header">
        <h1>Verify Logs</h1>
        <p>{logs?.length ?? 0} logs awaiting verification</p>
      </div>

      {logs?.length > 0 ? logs.map(log => (
        <Card key={log.id} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="week-pill">W{log.week_number}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{log.student_name}</div>
                <div style={{ color: 'var(--text3)', fontSize: 12 }}>Week {log.week_number} · {log.hours_worked} hours · {log.date_submitted}</div>
              </div>
            </div>
            <Badge variant="amber">Pending</Badge>
          </div>

          {[
            ['Tasks Done',       log.tasks_done],
            ['Challenges Faced', log.challenges_faced],
            ['Next Week Plans',  log.next_week_plans],
          ].map(([label, val]) => (
            <div key={label} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text3)', marginBottom: 5 }}>{label}</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, background: 'var(--surface2)', borderRadius: 'var(--radius)', padding: '10px 12px' }}>
                {val || '—'}
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button
              className="btn btn-primary"
              onClick={() => handleVerify(log.id)}
              disabled={verifying === log.id}
            >
              {verifying === log.id ? 'Verifying…' : '✓ Verify Log'}
            </button>
          </div>
        </Card>
      )) : (
        <Card><Empty text="All logs have been verified — nothing pending" /></Card>
      )}
    </div>
  )
}
