import { getCourseCompletions } from '../../api/client'
import { useFetch } from '../../hooks/useFetch'
import { Card, Badge, Progress, Empty, LoadingScreen } from '../../components/ui'

export default function CourseCompletions() {
  const { data: courses, loading } = useFetch(getCourseCompletions)
  if (loading) return <LoadingScreen />

  return (
    <div className="fade-up">
      <div className="page-header">
        <h1>Course Completions</h1>
        <p>Track your students' hour requirements</p>
      </div>
      <Card>
        {courses?.length > 0 ? courses.map(c => (
          <div key={c.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{c.student_name}</div>
                <div style={{ color: 'var(--text3)', fontSize: 12 }}>{c.course_name}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: 'var(--text3)' }}>{c.approved_hours}/{c.minimum_hours_required} hrs</span>
                <Badge variant={c.is_completed ? 'green' : 'amber'}>
                  {c.is_completed ? 'Complete' : 'In Progress'}
                </Badge>
              </div>
            </div>
            <Progress
              value={c.approved_hours}
              max={c.minimum_hours_required}
              color={c.is_completed ? 'fill-green' : 'fill-amber'}
            />
          </div>
        )) : <Empty text="No course completion records" />}
      </Card>
    </div>
  )
}
