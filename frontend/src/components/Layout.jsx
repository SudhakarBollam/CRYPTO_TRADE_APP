import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

export function Layout() {
  return (
    <div className="layout">
      <Navbar />
      <main className="main">
        <Outlet />
      </main>
      <footer className="footer">
        <p>Crypto Portfolio & Trade Intelligence Platform — demo project.</p>
      </footer>
    </div>
  )
}
