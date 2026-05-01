import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createUser, getUsers } from '../../api/client'
import { Card, Alert } from '../../components/ui'

const USER_TYPES = [
  { value: 'student',              label: 'Student' },
  { value: 'workplace_supervisor', label: 'Workplace Supervisor' },
  { value: 'academic_supervisor',  label: 'Academic Supervisor' },
]

export default function RegisterUser() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    first_name: '', last_name: '',
    email: '', password: '', user_type: 'student', skills: '',
    assigned_students: [],
  })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [students, setStudents] = useState([])
  const [studentsLoading, setStudentsLoading] = useState(true)

  useEffect(() => {
    getUsers('student')
      .then(res => setStudents(res.data || []))
      .catch(() => setStudents([]))
      .finally(() => setStudentsLoading(false))
  }, [])

  const isSupervisor = form.user_type === 'workplace_supervisor' || form.user_type === 'academic_supervisor'

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await createUser(form)
      setSuccess(true)
      setTimeout(() => navigate('/admin/users'), 1000)
    } catch (err) {
      setError(err?.response?.data ? JSON.stringify(err.response.data) : 'Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fade-up" style={{ maxWidth: 600 }}>
      <div className="page-header">
        <h1>Register New User</h1>
        <p>Add a student, supervisor, or administrator to the system</p>
      </div>

      {success && <Alert variant="green">User registered successfully! Redirecting…</Alert>}
      {error   && <Alert variant="red">{error}</Alert>}

      <Card>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input className="form-control" required value={form.first_name} onChange={e => set('first_name', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input className="form-control" required value={form.last_name} onChange={e => set('last_name', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-control" type="email" required value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-control" type="password" required value={form.password} onChange={e => set('password', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-control" value={form.user_type} onChange={e => set('user_type', e.target.value)}>
                {USER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Skills (optional)</label>
            <textarea className="form-control" rows={3}
              placeholder="e.g. Python, data analysis, project management..."
              value={form.skills} onChange={e => set('skills', e.target.value)}
            />
          </div>

          {isSupervisor && (
            <div className="form-group">
              <label className="form-label">Assign Students</label>
              {studentsLoading ? (
                <p>Loading students…</p>
              ) : students.length === 0 ? (
                <p>No students found.</p>
              ) : (
                <select
                  className="form-control"
                  multiple
                  size={Math.min(6, students.length)}
                  value={form.assigned_students}
                  onChange={e => {
                    const opts = Array.from(e.target.selectedOptions).map(o => parseInt(o.value))
                    set('assigned_students', opts)
                  }}
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.first_name} {s.last_name} ({s.email})
                    </option>
                  ))}
                </select>
              )}
              <small className="form-hint">Hold Ctrl (or Cmd) to select multiple students.</small>
            </div>
          )}
          <div className="form-actions">
            <button type="button" className="btn" onClick={() => navigate('/admin/users')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Registering…' : 'Register User'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  )
}