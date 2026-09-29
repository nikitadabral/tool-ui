import { useCallback, useEffect, useState } from 'react'
import { getAllRequests } from '../services/requestService'

// Loads all submitted requests for the reviewer queue.
export function useAllRequests() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getAllRequests()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load requests.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  return { data, loading, error, refetch: fetchRequests }
}
