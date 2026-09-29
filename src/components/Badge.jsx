import './Badge.css'

// Small status/label pill. `variant` maps to a color tone.
export default function Badge({ children, variant = 'neutral' }) {
  return <span className={`badge badge--${variant}`}>{children}</span>
}
