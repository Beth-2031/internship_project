import { getAcademicPlacements } from '../../api/client'
import { useFetch } from '../../hooks/useFetch'
import { Card, Badge, Progress, Empty, LoadingScreen } from '../../components/ui'

export default function AcademicStudents() {
  const { data: placements, loading } = useFetch(getAcademicPlacements)
  if (loading) return <LoadingScreen />

  return (
    <div className="fade-up">
      <div className="page-header">
        <h1>My Students</h1>
        <p>{placements?.length ?? 0} students under your academic supervision</p>
      </div>
      <Card>
        {placements?.length > 0 ? placements.map(p => (
          <div key={p.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div className="item-icon icon-blue">{(p.student_name||'S').slice(0,2).toUpperCase()}</div>
              <div className="item-body">
                <div className="item-name">{p.student_name}</div>
                <div className="item-meta">{p.company_name} · {p.department}</div>
              </div>
              <Badge variant={p.is_approved ? 'green' : 'amber'}>
                {p.is_approved ? 'Active' : 'Pending'}
              </Badge>
            </div>
            <div style={{ paddingLeft: 48 }}>
              <Progress value={p.progress_percent ?? 0} color="fill-blue" />
            </div>
          </div>
        )) : <Empty text="No students assigned" />}
      </Card>
    </div>
  )
}
