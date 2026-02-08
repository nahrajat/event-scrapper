import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Dashboard from './pages/Dashboard'
import Home from './pages/Home'
import './App.css'

function App() {
  const { user, logout } = useAuth()

  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="app-header">
          <div className="brand">
            <span className="brand-mark">SYD</span>
            <div>
              <h1>Sydney Events</h1>
              <p>Fresh event listings, updated automatically.</p>
            </div>
          </div>
          <nav>
            <Link to="/">Events</Link>
            <Link to="/dashboard">Dashboard</Link>
            {user ? (
              <button type="button" className="ghost" onClick={logout}>
                Sign out
              </button>
            ) : null}
          </nav>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
