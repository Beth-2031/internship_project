import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { submitLog, getWeeklyLogs, getMyPlacement } from '../../api/client'
import { useFetch } from '../../hooks/useFetch'
import { Card, Badge, Alert } from '../../components/ui'

export default function SubmitLog() {
  const navigate = useNavigate()
  const { data: prevLogs } = useFetch(getWeeklyLogs)
  const { data: myPlacement } = useFetch(getMyPlacement)

  const nextWeek = prevLogs?.length
    ? Math.max(...prevLogs.map(l => l.week_number)) + 1
    : 1

  const [form, setForm] = useState({
    week_number: '', tasks_done: '', hours_worked: '',
    challenges_faced: '', next_week_plans: '',
  })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (!myPlacement?.id) {
      setError('No active placement found. Contact your supervisor before submitting logs.')
      return
    }
    setLoading(true)
    try {
      const weekNumber = Number(form.week_number || nextWeek)
      const payload = {
        ...form,
        week_number: weekNumber,
        placement: myPlacement?.id,
      }
      await submitLog(payload)
      setSuccess(true)
      setTimeout(() => navigate('/student/logs'), 1200)
    } catch (err) {
      setError(err?.response?.data?.detail || JSON.stringify(err?.response?.data) || 'Submission failed')
    } finally {
      setLoading(false)
    }
  }

  const sortedPrev = [...(prevLogs || [])].sort((a,b) => b.week_number - a.week_number).slice(0, 5)

  return (
    <div className="fade-up" style={{ maxWidth: 700 }}>
      <div className="page-header">
        <h1>Submit Weekly Log</h1>
        <p>Document your activities and progress for the week</p>
      </div>

      {success && <Alert variant="green">Log submitted successfully! Redirecting…</Alert>}
      {error   && <Alert variant="red">{error}</Alert>}

      <Card title={`Week ${form.week_number || nextWeek} Log`}>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Week Number</label>
              <input
                className="form-control" type="number" min="1" required
                value={form.week_number || nextWeek}
                onChange={e => set('week_number', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Hours Worked</label>
              <input
                className="form-control" type="number" step="0.25" min="0" placeholder="e.g. 40" required
                value={form.hours_worked}
                onChange={e => set('hours_worked', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Tasks Done This Week</label>
            <textarea
              className="form-control" required rows={4}
              placeholder="Describe the main tasks you completed..."
              value={form.tasks_done}
              onChange={e => set('tasks_done', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Challenges Faced</label>
            <textarea
              className="form-control" rows={3}
              placeholder="Any obstacles or difficulties encountered..."
              value={form.challenges_faced}
              onChange={e => set('challenges_faced', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Plans for Next Week</label>
            <textarea
              className="form-control" rows={3}
              placeholder="What do you plan to work on next..."
              value={form.next_week_plans}
              onChange={e => set('next_week_plans', e.target.value)}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn" onClick={() => navigate('/student/logs')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting…' : 'Submit Log'}
            </button>
          </div>
        </form>
      </Card>

      {sortedPrev.length > 0 && (
        <Card title="Previous Submissions" style={{ marginTop: 18 }}>
          {sortedPrev.map(log => (
            <div className="item-row" key={log.id}>
              <div className="week-pill">W{log.week_number}</div>
              <div className="item-body">
                <div className="item-name">{log.hours_worked} hrs — {log.tasks_done?.substring(0,55)}…</div>
                <div className="item-meta">{log.date_submitted}</div>
              </div>
              <Badge variant={log.is_verified ? 'green' : 'amber'}>
                {log.is_verified ? 'Verified' : 'Pending'}
              </Badge>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
