import { useParams, Link } from 'react-router-dom'
import { useFetch } from '../../hooks/useFetch'
import { Card, Badge, LoadingScreen } from '../../components/ui'
import api from '../../api/client'

export default function LogDetail() {
  const { id } = useParams()
  const { data: log, loading } = useFetch(() => api.get(`/weekly-logs/${id}/`), [id])
  if (loading) return <LoadingScreen />
  if (!log) return <div style={{ padding: 24, color: 'var(--text3)' }}>Log not found.</div>

  return (
    <div className="fade-up" style={{ maxWidth: 680 }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Week {log.week_number} Log</h1>
          <p>{log.student_name} · {log.hours_worked} hrs · {log.date_submitted}</p>
        </div>
        <Badge variant={log.is_verified ? 'green' : 'amber'}>
          {log.is_verified ? 'Verified' : 'Pending'}
        </Badge>
      </div>

      <Card>
        {[
          ['Tasks Done',       log.tasks_done],
          ['Challenges Faced', log.challenges_faced],
          ['Next Week Plans',  log.next_week_plans],
        ].map(([label, val]) => (
          <div key={label} style={{ marginBottom: 16 }}>
            <div className="form-label">{label}</div>
            <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text2)', background: 'var(--surface2)', borderRadius: 'var(--radius)', padding: '12px 14px' }}>
              {val || '—'}
            </div>
          </div>
        ))}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Link to="/supervisor/logs" className="btn">← Back to logs</Link>
        </div>
      </Card>
    </div>
  )
}