// Request domain constants. Reference these instead of raw strings.
export const RequestStatus = Object.freeze({
  NEW: 'NEW',
  SUBMITTED: 'SUBMITTED',
  IN_REVIEW: 'IN_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED',
})

export const STATUS_LABEL = Object.freeze({
  [RequestStatus.NEW]: 'New',
  [RequestStatus.SUBMITTED]: 'Submitted',
  [RequestStatus.IN_REVIEW]: 'In Review',
  [RequestStatus.APPROVED]: 'Approved',
  [RequestStatus.REJECTED]: 'Rejected',
  [RequestStatus.COMPLETED]: 'Completed',
})

// Statuses a reviewer can assign, in workflow order.
export const REVIEWER_STATUSES = Object.freeze([
  RequestStatus.NEW,
  RequestStatus.IN_REVIEW,
  RequestStatus.APPROVED,
  RequestStatus.REJECTED,
  RequestStatus.COMPLETED,
])

export const REVIEWER_STATUS_OPTIONS = Object.freeze(
  REVIEWER_STATUSES.map((value) => ({ value, label: STATUS_LABEL[value] })),
)

export const Priority = Object.freeze({
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
})

export const PRIORITY_LABEL = Object.freeze({
  [Priority.LOW]: 'Low',
  [Priority.MEDIUM]: 'Medium',
  [Priority.HIGH]: 'High',
})
