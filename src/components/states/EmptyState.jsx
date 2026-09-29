import './states.css'

export default function EmptyState({ title = 'No requests yet', text, action }) {
  return (
    <div className="state-block">
      <h3 className="state-block__title">{title}</h3>
      {text && <p className="state-block__text">{text}</p>}
      {action}
    </div>
  )
}
