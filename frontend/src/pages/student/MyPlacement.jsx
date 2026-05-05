import { getMyPlacement } from '../../api/client'
import { useFetch } from '../../hooks/useFetch'
import { Card, Badge, Progress, LoadingScreen, Alert } from '../../components/ui'

function pct(start, end) {
  const now = Date.now(), s = new Date(start).getTime(), e = new Date(end).getTime()
  const total = e - s
  if (!total || total <= 0) return 0
  return Math.min(100, Math.max(0, Math.round(((now - s) / total) * 100)))
}

export default function MyPlacement() {
  const { data: p, loading } = useFetch(getMyPlacement)
  if (loading) return <LoadingScreen />

  if (!p) return (
    <div className="fade-up">
      <div className="page-header"><h1>My Placement</h1></div>
      <Alert variant="amber">No active placement found. Contact your academic supervisor to get assigned.</Alert>
    </div>
  )

  const progress = pct(p.start_date, p.end_date)

  return (
    <div className="fade-up" style={{ maxWidth: 720 }}>
      <div className="page-header">
        <h1>My Placement</h1>
        <p>{p.company_name}</p>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 700, letterSpacing: '-.03em' }}>
              {p.company_name}
            </div>
            <div style={{ color: 'var(--text3)', fontSize: 13, marginTop: 4 }}>
              {p.department} · {p.location}
            </div>
          </div>
          <Badge variant={p.is_approved ? 'green' : 'amber'}>
            {p.is_approved ? 'Approved' : 'Pending Approval'}
          </Badge>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          {[
            ['Start Date',   p.start_date],
            ['End Date',     p.end_date],
            ['Department',   p.department],
            ['Location',     p.location],
            ['Workplace Supervisor',  p.workplace_supervisor_name  ?? '—'],
            ['Academic Supervisor',   p.academic_supervisor_name   ?? '—'],
          ].map(([label, val]) => (
            <div key={label} style={{ background: 'var(--surface2)', borderRadius: 'var(--radius)', padding: '10px 14px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text3)', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{val}</div>
            </div>
          ))}
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text3)', marginBottom: 6 }}>
            <span>Placement progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} color="fill-blue" />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text3)', marginTop: 5 }}>
            <span>{p.start_date}</span>
            <span>{p.end_date}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
