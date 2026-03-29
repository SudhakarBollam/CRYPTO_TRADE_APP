import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export function Navbar() {
const { user, logout } = useAuth()
const navigate = useNavigate()
const { theme, toggleTheme } = useTheme()

return ( <header className="nav"> <div className="nav__inner"> <Link to="/" className="nav__brand">
Crypto Portfolio </Link>

    <nav className="nav__links">
      {user && (
        <>
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
            Dashboard
          </NavLink>

          {(user.role === 'user' || user.role === 'admin' || user.role === 'analyst') && (
            <NavLink to="/trades" className={({ isActive }) => (isActive ? 'active' : '')}>
              Trades
            </NavLink>
          )}

          {(user.role === 'admin' || user.role === 'analyst') && (
            <NavLink to="/intelligence" className={({ isActive }) => (isActive ? 'active' : '')}>
              Intelligence
            </NavLink>
          )}

          {user.role === 'admin' && (
            <>
              <NavLink to="/admin" className={({ isActive }) => (isActive ? 'active' : '')}>
                Admin
              </NavLink>

              {/* Swagger API Docs Link */}
              <a
                href="http://localhost:5000/api-docs"
                target="_blank"
                rel="noopener noreferrer"
                className="nav__link"
              >
                API Docs
              </a>
            </>
          )}
        </>
      )}
    </nav>

    <div className="nav__actions">
      <button
        type="button"
        className="btn btn--ghost"
        onClick={toggleTheme}
        aria-pressed={theme === 'dark'}
      >
        {theme === 'dark' ? 'Light mode' : 'Dark mode'}
      </button>

      {user ? (
        <>
          <span className="nav__user" title={user.email}>
            {user.name || user.email}
            <span className="badge">{user.role}</span>
          </span>

          <button
            type="button"
            className="btn"
            onClick={() => {
              logout()
              navigate('/login')
            }}
          >
            Log out
          </button>
        </>
      ) : (
        <>
          <Link to="/login" className="btn btn--ghost">
            Log in
          </Link>
          <Link to="/register" className="btn btn--primary">
            Register
          </Link>
        </>
      )}
    </div>
  </div>
</header>

)
}
