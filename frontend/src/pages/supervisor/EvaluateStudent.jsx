import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { createEvaluation, updateEvaluation, getEvaluation } from '../../api/client'
import { Card, LoadingScreen, Alert } from '../../components/ui'
import { useAuth } from '../../context/Authcontext'

export default function EvaluateStudent() {
  const { placementId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const [evaluation, setEvaluation] = useState({
    supervisor_score: 0,
    logbook_score: 0,
    academic_score: 0,
    is_submitted: false
  })
  const [existingId, setExistingId] = useState(null)

  useEffect(() => {
    const fetchEvaluation = async () => {
      try {
        const res = await getEvaluation()
        const existing = res.data.find(e => e.placement === parseInt(placementId))
        if (existing) {
          setEvaluation({
            supervisor_score: existing.supervisor_score,
            logbook_score: existing.logbook_score,
            academic_score: existing.academic_score,
            is_submitted: existing.is_submitted
          })
          setExistingId(existing.id)
        }
      } catch (err) {
        console.error('Failed to fetch evaluation:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchEvaluation()
  }, [placementId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    
    const payload = {
      ...evaluation,
      placement: parseInt(placementId),
      is_submitted: true
    }

    try {
      if (existingId) {
        await updateEvaluation(existingId, payload)
      } else {
        await createEvaluation(payload)
      }
      setSuccess(true)
      setTimeout(() => {
        navigate(user.user_type === 'workplace_supervisor' ? '/supervisor/students' : '/academic/students')
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save evaluation. Please check your inputs.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingScreen />

  const isWorkplace = user.user_type === 'workplace_supervisor'
  const isAcademic = user.user_type === 'academic_supervisor'

  return (
    <div className="fade-up" style={{ maxWidth: 600 }}>
      <div className="page-header">
        <h1>Student Evaluation</h1>
        <p>Assign scores based on performance and logbook quality</p>
      </div>

      {success && <Alert variant="green">Evaluation submitted successfully!</Alert>}
      {error && <Alert variant="red">{error}</Alert>}

      <Card title="Assessment Scores">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Workplace Supervisor Score (40%)</label>
            <input
              type="number"
              className="form-control"
              min="0"
              max="100"
              step="0.1"
              value={evaluation.supervisor_score}
              onChange={e => setEvaluation({ ...evaluation, supervisor_score: e.target.value })}
              disabled={!isWorkplace && user.user_type !== 'internship_admin'}
              required
            />
            <small className="form-hint">Score from 0 to 100</small>
          </div>

          <div className="form-group">
            <label className="form-label">Logbook Score (30%)</label>
            <input
              type="number"
              className="form-control"
              min="0"
              max="100"
              step="0.1"
              value={evaluation.logbook_score}
              onChange={e => setEvaluation({ ...evaluation, logbook_score: e.target.value })}
              disabled={!isAcademic && user.user_type !== 'internship_admin'}
              required
            />
            <small className="form-hint">Score from 0 to 100</small>
          </div>

          <div className="form-group">
            <label className="form-label">Academic Score (30%)</label>
            <input
              type="number"
              className="form-control"
              min="0"
              max="100"
              step="0.1"
              value={evaluation.academic_score}
              onChange={e => setEvaluation({ ...evaluation, academic_score: e.target.value })}
              disabled={!isAcademic && user.user_type !== 'internship_admin'}
              required
            />
            <small className="form-hint">Score from 0 to 100</small>
          </div>

          <div className="form-actions">
            <Link 
              to={isWorkplace ? '/supervisor/students' : '/academic/students'} 
              className="btn"
            >
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Submit Evaluation'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  )
}
