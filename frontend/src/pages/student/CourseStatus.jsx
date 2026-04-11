import { getCourseCompletion } from '../../api/client'
import { useFetch } from '../../hooks/useFetch'
import { Card, Badge, Progress, LoadingScreen, Alert } from '../../components/ui'

export default function CourseStatus() {
  const { data: course, loading } = useFetch(getCourseCompletion)
  if (loading) return <LoadingScreen />

  if (!course) return (
    <div className="fade-up">
      <div className="page-header"><h1>Course Status</h1></div>
      <Alert variant="amber">No course completion record found. Contact your academic supervisor.</Alert>
    </div>
  )

  const pct     = Math.min(100, Math.round((course.approved_hours / course.minimum_hours_required) * 100))
  const remaining = Math.max(0, course.minimum_hours_required - course.approved_hours)

  return (
    <div className="fade-up" style={{ maxWidth: 600 }}>
      <div className="page-header">
        <h1>Course Status</h1>
        <p>{course.course_name}</p>
      </div>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 700 }}>{course.course_name}</div>
          <Badge variant={course.is_completed ? 'green' : 'amber'}>
            {course.is_completed ? 'Completed' : 'In Progress'}
          </Badge>
        </div>

        {/* Big progress display */}
        <div style={{ textAlign: 'center', padding: '24px 0', marginBottom: 24 }}>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: 56, fontWeight: 700, letterSpacing: '-.04em', color: course.is_completed ? 'var(--accent)' : 'var(--blue)', lineHeight: 1 }}>
            {pct}%
          </div>
          <div style={{ color: 'var(--text3)', fontSize: 13, marginTop: 8 }}>of required hours completed</div>
        </div>

        <Progress
          value={course.approved_hours}
          max={course.minimum_hours_required}
          color={course.is_completed ? 'fill-green' : 'fill-blue'}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 20 }}>
          {[
            ['Approved Hours',  course.approved_hours, 'c-green'],
            ['Hours Required',  course.minimum_hours_required, 'c-blue'],
            ['Remaining',       remaining, remaining === 0 ? 'c-green' : 'c-amber'],
          ].map(([label, val, color]) => (
            <div key={label} style={{ background: 'var(--surface2)', borderRadius: 'var(--radius)', padding: '12px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text3)', marginBottom: 6 }}>{label}</div>
              <div className={`stat-value ${color}`} style={{ fontSize: 22 }}>{val}</div>
            </div>
          ))}
        </div>

        {course.is_completed && (
          <div className="alert alert-green" style={{ marginTop: 20, marginBottom: 0 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span>Congratulations! You have met the minimum hour requirement for this course.</span>
          </div>
        )}
      </Card>
    </div>
  )
}
