import { useState } from 'react'
import { getSupervisorStudents } from '../../api/client'
import { useFetch } from '../../hooks/useFetch'
import { Card, Badge, Progress, Empty, LoadingScreen } from '../../components/ui'
import { Link } from 'react-router-dom'

export default function SupervisorStudents() {
  const [filter, setFilter] = useState('')
  const { data: students, loading } = useFetch(getSupervisorStudents)
  
  if (loading) return <LoadingScreen />

  const filtered = students?.filter(p => 
    p.student_name?.toLowerCase().includes(filter.toLowerCase()) ||
    p.company_name?.toLowerCase().includes(filter.toLowerCase()) ||
    p.department?.toLowerCase().includes(filter.toLowerCase()) ||
    p.location?.toLowerCase().includes(filter.toLowerCase())
  ) ?? []

  return (
    <div className="fade-up">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>My Students</h1>
          <p>{students?.length ?? 0} students assigned to you</p>
        </div>
        <input 
          type="text" 
          placeholder="Search students..." 
          className="form-control"
          style={{ width: 240 }}
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
      </div>
      <Card>
        {filtered.length > 0 ? filtered.map(p => (
          <div key={p.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div className="item-icon icon-blue">{(p.student_name || 'S').slice(0,2).toUpperCase()}</div>
              <div className="item-body">
                <div className="item-name">{p.student_name}</div>
                <div className="item-meta">{p.company_name} · {p.department} · {p.location}</div>
              </div>
              <Badge variant={p.is_approved ? 'green' : 'amber'}>
                {p.is_approved ? 'Active' : 'Pending'}
              </Badge>
            </div>
            <div style={{ display: 'flex', gap: 20, fontSize: 12, color: 'var(--text3)', marginBottom: 8, paddingLeft: 48 }}>
              <span>Start: <strong style={{ color: 'var(--text)' }}>{p.start_date}</strong></span>
              <span>End: <strong style={{ color: 'var(--text)' }}>{p.end_date}</strong></span>
              <span>Logs: <strong style={{ color: 'var(--text)' }}>{p.logs_count ?? 0}</strong></span>
            </div>
            <div style={{ paddingLeft: 48 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>
                <span>Progress</span><span>{p.progress_percent ?? 0}%</span>
              </div>
              <Progress value={p.progress_percent ?? 0} color="fill-blue" />
            </div>
            <div style={{ paddingLeft: 48, marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
              <Link to={`/supervisor/evaluate/${p.id}`} className="btn btn-sm btn-primary">
                Evaluate Student
              </Link>
            </div>
          </div>
        )) : <Empty text={filter ? "No students match your search" : "No students assigned yet"} />}
      </Card>
    </div>
  )
}
