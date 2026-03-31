import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { register } from '../api/client'

const ROLE_ROUTES = {
  student:               '/student',
  workplace_supervisor:  '/supervisor',
  academic_supervisor:   '/academic',
  internship_admin:      '/admin',
}

const USER_TYPES = [
  { value: 'student',              label: 'Student' },
  { value: 'workplace_supervisor', label: 'Workplace Supervisor' },
  { value: 'academic_supervisor',  label: 'Academic Supervisor' },
]

const EMPTY_REGISTER = {
  first_name: '', last_name: '', username: '',
  email: '', password: '', confirm_password: '',
  user_type: 'student', skills: '',
}

function Brand() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 32 }}>
      <div className="brand-logo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      </div>
      <span style={{ fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 700, letterSpacing: '-.03em' }}>
        InternTrack
      </span>
    </div>
  )
}

function Tabs({ active, onChange }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      background: 'var(--surface2)', borderRadius: 'var(--radius)',
      padding: 3, marginBottom: 24, gap: 3,
    }}>
      {['login', 'register'].map(tab => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          style={{
            padding: '8px 0', border: 'none', borderRadius: 6, cursor: 'pointer',
            fontFamily: 'var(--font-head)', fontSize: 13, fontWeight: 600,
            transition: 'all .15s',
            background: active === tab ? 'var(--surface)'  : 'transparent',
            color:      active === tab ? 'var(--text)'     : 'var(--text3)',
            boxShadow:  active === tab ? '0 1px 4px rgba(0,0,0,.3)' : 'none',
          }}
        >
          {tab === 'login' ? 'Sign in' : 'Create account'}
        </button>
      ))}
    </div>
  )
}

function ErrorBox({ msg }) {
  if (!msg) return null
  return (
    <div className="alert alert-red" style={{ marginBottom: 16 }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
      </svg>
      <span>{msg}</span>
    </div>
  )
}

function SuccessBox({ msg }) {
  if (!msg) return null
  return (
    <div className="alert alert-green" style={{ marginBottom: 16 }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      <span>{msg}</span>
    </div>
  )
}

function LoginForm({ onSwitch }) {
  const { login }   = useAuth()
  const navigate    = useNavigate()
  const [form,    setForm]    = useState({ username: '', password: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async e => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const user = await login(form.username, form.password)
      navigate(ROLE_ROUTES[user.user_type] || '/')
    } catch {
      setError('Invalid username or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 19, fontWeight: 700, letterSpacing: '-.03em' }}>Welcome back</h1>
        <p style={{ color: 'var(--text3)', fontSize: 13, marginTop: 3 }}>Sign in to your internship portal</p>
      </div>

      <ErrorBox msg={error} />

      <form onSubmit={handle}>
        <div className="form-group">
          <label className="form-label">Username</label>
          <input
            className="form-control" type="text" placeholder="your.username"
            value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            required autoFocus
          />
        </div>
        <div className="form-group" style={{ marginBottom: 20 }}>
          <label className="form-label">Password</label>
          <input
            className="form-control" type="password" placeholder="••••••••"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            required
          />
        </div>
        <button
          type="submit" className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '11px' }}
          disabled={loading}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--text3)' }}>
        Don't have an account?{' '}
        <button
          onClick={onSwitch}
          style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, fontSize: 13, padding: 0 }}
        >
          Create one
        </button>
      </p>
    </>
  )
}

function RegisterForm({ onSwitch }) {
  const { login }   = useAuth()
  const navigate    = useNavigate()
  const [form,    setForm]    = useState(EMPTY_REGISTER)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    if (!form.first_name.trim())  return 'First name is required'
    if (!form.last_name.trim())   return 'Last name is required'
    if (!form.username.trim())    return 'Username is required'
    if (form.username.length < 3) return 'Username must be at least 3 characters'
    if (!form.password)           return 'Password is required'
    if (form.password.length < 6) return 'Password must be at least 6 characters'
    if (form.password !== form.confirm_password) return 'Passwords do not match'
    return null
  }

  const handle = async e => {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setError(''); setLoading(true)

    // eslint-disable-next-line no-unused-vars
    const { confirm_password, ...payload } = form

    try {
      await register(payload)
      setSuccess('Account created! Signing you in…')
      const user = await login(form.username, form.password)
      navigate(ROLE_ROUTES[user.user_type] || '/')
    } catch (err) {
      const data = err?.response?.data
      if (data) {
        const msg = typeof data === 'string'
          ? data
          : Object.entries(data)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
              .join(' · ')
        setError(msg)
      } else {
        setError('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const passwordsMatch = form.confirm_password && form.password === form.confirm_password

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 19, fontWeight: 700, letterSpacing: '-.03em' }}>Create account</h1>
        <p style={{ color: 'var(--text3)', fontSize: 13, marginTop: 3 }}>Join the InternTrack portal</p>
      </div>

      <ErrorBox   msg={error}   />
      <SuccessBox msg={success} />

      <form onSubmit={handle}>

        {/* Name */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">First Name</label>
            <input className="form-control" placeholder="Jane" required autoFocus
              value={form.first_name} onChange={e => set('first_name', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Last Name</label>
            <input className="form-control" placeholder="Opiyo" required
              value={form.last_name} onChange={e => set('last_name', e.target.value)} />
          </div>
        </div>

        {/* Username + email */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="form-control" placeholder="jane.opiyo" required
              value={form.username} onChange={e => set('username', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">
              Email <span style={{ color: 'var(--text3)', fontWeight: 400, textTransform: 'none' }}>(optional)</span>
            </label>
            <input className="form-control" type="email" placeholder="jane@example.com"
              value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
        </div>

        {/* Role picker */}
        <div className="form-group">
          <label className="form-label">I am a</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {USER_TYPES.map(t => (
              <button
                key={t.value} type="button"
                onClick={() => set('user_type', t.value)}
                style={{
                  padding: '9px 6px', borderRadius: 'var(--radius)', cursor: 'pointer',
                  border: form.user_type === t.value
                    ? '1.5px solid var(--accent)'
                    : '1px solid var(--border2)',
                  background: form.user_type === t.value
                    ? 'rgba(74,222,128,.08)'
                    : 'var(--surface2)',
                  color: form.user_type === t.value ? 'var(--accent)' : 'var(--text2)',
                  fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-head)',
                  transition: 'all .15s', textAlign: 'center', lineHeight: 1.3,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Passwords */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" placeholder="Min. 6 characters" required
              value={form.password} onChange={e => set('password', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              className="form-control" type="password" placeholder="Repeat password" required
              value={form.confirm_password} onChange={e => set('confirm_password', e.target.value)}
              style={form.confirm_password ? {
                borderColor: passwordsMatch ? 'var(--accent)' : 'var(--red)'
              } : {}}
            />
          </div>
        </div>

        {/* Password match hint */}
        {form.confirm_password && (
          <div style={{
            fontSize: 11, marginTop: -8, marginBottom: 12,
            color: passwordsMatch ? 'var(--accent)' : 'var(--red)',
          }}>
            {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
          </div>
        )}

        {/* Skills */}
        <div className="form-group">
          <label className="form-label">
            Skills <span style={{ color: 'var(--text3)', fontWeight: 400, textTransform: 'none' }}>(optional)</span>
          </label>
          <input
            className="form-control"
            placeholder="e.g. Python, communication, data analysis…"
            value={form.skills} onChange={e => set('skills', e.target.value)}
          />
        </div>

        <button
          type="submit" className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '11px', marginTop: 4 }}
          disabled={loading}
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--text3)' }}>
        Already have an account?{' '}
        <button
          onClick={onSwitch}
          style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, fontSize: 13, padding: 0 }}
        >
          Sign in
        </button>
      </p>
    </>
  )
}

// ─── Page shell ───────────────────────────────────────────────
export default function Login({ defaultTab = 'login' }) {
  const [tab, setTab] = useState(defaultTab)

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg)', padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: tab === 'register' ? 460 : 390, transition: 'max-width .25s ease' }}>

        <Brand />

        <div className="card fade-up">
          <Tabs active={tab} onChange={setTab} />

          {tab === 'login'
            ? <LoginForm    onSwitch={() => setTab('register')} />
            : <RegisterForm onSwitch={() => setTab('login')}    />
          }
        </div>

        <p style={{ textAlign: 'center', marginTop: 14, fontSize: 11, color: 'var(--text3)', lineHeight: 1.7 }}>
          {tab === 'register'
            ? 'Internship Administrator accounts can only be created by an existing admin.'
            : 'Contact your institution administrator if you need access help.'}
        </p>
      </div>
    </div>
  )
}
