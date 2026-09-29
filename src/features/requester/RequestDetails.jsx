import { Link, useLocation } from 'react-router-dom'
import { Routes } from '../../app/routes'
import StatusBadge from '../../components/StatusBadge'
import PriorityBadge from '../../components/PriorityBadge'
import Button from '../../components/Button'
import './RequestDetails.css'

function formatDateTime(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export default function RequestDetails() {
  const location = useLocation()
  const request = location.state?.request
  const justCreated = location.state?.justCreated

  // Details are passed via navigation state from Submit. A direct visit (e.g.
  // refresh) has no state; a real backend fetch-by-id would go here later.
  if (!request) {
    return (
      <div className="page">
        <main className="page__body">
          <h1>Request details</h1>
          <p className="details-fallback">
            Details aren&apos;t available on this page. Please open the request from your home screen.
          </p>
          <Link to={Routes.REQUESTER_HOME}>Back to my requests</Link>
        </main>
      </div>
    )
  }

  return (
    <div className="page">
      <header className="page__topbar">
        <span className="page__brand">Request Intake &amp; Triage</span>
        <Link to={Routes.REQUESTER_HOME}>
          <Button variant="secondary">Back to my requests</Button>
        </Link>
      </header>

      <main className="page__body">
        {justCreated && (
          <div className="confirmation-banner" role="status">
            <strong>Request submitted.</strong> Your request has been received and will be triaged shortly.
          </div>
        )}

        <div className="details-card">
          <div className="details-card__header">
            <div>
              <h1 className="details-card__title">{request.title}</h1>
              {request.number != null && (
                <span className="details-card__id">Request #{request.number}</span>
              )}
            </div>
            <div className="details-card__badges">
              <StatusBadge status={request.status} />
              <PriorityBadge priority={request.priority} />
            </div>
          </div>

          <dl className="details-meta">
            <div>
              <dt>Requester</dt>
              <dd>{request.requesterName}</dd>
            </div>
            {request.businessArea && (
              <div>
                <dt>Business area</dt>
                <dd>{request.businessArea}</dd>
              </div>
            )}
            <div>
              <dt>Submitted</dt>
              <dd>{formatDateTime(request.createdAt)}</dd>
            </div>
          </dl>

          <div className="details-description">
            <h2>Business request</h2>
            <p>{request.description}</p>
          </div>
        </div>
      </main>
    </div>
  )
}
