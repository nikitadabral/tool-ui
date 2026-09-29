import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Routes } from './routes'

// Restricts a branch of routes to a single role.
export function RoleRoute({ allow }) {
  const { role } = useAuth()
  if (role !== allow) {
    return <Navigate to={Routes.UNAUTHORIZED} replace />
  }
  return <Outlet />
}
