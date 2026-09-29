import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useAllRequests } from '../../hooks/useAllRequests'
import { exportRequestsCsv } from '../../services/requestService'
import { PRIORITY_LABEL, STATUS_LABEL, RequestStatus } from '../../constants/requests'
import { reviewerRequestDetailPath } from '../../app/routes'
import Button from '../../components/Button'
import RequestCard from '../../components/RequestCard'
import StatSummary from '../../components/StatSummary'
import SearchInput from '../../components/SearchInput'
import FilterSelect from '../../components/FilterSelect'
import LoadingState from '../../components/states/LoadingState'
import EmptyState from '../../components/states/EmptyState'
import ErrorState from '../../components/states/ErrorState'
import StatusEditor from './StatusEditor'
import './TriageQueue.css'

const ALL = 'ALL'

const STATUS_OPTIONS = [
  { value: ALL, label: 'All statuses' },
  ...Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label })),
]

const PRIORITY_OPTIONS = [
  { value: ALL, label: 'All priorities' },
  ...Object.entries(PRIORITY_LABEL).map(([value, label]) => ({ value, label })),
]

export default function TriageQueue() {
  const { logout } = useAuth()
  const { data, loading, error, refetch } = useAllRequests()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState(ALL)
  const [priorityFilter, setPriorityFilter] = useState(ALL)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState(null)

  async function handleExport() {
    setExporting(true)
    setExportError(null)
    try {
      const csv = await exportRequestsCsv()
      const downloadUrl = URL.createObjectURL(csv)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = 'requests_export.csv'
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(downloadUrl)
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Failed to export requests.')
    } finally {
      setExporting(false)
    }
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return data.filter((r) => {
      if (statusFilter !== ALL && r.status !== statusFilter) return false
      if (priorityFilter !== ALL && r.priority !== priorityFilter) return false
      if (term) {
        const haystack = `${r.title} ${r.summary ?? ''} ${r.requester ?? ''}`.toLowerCase()
        if (!haystack.includes(term)) return false
      }
      return true
    })
  }, [data, search, statusFilter, priorityFilter])

  const summaryItems = [
    { label: 'Total', value: data.length, tone: 'neutral' },
    {
      label: 'New',
      value: data.filter((r) => r.status === RequestStatus.NEW || r.status === RequestStatus.SUBMITTED).length,
      tone: 'info',
    },
    {
      label: 'In Review',
      value: data.filter((r) => r.status === RequestStatus.IN_REVIEW).length,
      tone: 'warning',
    },
    {
      label: 'Approved',
      value: data.filter((r) => r.status === RequestStatus.APPROVED).length,
      tone: 'success',
    },
    {
      label: 'Completed',
      value: data.filter((r) => r.status === RequestStatus.COMPLETED).length,
      tone: 'accent',
    },
  ]

  function renderContent() {
    if (loading) return <LoadingState />
    if (error) return <ErrorState message={error} onRetry={refetch} />
    if (data.length === 0) {
      return <EmptyState title="No requests" text="There are no submitted requests to triage." />
    }
    if (filtered.length === 0) {
      return <EmptyState title="No matches" text="No requests match the current filters or search." />
    }
    return (
      <div className="request-list">
        {filtered.map((request) => (
          <RequestCard
            key={request.id}
            request={request}
            titleTo={reviewerRequestDetailPath(request.id)}
            footer={
              <div className="triage-card-footer">
                <StatusEditor request={request} onUpdated={refetch} />
                <Link
                  className="btn btn--secondary triage-brief-link"
                  to={`${reviewerRequestDetailPath(request.id)}#ai-brief`}
                >
                  View AI brief
                </Link>
              </div>
            }
          />
        ))}
      </div>
    )
  }

  return (
    <div className="page">
      <header className="page__topbar">
        <span className="page__brand">Request Intake &amp; Triage</span>
        <div className="page__topbar-actions">
          <span className="page__user">Reviewer</span>
          <Button variant="secondary" onClick={logout}>
            Log out
          </Button>
        </div>
      </header>

      <main className="page__body">
        <section className="welcome">
          <div>
            <h1 className="welcome__title">Triage Queue</h1>
            <p className="welcome__subtitle">Review and prioritize all submitted requests.</p>
          </div>
          <Button onClick={handleExport} disabled={exporting}>
            {exporting ? 'Exporting…' : 'Export CSV'}
          </Button>
        </section>

        {exportError && (
          <p className="export-feedback export-feedback--error" role="alert">
            {exportError}
          </p>
        )}

        {!loading && !error && data.length > 0 && <StatSummary items={summaryItems} />}

        <div className="triage-toolbar">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by title, summary or requester"
          />
          <FilterSelect
            id="status-filter"
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_OPTIONS}
          />
          <FilterSelect
            id="priority-filter"
            label="Priority"
            value={priorityFilter}
            onChange={setPriorityFilter}
            options={PRIORITY_OPTIONS}
          />
        </div>

        <div className="requests__header">
          <h2 className="requests__title">Requests</h2>
          {!loading && !error && (
            <span className="requests__count">
              {filtered.length} of {data.length}
            </span>
          )}
        </div>

        {renderContent()}
      </main>
    </div>
  )
}
