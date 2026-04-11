import { useState } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { Link, useNavigate } from 'react-router-dom'
import { Card, Badge, ActionButton } from '../../components/ui'
import { getAcademicPlacements, getPendingPlacements, approvePlacement, denyPlacement } from '../../api/client'
import Placements from '../../components/ui/placements'

export default function AcademicPlacements() {
  const { data: placements, loading: lp } = useFetch(getAcademicPlacements)
  const { data: pending, loading: lpd, refetch } = useFetch(getPendingPlacements)
  const [acting, setActing] = useState(null)

  const handleApprove = async (id) => {
    setActing(id)
    try {
      await approvePlacement(id)
      refetch()
    } catch {
      alert('Failed to approve')
    } finally {
      setActing(null)
    }
  }

  const handleDeny = async (id) => {
    if (!confirm('Deny this placement request?')) return
    setActing(id)
    try {
      await denyPlacement(id)
      refetch()
    } catch {
      alert('Failed to deny')
    } finally {
      setActing(null)
    }
  }

  const renderPendingActions = (placement) => (
    <div style={{ display: 'flex', gap: 6 }}>
      <ActionButton onClick={() => handleApprove(placement.id)} variant="green" small loading={acting === placement.id}>
        Approve
      </ActionButton>
      <ActionButton onClick={() => handleDeny(placement.id)} variant="red" small loading={acting === placement.id}>
        Deny
      </ActionButton>
    </div>
  )

  const renderStudentActions = (placement) => (
    <Badge variant="green">Active</Badge>
  )

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <h1>My Students' Placements</h1>
        <p>Oversee placements for students under your supervision</p>
      </div>

      {pending?.length > 0 && (
        <Card title="Pending Approvals" subtitle={`Review ${pending.length} placement requests`} style={{ marginBottom: 24 }}>
          <Placements 
            data={pending} 
            loading={lpd} 
            emptyText="No pending requests"
            actionsRenderer={renderPendingActions}
          />
        </Card>
      )}

      <Card title="Active Placements" subtitle={`${placements?.filter(p => p.is_approved)?.length ?? 0} students`}>
        <Placements 
          data={placements} 
          loading={lp} 
          emptyText="No active placements"
          actionsRenderer={renderStudentActions}
        />
      </Card>
    </div>
  )
}

