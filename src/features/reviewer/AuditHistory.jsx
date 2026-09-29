import Button from '../../components/Button'
import { STATUS_LABEL } from '../../constants/requests'
import { useAuditHistory } from '../../hooks/useAuditHistory'

function formatDateTime(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Unknown time'
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

function statusLabel(status) {
  return STATUS_LABEL[status] ?? status
}

function eventSummary(event) {
  if (event.eventType === 'STATUS_CHANGED') {
    return `Status changed: ${statusLabel(event.previousStatus)} to ${statusLabel(event.newStatus)}`
  }
  if (event.eventType === 'NOTE_ADDED') return 'Note added'
  if (event.eventType === 'NOTE_UPDATED') {
    return event.note ? 'Note updated' : 'Note cleared'
  }
  if (event.eventType === 'WEBHOOK_QUEUED') return 'External handoff queued'
  if (event.eventType === 'WEBHOOK_SENT') return 'Sent to external system'
  if (event.eventType === 'WEBHOOK_FAILED') return 'External handoff failed'
  return event.eventType
}

export default function AuditHistory({ requestId, refreshVersion }) {
  const { events, loading, error, refetch } = useAuditHistory(requestId, refreshVersion)

  return (
    <section className="detail-card" aria-labelledby="audit-history-title">
      <div className="detail-card__titlerow">
        <h2 id="audit-history-title" className="detail-card__title">Activity history</h2>
        <span className="detail-readonly-tag">Read-only</span>
      </div>

      {loading && <p className="audit-history__state" role="status">Loading history...</p>}

      {!loading && error && (
        <div className="audit-history__error" role="alert">
          <p>{error}</p>
          <Button variant="secondary" onClick={refetch}>Retry</Button>
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <p className="audit-history__state">No status changes or reviewer notes yet.</p>
      )}

      {!loading && !error && events.length > 0 && (
        <ol className="audit-history">
          {events.map((event) => (
            <li key={event.id} className="audit-history__event">
              <span className="audit-history__marker" aria-hidden="true" />
              <div>
                <p className="audit-history__summary">{eventSummary(event)}</p>
                {event.note && <p className="audit-history__note">“{event.note}”</p>}
                <p className="audit-history__meta">
                  {event.reviewerName || 'Unknown reviewer'} · {formatDateTime(event.timestamp)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}