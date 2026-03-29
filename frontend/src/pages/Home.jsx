import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Home() {
  const { user, ready } = useAuth()
  if (!ready) return null
  if (user) return <Navigate to="/dashboard" replace />
  return (
    <div className="hero-landing">
      <div className="hero-landing__content">
        <p className="eyebrow">Crypto Portfolio & Trade Intelligence</p>
        <h1>Secure journaling, roles, and analytics-ready APIs.</h1>
        <p className="muted lead">
          Express + MongoDB backend with JWT and RBAC, React dashboard with live market context via CoinGecko.
        </p>
        <div className="hero-landing__actions">
          <Link to="/register" className="btn btn--primary">
            Get started
          </Link>
          <Link to="/login" className="btn btn--ghost">
            Log in
          </Link>
        </div>
      </div>
    </div>
  )
}
