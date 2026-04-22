import { useState } from 'react'
import { getAcademicPlacements, getPendingPlacements, approvePlacement, denyPlacement, getCourseCompletions, getAcademicSafetyReports } from '../../api/client'
import { useFetch } from '../../hooks/useFetch'
import { StatCard, Card, Badge, Alert, Progress, Empty, LoadingScreen } from '../../components/ui'
import { Link } from 'react-router-dom'

export default function AcademicDashboard() {
  const { data: placements, loading: lp }                     = useFetch(getAcademicPlacements)
  const { data: pending, loading: lpd, refetch: refPending }  = useFetch(getPendingPlacements)
  const { data: courses,  loading: lc }                       = useFetch(getCourseCompletions)
  const { data: safety,   loading: ls }                       = useFetch(getAcademicSafetyReports)
  const [acting, setActing] = useState(null)

  if (lp || lpd || lc || ls) return <LoadingScreen />

  const openSafety = safety?.filter(r => !r.is_resolved) ?? []
  const active     = placements?.filter(p => p.is_approved).length ?? 0
  const completed  = courses?.filter(c => c.is_completed).length ?? 0

  const handleApprove = async id => {
    setActing(id)
    try { await approvePlacement(id); refPending() }
    finally { setActing(null) }
  }
  const handleDeny = async id => {
    if (!confirm('Deny and remove this placement?')) return
    setActing(id)
    try { await denyPlacement(id); refPending() }
    finally { setActing(null) }
  }

  return (
    <div className="fade-up">
      <div className="page-header">
        <h1>Academic Oversight</h1>
        <p>Monitor students, approve placements and track course completions</p>
      </div>

      <div className="stats-grid stats-4">
        <StatCard label="Active Placements"  value={active}              color="c-blue"  sub="Students on placement" />
        <StatCard label="Pending Approval"   value={pending?.length ?? 0} color={pending?.length > 0 ? 'c-amber' : ''} sub="Need your sign-off" />
        <StatCard label="Safety Issues"      value={openSafety.length}   color={openSafety.length > 0 ? 'c-red' : ''} sub="Open reports" />
        <StatCard label="Completions"        value={completed}            color="c-green" sub="Courses finished" />
      </div>

      {openSafety.length > 0 && (
        <Alert variant="red">
          {openSafety.length} unresolved safety report{openSafety.length > 1 ? 's' : ''} from your students.{' '}
          <Link to="/academic/placements" style={{ color: 'var(--red)', textDecoration: 'underline' }}>Review now</Link>
        </Alert>
      )}

      <div className="grid-2">
        {/* Students */}
        <Card title="My Students" action={<Link to="/academic/students" className="btn btn-sm">View all</Link>}>
          {placements?.length > 0 ? placements.slice(0,6).map(p => (
            <div className="item-row" key={p.id}>
              <div className="item-icon icon-blue">{(p.student_name||'S').slice(0,2).toUpperCase()}</div>
              <div className="item-body">
                <div className="item-name">{p.student_name}</div>
                <div className="item-meta">{p.company_name} · {p.department}</div>
              </div>
              <Badge variant={p.is_approved ? 'green' : 'amber'}>
                {p.is_approved ? 'Active' : 'Pending'}
              </Badge>
            </div>
          )) : <Empty text="No students assigned" />}
        </Card>

        <div>
          {/* Pending placements */}
          {pending?.length > 0 && (
            <Card title="Pending Approvals" subtitle="Review before signing off" style={{ marginBottom: 16 }}>
              {pending.map(p => (
                <div key={p.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ marginBottom: 6 }}>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{p.student_name}</div>
                    <div style={{ color: 'var(--text3)', fontSize: 12 }}>{p.company_name} — {p.department}</div>
                    <div style={{ color: 'var(--text3)', fontSize: 11, marginTop: 2 }}>{p.start_date} → {p.end_date}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDeny(p.id)}    disabled={acting===p.id}>Deny</button>
                    <button className="btn btn-sm btn-primary" onClick={() => handleApprove(p.id)} disabled={acting===p.id}>
                      {acting===p.id ? 'Saving…' : 'Approve'}
                    </button>
                  </div>
                </div>
              ))}
            </Card>
          )}

          {/* Course completions */}
          <Card title="Course Completion" subtitle="Hours progress by student">
            {courses?.length > 0 ? courses.slice(0,5).map(c => (
              <div className="item-row" key={c.id}>
                <div className="item-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div className="item-name">{c.student_name}</div>
                    <Badge variant={c.is_completed ? 'green' : 'amber'}>
                      {c.is_completed ? 'Done' : `${c.approved_hours}/${c.minimum_hours_required}`}
                    </Badge>
                  </div>
                  <div className="item-meta" style={{ marginBottom: 5 }}>{c.course_name}</div>
                  <Progress
                    value={c.approved_hours}
                    max={c.minimum_hours_required}
                    color={c.is_completed ? 'fill-green' : 'fill-amber'}
                  />
                </div>
              </div>
            )) : <Empty text="No course data" />}
          </Card>
        </div>
      </div>
    </div>
  )
}
