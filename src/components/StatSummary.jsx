import './StatSummary.css'

// Compact KPI strip used at the top of the requester/reviewer dashboards.
export default function StatSummary({ items }) {
  if (!items?.length) return null
  return (
    <dl className="stat-summary">
      {items.map((item) => (
        <div key={item.label} className={`stat-summary__item stat-summary__item--${item.tone ?? 'neutral'}`}>
          <dt className="stat-summary__label">{item.label}</dt>
          <dd className="stat-summary__value">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
