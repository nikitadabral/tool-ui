// Canonical role values — must match the backend (USER / REVIEWER).
export const Role = Object.freeze({
  USER: 'USER',
  REVIEWER: 'REVIEWER',
})

export const ROLE_VALUES = Object.freeze(Object.values(Role))

// Human-friendly labels for the UI.
export const ROLE_LABEL = Object.freeze({
  [Role.USER]: 'Requester',
  [Role.REVIEWER]: 'Reviewer',
})

export function isRole(value) {
  return ROLE_VALUES.includes(value)
}
