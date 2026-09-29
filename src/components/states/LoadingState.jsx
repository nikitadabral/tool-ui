import './states.css'

// Skeleton placeholders shown while requests load.
export default function LoadingState({ rows = 3 }) {
  return (
    <div className="request-skeleton" role="status" aria-label="Loading requests">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="request-skeleton__row" />
      ))}
    </div>
  )
}
