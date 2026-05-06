import { useState } from 'react'
import { getAllPlacements, adminApprovePlacement, adminDenyPlacement, getAllSafetyReports, resolveReport, getAdminStats, exportData, getEvaluation  } from '../../api/client'
import { useFetch } from '../../hooks/useFetch'
import { StatCard, Card, Badge, Alert, Empty, LoadingScreen } from '../../components/ui'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function AdminDashboard() {
  const { data: placements, loading: lp, refetch: refPl } = useFetch(getAllPlacements)
  const { data: safety,     loading: ls, refetch: refSf } = useFetch(getAllSafetyReports)
  const { data: stats,      loading: lst }                = useFetch(getAdminStats)
  const { data: evaluations, loading:le }                     = useFetch(getEvaluation)
  const [acting, setActing]     = useState(null)
  const [exporting, setExporting] = useState(false)

  if (lp || ls || lst) return <LoadingScreen />

  const pending    = placements?.filter(p => !p.is_approved) ?? []
  const openSafety = safety?.filter(r => !r.is_resolved) ?? []

  const handleApprove = async id => {
    setActing(id)
    try { await adminApprovePlacement(id); refPl() }
    finally { setActing(null) }
  }
  const handleDeny = async id => {
    if (!confirm('Reject and remove this placement?')) return
    setActing(id)
    try { await adminDenyPlacement(id); refPl() }
    finally { setActing(null) }
  }
  const handleResolve = async id => {
    setActing(id)
    try { await resolveReport(id); refSf() }
    finally { setActing(null) }
  }
  const handleExport = async type => {
    setExporting(true)
    try {
      const res = await exportData(type)
      const url  = URL.createObjectURL(res.data)
      const a    = document.createElement('a')
      a.href = url; a.download = `${type}.csv`; a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }
   const chartData = [
    { name: 'Pending', value: placements?.filter(p => !p.is_approved).length || 0 },
    { name: 'Approved', value: placements?.filter(p => p.is_approved).length || 0 },
  ]
  const COLORS = ['#16a34a', '#f59e0b']

  return (
    <div className="fade-up">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Admin Panel</h1>
          <p>System-wide overview and management</p>
        </div>
        <Link to="/admin/placements" className="btn btn-primary">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add User
        </Link>
      </div>

      <div className="stats-grid stats-4">
        <StatCard label="Total Placements"  value={stats?.total_placements ?? placements?.length ?? 0} color="c-blue"   sub="All time" />
        <StatCard label="Awaiting Approval" value={pending.length}  color={pending.length > 0 ? 'c-amber' : ''} sub="Need action" />
        <StatCard label="Safety Reports"    value={openSafety.length} color={openSafety.length > 0 ? 'c-red' : ''}  sub="Unresolved" />
        <StatCard label="Completions"       value={stats?.completed ?? 0} color="c-green" sub="Students finished" />
        <StatCard label="Average Score"        value={evaluations?.length > 0 ? (evaluations.reduce((sum, e) => sum + parseFloat(e.total_score), 0) / evaluations.length).toFixed(2) : 'N/A' }
        />
        <Card title="placement Approval Stats" style={{ marginTop: 16 }}>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
              >
                  {chartData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index]} />
                  ))}
                  </Pie>
                  <Tooltip />
              </PieChart>
          </ResponsiveContainer> 
        </Card>
      </div>

      {openSafety.map(r => (
        <Alert key={r.id} variant="red">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <span><strong>{r.student_name}</strong> — {r.description?.substring(0, 90)}…</span>
            <button
              className="btn btn-sm"
              onClick={() => handleResolve(r.id)}
              disabled={acting === r.id}
              style={{ flexShrink: 0 }}
            >
              {acting === r.id ? 'Saving…' : 'Resolve'}
            </button>
          </div>
        </Alert>
      ))}

      <div className="grid-2">
        {/* Pending placements */}
        <Card
          title="Pending Placements"
          subtitle="Awaiting administrator approval"
          action={<Link to="/admin/placements" className="btn btn-sm">View all</Link>}
        >
          {pending.length > 0 ? pending.slice(0,4).map(p => (
            <div key={p.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{p.student_name}</div>
                <div style={{ color: 'var(--text3)', fontSize: 12 }}>{p.company_name} · {p.department}</div>
                <div style={{ color: 'var(--text3)', fontSize: 11, marginTop: 2 }}>
                  {p.location} · {p.start_date} – {p.end_date}
                </div>
                <div style={{ color: 'var(--text3)', fontSize: 11, marginTop: 2 }}>
                  WS: {p.workplace_supervisor_name ?? '—'} · AS: {p.academic_supervisor_name ?? '—'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button className="btn btn-sm btn-danger" onClick={() => handleDeny(p.id)}    disabled={acting===p.id}>Reject</button>
                <button className="btn btn-sm btn-primary" onClick={() => handleApprove(p.id)} disabled={acting===p.id}>
                  {acting===p.id ? 'Saving…' : 'Approve'}
                </button>
              </div>
            </div>
          )) : <Empty text="No pending placements" />}
        </Card>

        <div>
          {/* Recent placements */}
          <Card
            title="Recent Placements"
            subtitle="Latest registrations"
            action={<Link to="/admin/placements" className="btn btn-sm">View all</Link>}
            style={{ marginBottom: 16 }}
          >
            {placements?.length > 0 ? [...placements].sort((a,b) => new Date(b.start_date)-new Date(a.start_date)).slice(0,5).map(p => (
              <div className="item-row" key={p.id}>
                <div className="item-icon icon-purple">{(p.student_name||'S').slice(0,2).toUpperCase()}</div>
                <div className="item-body">
                  <div className="item-name">{p.student_name}</div>
                  <div className="item-meta">{p.company_name}</div>
                </div>
                <Badge variant={p.is_approved ? 'green' : 'amber'}>
                  {p.is_approved ? 'Active' : 'Pending'}
                </Badge>
              </div>
            )) : <Empty text="No placements yet" />}
          </Card>

          {/* User counts + export */}
          <Card title="Quick Actions">
            <div className="item-row">
              <div className="item-icon icon-blue">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              </div>
              <div className="item-body">
                <div className="item-name">{stats?.students ?? '—'} students</div>
                <div className="item-meta">Registered in system</div>
              </div>
              <Link to="/admin/placements" className="btn btn-sm">Manage</Link>
            </div>
            <div className="item-row">
              <div className="item-icon icon-green">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/></svg>
              </div>
              <div className="item-body">
                <div className="item-name">{stats?.supervisors ?? '—'} workplace supervisors</div>
              </div>
              <Link to="/admin/placements" className="btn btn-sm">Manage</Link>
            </div>
            <div className="divider" />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['placements','logs','safety'].map(t => (
                <button key={t} className="btn btn-sm" onClick={() => handleExport(t)} disabled={exporting}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                  Export {t}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
