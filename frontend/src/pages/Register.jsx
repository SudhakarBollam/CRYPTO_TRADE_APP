import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Spinner } from '../components/Spinner'

function validatePassword(pw) {
  if (pw.length < 8) return 'Password must be at least 8 characters.'
  if (!/[a-z]/.test(pw) || !/[A-Z]/.test(pw) || !/\d/.test(pw)) {
    return 'Password must include uppercase, lowercase, and a number.'
  }
  return null
}

export function Register() {
  const { register, user, ready } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (ready && user) navigate('/dashboard', { replace: true })
  }, [ready, user, navigate])

  async function onSubmit(e) {
    e.preventDefault()
    const pwErr = validatePassword(password)
    if (pwErr) {
      toast.error(pwErr)
      return
    }
    setLoading(true)
    try {
      await register({ email: email.trim(), password, name: name.trim() || undefined })
      toast.success('Account created.')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  if (!ready) {
    return (
      <div className="page-center">
        <Spinner />
      </div>
    )
  }
  if (user) return null

  return (
    <div className="auth-page">
      <div className="card card--narrow">
        <h1>Create account</h1>
        <p className="muted">Real email format required. Strong password rules apply.</p>
        <form onSubmit={onSubmit} className="form">
          <label className="field">
            <span>Name (optional)</span>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
          </label>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
            {loading ? 'Creating…' : 'Register'}
          </button>
        </form>
        <p className="muted small">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  )
}
