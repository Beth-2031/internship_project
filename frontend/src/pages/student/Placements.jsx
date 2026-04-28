import { useFetch } from '../../hooks/useFetch'
import { Card, Progress } from '../../components/ui'
import { getMyPlacement } from '../../api/client'
import Placements from '../../components/ui/placements'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Simple progress calculator (weeks over 26-week internship)
function progressPercent(startDate, endDate) {
  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)
  const total = end - start
  const elapsed = Math.max(0, now - start)
  return Math.min(100, (elapsed / total) * 100)
}

export default function StudentPlacements() {
  const navigate = useNavigate()
  const { data: placement, loading } = useFetch(getMyPlacement)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (placement) {
      setProgress(progressPercent(placement.start_date, placement.end_date))
    }
  }, [placement])

  if (!placement) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 0' }}>
        <Card title="Your Placement">
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text3)' }}>
            <div style={{ fontSize: 64, marginBottom: 16, opacity: 0.5 }}>📋</div>
            <div style={{ fontSize: 18, marginBottom: 8 }}>No active placement</div>
            <div style={{ marginBottom: 20 }}>Submit a request and your supervisor will review it.</div>
            <button className="btn btn-primary" onClick={() => navigate('/student/placements/request')}>
              Request Placement
            </button>
          </div>
        </Card>
      </div>
    )
  }

  const currentWeek = Math.min(26, Math.floor(progress / 100 * 26) + 1)

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <h1>My Internship Placement</h1>
        <p>Details and progress for your current placement</p>
      </div>

      <Card title={placement.company_name} subtitle={`${placement.department} · ${placement.location}`}>
        <div style={{ display: 'grid', gap: 20, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>Duration</div>
            <div style={{ fontSize: 14, color: 'var(--text2)' }}>
              {placement.start_date} → {placement.end_date}
            </div>
          </div>
          
          <div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>Progress</div>
            <Progress value={progress} max={100} color="fill-blue" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>
              <span>Week {currentWeek} of 26</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
          </div>

          <div style={{ fontSize: 12, color: 'var(--text3)' }}>
            <div>Workplace Supervisor: <strong>{placement.workplace_supervisor_name || '—'}</strong></div>
            <div style={{ marginTop: 4 }}>Academic Supervisor: <strong>{placement.academic_supervisor_name || '—'}</strong></div>
          </div>
        </div>

        <Placements data={[placement]} loading={loading} emptyText="" />
      </Card>
    </div>
  )
}

