import Badge from './Badge'
import { Priority, PRIORITY_LABEL } from '../constants/requests'

const PRIORITY_VARIANT = {
  [Priority.LOW]: 'neutral',
  [Priority.MEDIUM]: 'info',
  [Priority.HIGH]: 'danger',
}

export default function PriorityBadge({ priority }) {
  if (!priority) return null
  return <Badge variant={PRIORITY_VARIANT[priority] ?? 'neutral'}>{PRIORITY_LABEL[priority] ?? priority}</Badge>
}
