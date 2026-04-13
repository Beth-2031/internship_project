import { useState } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { Link, useNavigate } from 'react-router-dom'
import { Card, Badge, ActionButton, Empty } from '../../components/ui'
import { adminApprovePlacement, adminDenyPlacement, getAllPlacements } from '../../api/client'
import Placements from '../../components/ui/placements'

export default function AdminPlacements() {
  const { data: placements, loading, refetch } = useFetch(getAllPlacements)
  const [acting, setActing] = useState(null)
  const navigate = useNavigate()

  const pending = placements?.filter(p => !p.is_approved) ?? []
  const approvedCount = placements?.length - pending.length ?? 0

  const handleApprove = async (id) => {
    setActing(id)
    try {
      await adminApprovePlacement(id)
      refetch()
    } catch {
      alert('Failed to approve placement')
    } finally {
      setActing(null)
    }
  }

  const handleDeny = async (id) => {
    if (!confirm('Reject this placement? It will be permanently removed.')) return
    setActing(id)
    try {
      await adminDenyPlacement(id)
      refetch()
    } catch {
      alert('Failed to deny placement')
    } finally {
      setActing(null)
    }
  }

  const renderActions = (placement) => (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {placement.is_approved ? (
        <Badge variant="green">Approved</Badge>
      ) : (
        <>
          <ActionButton 
            onClick={() => handleApprove(placement.id)} 
            variant="green" 
            small 
            loading={acting === placement.id}
          >
            Approve
          </ActionButton>
          <ActionButton 
            onClick={() => handleDeny(placement.id)} 
            variant="red" 
            small 
            loading={acting === placement.id}
          >
            Deny
          </ActionButton>
        </>
      )}
    </div>
  )

  const headerActions = () => (
    <div className="stats-grid stats-2" style={{ marginBottom: 24 }}>
      <div className="stat-card">
        <div className="stat-label">Total Placements</div>
        <div className="stat-value c-blue">{placements?.length ?? 0}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Pending Approval</div>
        <div className="stat-value c-amber">{pending.length}</div>
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <h1>Manage Placements</h1>
        <p>Review and approve internship placements for all students</p>
      </div>
      
      <Card title="All Placements" subtitle={`${pending.length} pending approval`}>
        <Placements 
          data={placements} 
          loading={loading} 
          actionsRenderer={renderActions}
          headerActions={headerActions}
        />
      </Card>
    </div>
  )
}

