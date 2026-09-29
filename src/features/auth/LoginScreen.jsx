import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { homeForRole, Routes } from '../../app/routes'
import './Auth.css'

export default function LoginScreen() {
  const { login, loading, isAuthenticated, role } = useAuth()
  const navigate = useNavigate()
  const [values, setValues] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)

  if (isAuthenticated) {
    return <Navigate to={homeForRole(role)} replace />
  }

  function updateField(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    try {
      const user = await login({ email: values.email.trim(), password: values.password })
      navigate(homeForRole(user.role), { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.')
    }
  }

  return (
    <div className="auth">
      <div className="auth__card">
        <p className="auth__brand">Request Intake &amp; Triage</p>
        <h1 className="auth__title">Sign in</h1>
        <p className="auth__subtitle">Welcome back. Enter your credentials to continue.</p>

        <form className="auth__form" onSubmit={handleSubmit} noValidate>
          <div className="auth__field">
            <label className="auth__label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="auth__input"
              type="email"
              autoComplete="email"
              value={values.email}
              disabled={loading}
              onChange={(e) => updateField('email', e.target.value)}
              required
            />
          </div>

          <div className="auth__field">
            <label className="auth__label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className="auth__input"
              type="password"
              autoComplete="current-password"
              value={values.password}
              disabled={loading}
              onChange={(e) => updateField('password', e.target.value)}
              required
            />
          </div>

          {error && <p className="auth__error" role="alert">{error}</p>}

          <button className="auth__submit" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="auth__footer">
          Don&apos;t have an account?{' '}
          <Link className="auth__link" to={Routes.SIGNUP}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
