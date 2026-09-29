import Button from '../Button'
import './states.css'

export default function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="state-block state-block--error" role="alert">
      <h3 className="state-block__title">Unable to load requests</h3>
      <p className="state-block__text">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
