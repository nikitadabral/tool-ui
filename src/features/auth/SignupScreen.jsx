import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Role, ROLE_LABEL } from '../../constants/roles'
import { homeForRole, Routes } from '../../app/routes'
import './Auth.css'

const ROLE_OPTIONS = [
  { value: Role.USER, label: ROLE_LABEL[Role.USER] },
  { value: Role.REVIEWER, label: ROLE_LABEL[Role.REVIEWER] },
]

function validate(values) {
  const errors = {}
  if (!values.name.trim()) errors.name = 'Please enter your name.'
  if (!values.email.trim()) {
    errors.email = 'Please enter your email.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Please enter a valid email address.'
  }
  if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.'
  }
  return errors
}

export default function SignupScreen() {
  const { signup, loading, isAuthenticated, role } = useAuth()
  const navigate = useNavigate()
  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    role: Role.USER,
  })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState(null)

  if (isAuthenticated) {
    return <Navigate to={homeForRole(role)} replace />
  }

  function updateField(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitError(null)
    const nextErrors = validate(values)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }
    try {
      const user = await signup({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        role: values.role,
      })
      navigate(homeForRole(user.role), { replace: true })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unable to create account.')
    }
  }

  return (
    <div className="auth">
      <div className="auth__card">
        <p className="auth__brand">Request Intake &amp; Triage</p>
        <h1 className="auth__title">Create account</h1>
        <p className="auth__subtitle">Sign up to submit and triage business requests.</p>

        <form className="auth__form" onSubmit={handleSubmit} noValidate>
          <div className="auth__field">
            <label className="auth__label" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              className="auth__input"
              type="text"
              autoComplete="name"
              value={values.name}
              aria-invalid={Boolean(errors.name)}
              disabled={loading}
              onChange={(e) => updateField('name', e.target.value)}
            />
            {errors.name && <p className="auth__field-error">{errors.name}</p>}
          </div>

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
              aria-invalid={Boolean(errors.email)}
              disabled={loading}
              onChange={(e) => updateField('email', e.target.value)}
            />
            {errors.email && <p className="auth__field-error">{errors.email}</p>}
          </div>

          <div className="auth__field">
            <label className="auth__label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className="auth__input"
              type="password"
              autoComplete="new-password"
              value={values.password}
              aria-invalid={Boolean(errors.password)}
              disabled={loading}
              onChange={(e) => updateField('password', e.target.value)}
            />
            {errors.password && <p className="auth__field-error">{errors.password}</p>}
          </div>

          <div className="auth__field">
            <label className="auth__label" htmlFor="role">
              I am a
            </label>
            <select
              id="role"
              className="auth__select"
              value={values.role}
              disabled={loading}
              onChange={(e) => updateField('role', e.target.value)}
            >
              {ROLE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {submitError && <p className="auth__error" role="alert">{submitError}</p>}

          <button className="auth__submit" type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="auth__footer">
          Already have an account?{' '}
          <Link className="auth__link" to={Routes.LOGIN}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
