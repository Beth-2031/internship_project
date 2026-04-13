import { useState } from 'react'
import { submitSafetyReport, getSafetyReports } from '../../api/client'
import { useFetch } from '../../hooks/useFetch'
import { Card, Badge, Alert, Empty } from '../../components/ui'

export default function SafetyReport() {
  const { data: reports, refetch } = useFetch(getSafetyReports)
  const [description, setDesc]    = useState('')
  const [loading, setLoading]     = useState(false)
  const [success, setSuccess]     = useState(false)
  const [error,   setError]       = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    if (!description.trim()) return
    setLoading(true); setError(''); setSuccess(false)
    try {
      await submitSafetyReport({ description })
      setDesc(''); setSuccess(true); refetch()
    } catch {
      setError('Failed to submit report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fade-up" style={{ maxWidth: 700 }}>
      <div className="page-header">
        <h1>Safety Reports</h1>
        <p>Report unsafe conditions or incidents at your placement</p>
      </div>

      {success && <Alert variant="green">Safety report submitted successfully.</Alert>}
      {error   && <Alert variant="red">{error}</Alert>}

      <div className="alert alert-amber">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <span>Report any hazardous conditions, injuries, or unsafe practices immediately. Reports are reviewed by your supervisors.</span>
      </div>

      <Card title="File New Report" style={{ marginBottom: 18 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-control" rows={5} required
              placeholder="Describe the unsafe condition or incident in detail..."
              value={description}
              onChange={e => setDesc(e.target.value)}
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-danger" disabled={loading}>
              {loading ? 'Submitting…' : 'Submit Report'}
            </button>
          </div>
        </form>
      </Card>

      <Card title="My Reports" subtitle="Previously filed reports">
        {reports?.length > 0 ? reports.map(r => (
          <div className="item-row" key={r.id}>
            <div className={`item-icon ${r.is_resolved ? 'icon-green' : 'icon-red'}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
            </div>
            <div className="item-body">
              <div className="item-name">{r.description?.substring(0, 70)}{r.description?.length > 70 ? '…' : ''}</div>
              <div className="item-meta">Reported: {r.date_reported}</div>
            </div>
            <Badge variant={r.is_resolved ? 'green' : 'red'}>
              {r.is_resolved ? 'Resolved' : 'Open'}
            </Badge>
          </div>
        )) : <Empty text="No safety reports filed" />}
      </Card>
    </div>
  )
}
