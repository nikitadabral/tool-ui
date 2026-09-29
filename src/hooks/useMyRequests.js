import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { getMyRequests } from '../services/requestService'

// Loads the current requester's requests with loading/error/data state.
export function useMyRequests() {
  const { user } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getMyRequests(user?.id)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load requests.')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  return { data, loading, error, refetch: fetchRequests }
}
