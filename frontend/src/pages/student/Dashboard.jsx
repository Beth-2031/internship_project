import { useFetch } from '../../hooks/useFetch'
import { getMyPlacement, getWeeklyLogs, getSafetyReports, getCourseCompletion } from '../../api/client'
import { StatCard, Badge, Card, Progress, Empty, LoadingScreen } from '../../components/ui'
import { Link } from 'react-router-dom'

function progressPercent(start, end) {
  const now   = Date.now()
  const s     = new Date(start).getTime()
  const e     = new Date(end).getTime()
  return Math.min(100, Math.max(0, Math.round(((now - s) / (e - s)) * 100)))
}

export default function StudentDashboard() {
  const { data: placement, loading: lp } = useFetch(getMyPlacement)
  const { data: logs,      loading: ll } = useFetch(getWeeklyLogs)
  const { data: safety,    loading: ls } = useFetch(getSafetyReports)
  const { data: course,    loading: lc } = useFetch(getCourseCompletion)

  if (lp || ll || ls || lc) return <LoadingScreen />

  const totalHours   = Array.isArray(logs) ? logs.reduce((s, l) => s + parseFloat(l.hours_worked), 0) : 0
  const verified     = Array.isArray(logs) ? logs.filter(l => l.is_verified).length : 0
  const pct          = placement ? progressPercent(placement.start_date, placement.end_date) : 0
  const currentWeek  = placement ? Math.min(26, Math.floor(pct / 100 * 26) + 1) : '—'
  const safetyOpen   = safety?.filter(r => !r.is_resolved).length ?? 0
  const recentLogs   = Array.isArray(logs) ? [...logs].sort((a,b) => b.week_number - a.week_number).slice(0, 5) : []

  return (
    <div className="fade-up dash">
      <div className="page-header page-header--split">
        <div>
          <h1>Student Dashboard</h1>
          <p className="muted">
            {placement?.company_name ? (
              <>Placement at <strong>{placement.company_name}</strong></>
            ) : (
              'No active placement assigned yet'
            )}
          </p>
        </div>
        <div className="header-actions">
          <Link to="/student/logs/new" className="btn btn-primary btn-sm">Submit weekly log</Link>
          <Link to="/student/safety" className="btn btn-danger btn-sm">Report safety issue</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid stats-4">
        <StatCard label="Current Week"   value={currentWeek}              color="c-blue"  sub="of 26 weeks" />
        <StatCard label="Hours Logged"   value={Math.round(totalHours)}   color="c-green" sub={`${course?.minimum_hours_required ?? 0} required`} />
        <StatCard label="Logs Submitted" value={logs?.length ?? 0}        sub={`${verified} verified`} />
        <StatCard label="Safety Reports" value={safety?.length ?? 0}      color={safetyOpen > 0 ? 'c-red' : ''} sub={`${safetyOpen} open`} />
      </div>

      <div className="grid-3-1">
        <div>
          {/* Placement card */}
          {placement ? (
            <div className="card card--soft" style={{ marginBottom: 18 }}>
              <div className="row-between" style={{ marginBottom: 12 }}>
                <div>
                  <div className="card-kicker">Placement</div>
                  <div className="card-title" style={{ marginTop: 6 }}>{placement.company_name}</div>
                  <div className="card-sub" style={{ marginTop: 4 }}>
                    {placement.department} · {placement.location}
                  </div>
                  <div className="card-sub" style={{ marginTop: 2 }}>
                    {placement.start_date} → {placement.end_date}
                  </div>
                </div>
                <Badge variant={placement.is_approved ? 'green' : 'amber'}>
                  {placement.is_approved ? 'Approved' : 'Pending'}
                </Badge>
              </div>
              <div className="meta-row" style={{ marginBottom: 10 }}>
                <span>Workplace Supervisor: <strong>{placement.workplace_supervisor_name ?? '—'}</strong></span>
                <span>Academic Supervisor: <strong>{placement.academic_supervisor_name ?? '—'}</strong></span>
              </div>
              <div className="row-between meta-small" style={{ marginBottom: 6 }}>
                <span>Progress</span><span><strong>{pct}%</strong></span>
              </div>
              <Progress value={pct} color="fill-blue" />
            </div>
          ) : (
            <div className="alert alert-amber" style={{ marginBottom: 18 }}>
              No active placement. Contact your academic supervisor to get assigned.
            </div>
          )}

          {/* Recent logs */}
          <Card
            title="Weekly Logs"
            subtitle="Recent submissions"
            action={<Link to="/student/logs/new" className="btn btn-primary btn-sm">+ New log</Link>}
          >
            {recentLogs.length > 0 ? recentLogs.map(log => (
              <div className="item-row" key={log.id}>
                <div className="week-pill">W{log.week_number}</div>
                <div className="item-body">
                  <div className="item-name">Week {log.week_number} — {log.hours_worked} hrs</div>
                  <div className="item-meta">{log.date_submitted}</div>
                </div>
                <Badge variant={log.is_verified ? 'green' : 'amber'}>
                  {log.is_verified ? 'Verified' : 'Pending'}
                </Badge>
              </div>
            )) : <Empty text="No logs submitted yet" />}
            {logs?.length > 5 && (
              <div style={{ marginTop: 10, textAlign: 'center' }}>
                <Link to="/student/logs" className="btn btn-sm">View all {logs.length} logs</Link>
              </div>
            )}
          </Card>
        </div>

        {/* Right column */}
        <div>
          {course && (
            <Card title="Course Completion" subtitle={course.course_name} style={{ marginBottom: 16 }}>
              <div className="row-between" style={{ fontSize: 13, marginBottom: 8 }}>
                <span className="muted">Approved hours</span>
                <strong>{course.approved_hours} / {course.minimum_hours_required}</strong>
              </div>
              <Progress
                value={course.approved_hours}
                max={course.minimum_hours_required}
                color={course.is_completed ? 'fill-green' : 'fill-amber'}
              />
              <div style={{ marginTop: 8, textAlign: 'right' }}>
                <Badge variant={course.is_completed ? 'green' : 'amber'}>
                  {course.is_completed ? 'Complete' : 'In progress'}
                </Badge>
              </div>
            </Card>
          )}

          <Card title="Safety Reports" subtitle="Your filed reports">
            {safety?.length > 0 ? safety.map(r => (
              <div className="item-row" key={r.id}>
                <div className={`item-icon ${r.is_resolved ? 'icon-green' : 'icon-red'}`}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                  </svg>
                </div>
                <div className="item-body">
                  <div className="item-name">{r.description?.substring(0,48)}…</div>
                  <div className="item-meta">{r.date_reported}</div>
                </div>
                <Badge variant={r.is_resolved ? 'green' : 'red'}>
                  {r.is_resolved ? 'Resolved' : 'Open'}
                </Badge>
              </div>
            )) : <Empty text="No safety reports" />}
            <div style={{ marginTop: 12 }}>
              <Link to="/student/safety" className="btn btn-sm btn-danger" style={{ width: '100%', justifyContent: 'center' }}>
                Report an Issue
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
