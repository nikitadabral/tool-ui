import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Routes } from './routes'

// Blocks access unless a user is authenticated.
export function ProtectedRoute() {
  const { isAuthenticated, initializing } = useAuth()
  if (initializing) return null
  if (!isAuthenticated) {
    return <Navigate to={Routes.LOGIN} replace />
  }
  return <Outlet />
}
