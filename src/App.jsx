import { useState } from 'react'
import './App.css'

const demoUsers = [
  { username: 'admin', password: 'admin123', userId: 101, role: 'admin' },
  { username: 'manager', password: 'manager123', userId: 202, role: 'manager' },
]

const createToken = (user) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(
    JSON.stringify({
      userId: user.userId,
      role: user.role,
      username: user.username,
    }),
  )
  const signature = btoa('simulated-signature')

  return `${header}.${payload}.${signature}`
}

const getStoredAuth = () => {
  const token = localStorage.getItem('jwtToken')

  if (!token) {
    return { token: null, user: null }
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))

    return {
      token,
      user: {
        userId: payload.userId,
        role: payload.role,
        username: payload.username,
      },
    }
  } catch {
    localStorage.removeItem('jwtToken')
    return { token: null, user: null }
  }
}

function App() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [auth, setAuth] = useState(() => getStoredAuth())
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
    setError('')
  }

  const handleLogin = (event) => {
    event.preventDefault()

    const user = demoUsers.find(
      (demoUser) =>
        demoUser.username === form.username && demoUser.password === form.password,
    )

    if (!user) {
      setError('Invalid username or password. Try admin/admin123 or manager/manager123.')
      return
    }

    const token = createToken(user)
    const loggedInUser = {
      userId: user.userId,
      role: user.role,
      username: user.username,
    }

    localStorage.setItem('jwtToken', token)
    setAuth({ token, user: loggedInUser })
    setError('')
  }

  const handleLogout = () => {
    localStorage.removeItem('jwtToken')
    setAuth({ token: null, user: null })
    setForm({ username: '', password: '' })
  }

  const isLoggedIn = Boolean(auth.token && auth.user)

  return (
    <div className="app-shell">
      {!isLoggedIn ? (
        <div className="auth-card">
          <h1>Login</h1>
          <p className="subtitle">Use your account to access the dashboard.</p>

          <form onSubmit={handleLogin} className="login-form">
            <label>
              Username
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Enter username"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
              />
            </label>

            {error && <p className="error-message">{error}</p>}

            <button type="submit" className="primary-button">
              Login
            </button>
          </form>
        </div>
      ) : (
        <div className="dashboard">
          <header className="dashboard-header">
            <div>
              <p className="eyebrow">Protected Dashboard</p>
              <h2>Welcome, {auth.user.username}</h2>
            </div>
            <button type="button" className="secondary-button" onClick={handleLogout}>
              Logout
            </button>
          </header>

          <div className="role-card">
            <span className="label">User Role</span>
            <strong>{auth.user.role}</strong>
          </div>

          <div className="token-box">
            <span className="label">Stored JWT</span>
            <code>{auth.token}</code>
          </div>

          <div className="stats-grid">
            <div className="stat-item">
              <span>User ID</span>
              <strong>{auth.user.userId}</strong>
            </div>
            <div className="stat-item">
              <span>Access</span>
              <strong>Granted</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
