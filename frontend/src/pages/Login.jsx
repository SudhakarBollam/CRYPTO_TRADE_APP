import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Spinner } from '../components/Spinner'

export function Login() {
  const { login, user, ready } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (ready && user) navigate(from, { replace: true })
  }, [ready, user, from, navigate])

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email.trim(), password)
      toast.success('Welcome back.')
      navigate(from, { replace: true })
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
        <h1>Log in</h1>
        <p className="muted">Use a valid email and your account password.</p>
        <form onSubmit={onSubmit} className="form">
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
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="muted small">
          No account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  )
}
