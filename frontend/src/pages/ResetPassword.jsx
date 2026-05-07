import { useMemo, useState } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { confirmPasswordReset } from '../api/client'

function useQuery() {
  const { search } = useLocation()
  return useMemo(() => new URLSearchParams(search), [search])
}

export default function ResetPassword() {
  const q = useQuery()
  const navigate = useNavigate()

  const uid = q.get('uid') || ''
  const token = q.get('token') || ''

  const [p1, setP1] = useState('')
  const [p2, setP2] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setStatus('')
    if (!uid || !token) {
      setError('Invalid reset link. Please request a new one.')
      return
    }
    if (p1.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (p1 !== p2) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await confirmPasswordReset({ uid, token, new_password: p1 })
      setStatus('Password updated. Redirecting to login…')
      setTimeout(() => navigate('/login', { replace: true }), 900)
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to reset password. Please request a new reset link.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <h2 style={{ marginBottom: 8 }}>Reset password</h2>
        <p style={{ marginTop: 0, marginBottom: 18, opacity: 0.8 }}>
          Choose a new password for your account.
        </p>

        {error && <div style={{ color: '#ef4444', marginBottom: 12 }}>{error}</div>}
        {status && <div style={{ color: '#22c55e', marginBottom: 12 }}>{status}</div>}

        <form onSubmit={submit}>
          <label style={{ display: 'block', marginBottom: 6 }}>New password</label>
          <input
            type="password"
            value={p1}
            onChange={(e) => setP1(e.target.value)}
            required
            placeholder="Min. 8 characters"
            minLength="8"
            style={{ width: '100%', padding: 10, borderRadius: 8, marginBottom: 12 }}
          />

          <label style={{ display: 'block', marginBottom: 6 }}>Confirm password</label>
          <input
            type="password"
            value={p2}
            onChange={(e) => setP2(e.target.value)}
            required
            placeholder="Repeat password"
            style={{ width: '100%', padding: 10, borderRadius: 8, marginBottom: 12 }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: 10, borderRadius: 8, cursor: 'pointer' }}
          >
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>

        <div style={{ marginTop: 14 }}>
          <Link to="/forgot-password">Request a new link</Link>
        </div>
      </div>
    </div>
  )
}

