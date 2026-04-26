import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPlacement } from '../../api/client'
import { Card, Alert } from '../../components/ui'

export default function RequestPlacement() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    company_name: '',
    location: '',
    department: '',
    start_date: '',
    end_date: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await createPlacement(form)
      setSuccess(true)
      setTimeout(() => navigate('/student/placements'), 1200)
    } catch (err) {
      const msg = err?.response?.data?.detail
        || JSON.stringify(err?.response?.data)
        || 'Failed to submit placement request. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fade-up" style={{ maxWidth: 700 }}>
      <div className="page-header">
        <h1>Request Placement</h1>
        <p>Submit your internship details for approval</p>
      </div>

      {success && <Alert variant="green">Placement request submitted successfully! Redirecting…</Alert>}
      {error && <Alert variant="red">{error}</Alert>}

      <Card title="Internship Details">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input
                className="form-control"
                type="text"
                required
                placeholder="e.g. Acme Corporation"
                value={form.company_name}
                onChange={e => set('company_name', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <input
                className="form-control"
                type="text"
                required
                placeholder="e.g. Software Engineering"
                value={form.department}
                onChange={e => set('department', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Location</label>
            <input
              className="form-control"
              type="text"
              required
              placeholder="e.g. Kampala, Uganda"
              value={form.location}
              onChange={e => set('location', e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                className="form-control"
                type="date"
                required
                value={form.start_date}
                onChange={e => set('start_date', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                className="form-control"
                type="date"
                required
                value={form.end_date}
                onChange={e => set('end_date', e.target.value)}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn" onClick={() => navigate('/student/placements')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting…' : 'Request Placement'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  )
}
