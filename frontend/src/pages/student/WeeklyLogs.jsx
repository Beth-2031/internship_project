import { getWeeklyLogs } from '../../api/client'
import { useFetch } from '../../hooks/useFetch'
import { Card, Badge, Empty, LoadingScreen } from '../../components/ui'
import { Link } from 'react-router-dom'

export default function WeeklyLogs() {
  const { data: logs, loading } = useFetch(getWeeklyLogs)
  if (loading) return <LoadingScreen />

  const sorted = [...(logs || [])].sort((a, b) => b.week_number - a.week_number)
  const totalHours   = logs?.reduce((s, l) => s + parseFloat(l.hours_worked), 0) ?? 0
  const verifiedCount = logs?.filter(l => l.is_verified).length ?? 0

  return (
    <div className="fade-up">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Weekly Logs</h1>
          <p>{logs?.length ?? 0} submissions · {Math.round(totalHours)} total hours · {verifiedCount} verified</p>
        </div>
        <Link to="/student/logs/new" className="btn btn-primary">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Submit Log
        </Link>
      </div>

      <Card>
        {sorted.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Week</th>
                <th>Hours</th>
                <th>Tasks</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(log => (
                <tr key={log.id}>
                  <td>
                    <div className="week-pill" style={{ margin: '0 auto 0 0' }}>W{log.week_number}</div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{log.hours_worked} hrs</td>
                  <td style={{ color: 'var(--text2)', maxWidth: 280 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.tasks_done}
                    </div>
                  </td>
                  <td className="td-muted">{log.date_submitted}</td>
                  <td>
                    <Badge variant={log.is_verified ? 'green' : 'amber'}>
                      {log.is_verified ? 'Verified' : 'Pending'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <Empty text="No logs submitted yet — start by submitting your first weekly log" />
        )}
      </Card>
    </div>
  )
}
