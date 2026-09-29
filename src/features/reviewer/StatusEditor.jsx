import { useState } from 'react'
import { updateRequestStatus } from '../../services/requestService'
import { REVIEWER_STATUS_OPTIONS } from '../../constants/requests'
import Button from '../../components/Button'
import StatusBadge from '../../components/StatusBadge'
import './StatusEditor.css'

// Inline "Edit Status" control shown on every reviewer request. Persists the
// status change through the backend and reports saving/error feedback.
export default function StatusEditor({ request, onUpdated }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(request.status)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  function startEdit() {
    setValue(request.status)
    setError(null)
    setEditing(true)
  }

  function cancel() {
    setEditing(false)
    setError(null)
  }

  async function save() {
    if (value === request.status) {
      setEditing(false)
      return
    }
    setSaving(true)
    setError(null)
    try {
      await updateRequestStatus(request.id, value)
      setEditing(false)
      onUpdated?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status.')
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    return (
      <div className="status-editor">
        <div className="status-editor__current">
          <span className="status-editor__label">Status</span>
          <StatusBadge status={request.status} />
        </div>
        <Button variant="secondary" onClick={startEdit}>
          Edit Status
        </Button>
      </div>
    )
  }

  return (
    <div className="status-editor status-editor--active">
      <label className="status-editor__label" htmlFor={`status-${request.id}`}>
        Status
      </label>
      <select
        id={`status-${request.id}`}
        className="status-editor__select"
        value={value}
        disabled={saving}
        onChange={(e) => setValue(e.target.value)}
      >
        {REVIEWER_STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <div className="status-editor__actions">
        <Button onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
        <Button variant="secondary" onClick={cancel} disabled={saving}>
          Cancel
        </Button>
      </div>
      {error && (
        <span className="status-editor__error" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
