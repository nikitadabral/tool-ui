import { useCallback, useEffect, useState } from 'react'
import { getRequestById } from '../services/requestService'

// Loads a single request detail. `notFound` is true when the id has no match.
export function useRequestDetail(id) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notFound, setNotFound] = useState(false)

  const fetchDetail = useCallback(async () => {
    setLoading(true)
    setError(null)
    setNotFound(false)
    try {
      const result = await getRequestById(id)
      if (!result) {
        setNotFound(true)
        setData(null)
      } else {
        setData(result)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load request.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  return { data, loading, error, notFound, refetch: fetchDetail }
}
