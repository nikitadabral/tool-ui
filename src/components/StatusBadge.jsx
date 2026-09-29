import Badge from './Badge'
import { RequestStatus, STATUS_LABEL } from '../constants/requests'

const STATUS_VARIANT = {
  [RequestStatus.NEW]: 'info',
  [RequestStatus.SUBMITTED]: 'info',
  [RequestStatus.IN_REVIEW]: 'warning',
  [RequestStatus.APPROVED]: 'success',
  [RequestStatus.REJECTED]: 'danger',
  [RequestStatus.COMPLETED]: 'accent',
}

export default function StatusBadge({ status }) {
  return <Badge variant={STATUS_VARIANT[status] ?? 'neutral'}>{STATUS_LABEL[status] ?? status}</Badge>
}
