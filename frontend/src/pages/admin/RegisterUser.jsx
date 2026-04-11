import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createUser } from '../../api/client'
import { Card, Alert } from '../../components/ui'

const USER_TYPES = [
  { value: 'student',              label: 'Student' },
  { value: 'workplace_supervisor', label: 'Workplace Supervisor' },
  { value: 'academic_supervisor',  label: 'Academic Supervisor' },
  { value: 'internship_admin',     label: 'Internship Administrator' },
]

export default function RegisterUser() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    first_name: '', last_name: '', username: '',
    email: '', password: '', user_type: 'student', skills: '',
  })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

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
              <label className="form-label">Username</label>
              <input className="form-control" required value={form.username} onChange={e => set('username', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-control" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
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