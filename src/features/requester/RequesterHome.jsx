import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useMyRequests } from '../../hooks/useMyRequests'
import { Routes } from '../../app/routes'
import { RequestStatus } from '../../constants/requests'
import Button from '../../components/Button'
import RequestCard from '../../components/RequestCard'
import StatSummary from '../../components/StatSummary'
import LoadingState from '../../components/states/LoadingState'
import EmptyState from '../../components/states/EmptyState'
import ErrorState from '../../components/states/ErrorState'
import './RequesterHome.css'

const OPEN_STATUSES = new Set([RequestStatus.NEW, RequestStatus.SUBMITTED, RequestStatus.IN_REVIEW])

export default function RequesterHome() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { data, loading, error, refetch } = useMyRequests()

  const goToNewRequest = () => navigate(Routes.REQUESTER_NEW)

  const summaryItems = [
    { label: 'Total', value: data.length, tone: 'neutral' },
    {
      label: 'Open',
      value: data.filter((r) => OPEN_STATUSES.has(r.status)).length,
      tone: 'info',
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
      return (
        <EmptyState
          title="No requests yet"
          text="When you submit a business request, it will show up here."
          action={<Button onClick={goToNewRequest}>Create your first request</Button>}
        />
      )
    }
    return (
      <div className="request-list">
        {data.map((request) => (
          <RequestCard key={request.id} request={request} />
        ))}
      </div>
    )
  }

  return (
    <div className="page">
      <header className="page__topbar">
        <span className="page__brand">Request Intake &amp; Triage</span>
        <div className="page__topbar-actions">
          {user?.name && <span className="page__user">{user.name}</span>}
          <Button variant="secondary" onClick={logout}>
            Log out
          </Button>
        </div>
      </header>

      <main className="page__body">
        <section className="welcome">
          <div>
            <h1 className="welcome__title">Welcome back, {user?.name?.split(' ')[0] ?? 'there'}</h1>
            <p className="welcome__subtitle">Track your business requests and their status.</p>
          </div>
          <Button onClick={goToNewRequest}>+ New Request</Button>
        </section>

        {!loading && !error && data.length > 0 && <StatSummary items={summaryItems} />}

        <section className="requests">
          <div className="requests__header">
            <h2 className="requests__title">My Requests</h2>
            {!loading && !error && <span className="requests__count">{data.length} total</span>}
          </div>
          {renderContent()}
        </section>
      </main>
    </div>
  )
}
