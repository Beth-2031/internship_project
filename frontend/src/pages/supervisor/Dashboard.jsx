import { useState } from 'react'
import { getSupervisorStudents, getPendingLogs, verifyLog, getSupervisorSafetyReports } from '../../api/client'
import { useFetch } from '../../hooks/useFetch'
import { StatCard, Card, Badge, Alert, Empty, LoadingScreen } from '../../components/ui'
import { Progress } from '../../components/ui'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function SupervisorDashboard() {
  const { data: students, loading: ls }      = useFetch(getSupervisorStudents)
  const { data: pendingLogs, loading: lp, refetch } = useFetch(getPendingLogs)
  const { data: safety, loading: lsf }       = useFetch(getSupervisorSafetyReports)
  const [verifying, setVerifying] = useState(null)

  if (ls || lp || lsf) return <LoadingScreen />

  const openSafety = safety?.filter(r => !r.is_resolved) ?? []

  const handleVerify = async id => {
    setVerifying(id)
    try { await verifyLog(id); refetch() }
    finally { setVerifying(null) }
  }
  const chartData = [
    { name: 'Pending', value:pendingLogs?.filter(l => !l.is_verified).length || 0},
    { name: 'Verified', value:pendingLogs?.filter(l => l.is_verified).length || 0},
  ]

  return (
    <div className="fade-up">
      <div className="page-header">
        <h1>Supervisor Dashboard</h1>
        <p>Manage your students and verify their weekly logs</p>
      </div>

      <div className="stats-grid stats-3">
        <StatCard label="Students Supervised" value={students?.length ?? 0} color="c-blue"  sub="Active placements" />
        <StatCard label="Logs to Verify"       value={pendingLogs?.length ?? 0} color={pendingLogs?.length > 0 ? 'c-amber' : ''} sub="Awaiting review" />
        <Card title="Pending Reviews Overview">
          <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#7c3aed" />
                </BarChart>
            </ResponsiveContainer>
        </Card>
        <StatCard label="Safety Reports"       value={openSafety.length} color={openSafety.length > 0 ? 'c-red' : ''} sub="Unresolved" />
      </div>

      {openSafety.map(r => (
        <Alert key={r.id} variant="red">
          <strong>{r.student_name}</strong> — {r.description?.substring(0, 100)}…
        </Alert>
      ))}

      <div className="grid-2">
        {/* Students */}
        <Card title="My Students" subtitle="Assigned to you for supervision"
          action={<Link to="/supervisor/students" className="btn btn-sm">View all</Link>}
        >
          {students?.length > 0 ? students.map(p => (
            <div className="item-row" key={p.id}>
              <div className="item-icon icon-blue">
                {(p.student_name || 'S').slice(0,2).toUpperCase()}
              </div>
              <div className="item-body">
                <div className="item-name">{p.student_name}</div>
                <div className="item-meta">{p.department} · {p.logs_count ?? 0} logs</div>
                <div style={{ marginTop: 5 }}>
                  <Progress value={p.progress_percent ?? 0} color="fill-blue" />
                </div>
              </div>
              <Badge variant={p.is_approved ? 'green' : 'amber'}>
                {p.is_approved ? 'Active' : 'Pending'}
              </Badge>
            </div>
          )) : <Empty text="No students assigned yet" />}
        </Card>

        {/* Pending logs */}
        <Card title="Logs Awaiting Verification" subtitle="Review and verify submissions"
          action={<Link to="/supervisor/logs" className="btn btn-sm">View all</Link>}
        >
          {pendingLogs?.length > 0 ? pendingLogs.slice(0, 4).map(log => (
            <div key={log.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div className="item-row" style={{ border: 'none', padding: '0 0 8px' }}>
                <div className="week-pill">W{log.week_number}</div>
                <div className="item-body">
                  <div className="item-name">{log.student_name} — Week {log.week_number}</div>
                  <div className="item-meta">{log.hours_worked} hrs · {log.date_submitted}</div>
                </div>
              </div>
              <div style={{
                fontSize: 12, color: 'var(--text3)',
                background: 'var(--surface2)', borderRadius: 'var(--radius)',
                padding: '8px 10px', marginBottom: 8,
              }}>
                {log.tasks_done?.substring(0, 110)}…
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <Link to={`/supervisor/logs/${log.id}`} className="btn btn-sm">View full</Link>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleVerify(log.id)}
                  disabled={verifying === log.id}
                >
                  {verifying === log.id ? 'Verifying…' : 'Verify'}
                </button>
              </div>
            </div>
          )) : <Empty text="All logs verified ✓" />}
        </Card>
      </div>
    </div>
  )
}
