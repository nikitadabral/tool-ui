import { useEffect, useState } from 'react'
import { getRequestAuditHistory } from '../services/requestService'

export function useAuditHistory(id, refreshVersion) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [loadVersion, setLoadVersion] = useState(0)

  useEffect(() => {
    let active = true
    getRequestAuditHistory(id)
      .then((result) => {
        if (active) setEvents(result)
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load audit history.')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [id, refreshVersion, loadVersion])

  function refetch() {
    setLoading(true)
    setError(null)
    setLoadVersion((version) => version + 1)
  }

  return { events, loading, error, refetch }
}