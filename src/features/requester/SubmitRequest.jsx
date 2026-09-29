import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { submitRequest } from '../../services/requestService'
import { Routes, requestDetailsPath } from '../../app/routes'
import Button from '../../components/Button'
import FormField from '../../components/FormField'
import ErrorState from '../../components/states/ErrorState'
import './SubmitRequest.css'

const EMPTY_ERRORS = {}

function validate(values) {
  const errors = {}
  if (!values.description.trim()) {
    errors.description = 'A request description is required.'
  } else if (values.description.trim().length < 10) {
    errors.description = 'Please provide a little more detail (at least 10 characters).'
  }
  return errors
}

export default function SubmitRequest() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [values, setValues] = useState({
    title: '',
    description: '',
  })
  const [errors, setErrors] = useState(EMPTY_ERRORS)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  function updateField(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (submitting) return
    setSubmitError(null)

    const nextErrors = validate(values)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setSubmitting(true)
    try {
      const created = await submitRequest({
        title: values.title,
        description: values.description,
        requesterName: user?.name ?? '',
      })
      navigate(requestDetailsPath(created.id), {
        replace: true,
        state: { request: created, justCreated: true },
      })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit request.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <header className="page__topbar">
        <span className="page__brand">Request Intake &amp; Triage</span>
        <Button variant="secondary" onClick={() => navigate(Routes.REQUESTER_HOME)} disabled={submitting}>
          Cancel
        </Button>
      </header>

      <main className="page__body">
        <h1 className="form-title">Submit a Request</h1>
        <p className="form-subtitle">
          Describe your request in your own words. A reviewer will triage it after you submit.
        </p>

        {submitError && (
          <div className="form-error-banner">
            <ErrorState message={submitError} />
          </div>
        )}

        <form className="request-form" onSubmit={handleSubmit} noValidate>
          <FormField id="title" label="Request Title" hint="Optional">
            <input
              id="title"
              type="text"
              value={values.title}
              placeholder="Give your request a short title"
              disabled={submitting}
              onChange={(e) => updateField('title', e.target.value)}
            />
          </FormField>

          <FormField
            id="description"
            label="Request Description"
            required
            error={errors.description}
            hint="Describe your request in your own words. Include any context that may help us understand the problem."
          >
            <textarea
              id="description"
              rows={10}
              value={values.description}
              placeholder="Describe your request in your own words…"
              aria-invalid={Boolean(errors.description)}
              disabled={submitting}
              onChange={(e) => updateField('description', e.target.value)}
            />
          </FormField>

          <div className="request-form__actions">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
