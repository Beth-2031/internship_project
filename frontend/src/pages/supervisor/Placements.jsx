import { useFetch } from '../../hooks/useFetch'
import { Card } from '../../components/ui'
import { getSupervisorStudents } from '../../api/client'
import Placements from '../../components/ui/placements'

export default function SupervisorPlacements() {
  const { data: students, loading } = useFetch(getSupervisorStudents)

  const renderActions = (placement) => null // No actions for supervisor view

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <h1>My Students' Placements</h1>
        <p>Overview of placements for students you supervise</p>
      </div>

      <Card title="Active Student Placements" subtitle={students?.length ? `${students.length} students` : ''}>
        <Placements 
          data={students} 
          loading={loading} 
          emptyText="No students assigned to you yet"
          actionsRenderer={renderActions}
        />
      </Card>
    </div>
  )
}

