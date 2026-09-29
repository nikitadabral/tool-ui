import { Navigate, Route, Routes as RouterRoutes } from 'react-router-dom'
import { Role } from '../constants/roles'
import { useAuth } from '../hooks/useAuth'
import { homeForRole, Routes } from './routes'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleRoute } from './RoleRoute'
import LoginScreen from '../features/auth/LoginScreen'
import SignupScreen from '../features/auth/SignupScreen'
import RequesterHome from '../features/requester/RequesterHome'
import SubmitRequest from '../features/requester/SubmitRequest'
import RequestDetails from '../features/requester/RequestDetails'
import TriageQueue from '../features/reviewer/TriageQueue'
import ReviewerRequestDetail from '../features/reviewer/ReviewerRequestDetail'
import Unauthorized from '../features/common/Unauthorized'

export function AppRouter() {
  const { isAuthenticated, role, initializing } = useAuth()

  // Wait for the token/me bootstrap before routing to avoid redirect flicker.
  if (initializing) {
    return (
      <div style={{ maxWidth: 420, margin: '4rem auto', textAlign: 'center' }}>
        Loading…
      </div>
    )
  }

  return (
    <RouterRoutes>
      <Route path={Routes.LOGIN} element={<LoginScreen />} />
      <Route path={Routes.SIGNUP} element={<SignupScreen />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allow={Role.USER} />}>
          <Route path={Routes.REQUESTER_NEW} element={<SubmitRequest />} />
          <Route path={Routes.REQUESTER_REQUEST_DETAILS} element={<RequestDetails />} />
          <Route path={Routes.REQUESTER_HOME} element={<RequesterHome />} />
        </Route>

        <Route element={<RoleRoute allow={Role.REVIEWER} />}>
          <Route path={Routes.REVIEWER_QUEUE} element={<TriageQueue />} />
          <Route path={Routes.REVIEWER_REQUEST_DETAILS} element={<ReviewerRequestDetail />} />
        </Route>

        <Route path={Routes.UNAUTHORIZED} element={<Unauthorized />} />
      </Route>

      <Route
        path="*"
        element={
          <Navigate to={isAuthenticated ? homeForRole(role) : Routes.LOGIN} replace />
        }
      />
    </RouterRoutes>
  )
}
