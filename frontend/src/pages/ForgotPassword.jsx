import { useState } from 'react'
import { requestPasswordReset } from '../api/client'
import { Link } from 'react-router-dom'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setStatus('')
    setLoading(true)
    try {
      await requestPasswordReset(email)
      setStatus('If an account exists for this email, a reset link has been sent.')
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to request password reset. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <h2 style={{ marginBottom: 8 }}>Forgot password</h2>
        <p style={{ marginTop: 0, marginBottom: 18, opacity: 0.8 }}>
          Enter your email and we’ll send a password reset link.
        </p>

        {error && <div style={{ color: '#ef4444', marginBottom: 12 }}>{error}</div>}
        {status && <div style={{ color: '#22c55e', marginBottom: 12 }}>{status}</div>}

        <form onSubmit={submit}>
          <label style={{ display: 'block', marginBottom: 6 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
            style={{ width: '100%', padding: 10, borderRadius: 8, marginBottom: 12 }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: 10, borderRadius: 8, cursor: 'pointer' }}
          >
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>

        <div style={{ marginTop: 14 }}>
          <Link to="/login">Back to login</Link>
        </div>
      </div>
    </div>
  )
}

