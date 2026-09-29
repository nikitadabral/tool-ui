import { Role } from '../constants/roles'

// Central route paths. Reference these instead of hardcoding strings.
export const Routes = Object.freeze({
  LOGIN: '/login',
  SIGNUP: '/signup',
  REQUESTER_HOME: '/requester',
  REQUESTER_NEW: '/requester/new',
  REQUESTER_REQUEST_DETAILS: '/requester/requests/:id',
  REVIEWER_QUEUE: '/reviewer',
  REVIEWER_REQUEST_DETAILS: '/reviewer/requests/:id',
  UNAUTHORIZED: '/unauthorized',
})

export function requestDetailsPath(id) {
  return `/requester/requests/${id}`
}

export function reviewerRequestDetailPath(id) {
  return `/reviewer/requests/${id}`
}

// Landing route per role after login.
export const HOME_BY_ROLE = Object.freeze({
  [Role.USER]: Routes.REQUESTER_HOME,
  [Role.REVIEWER]: Routes.REVIEWER_QUEUE,
})

export function homeForRole(role) {
  return HOME_BY_ROLE[role] ?? Routes.LOGIN
}
