import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { homeForRole } from '../../app/routes'

export default function Unauthorized() {
  const { role } = useAuth()
  return (
    <main style={{ maxWidth: 480, margin: '4rem auto', textAlign: 'center' }}>
      <h1>Not authorized</h1>
      <p>Your role does not have access to that screen.</p>
      <Link to={homeForRole(role)}>Go to your home</Link>
    </main>
  )
}
