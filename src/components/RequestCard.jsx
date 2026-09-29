import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import PriorityBadge from './PriorityBadge'
import './RequestCard.css'

function formatDate(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function RequestCard({ request, titleTo, footer, className = '' }) {
  const { number, title, summary, createdAt, status, priority, owner, requester } = request

  const heading = <h3 className="request-card__title">{title}</h3>

  return (
    <article className={`request-card ${className}`.trim()}>
      <div className="request-card__header">
        <div className="request-card__heading">
          {number != null && <span className="request-card__number">Request #{number}</span>}
          {titleTo ? (
            <Link to={titleTo} className="request-card__title-link">
              {heading}
            </Link>
          ) : (
            heading
          )}
        </div>
        <div className="request-card__badges">
          <StatusBadge status={status} />
          <PriorityBadge priority={priority} />
        </div>
      </div>

      {summary && <p className="request-card__summary">{summary}</p>}

      <div className="request-card__meta">
        {requester && (
          <span className="request-card__meta-item">
            Requester <strong>{requester}</strong>
          </span>
        )}
        {owner && (
          <span className="request-card__meta-item">
            Owner <strong>{owner}</strong>
          </span>
        )}
        <span className="request-card__meta-item">Created {formatDate(createdAt)}</span>
      </div>

      {footer && <div className="request-card__footer">{footer}</div>}
    </article>
  )
}
