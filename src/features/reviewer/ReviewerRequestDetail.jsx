import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useRequestDetail } from '../../hooks/useRequestDetail'
import { generateRequestBrief, updateRequestTriage } from '../../services/requestService'
import {
  PRIORITY_LABEL,
  RequestStatus,
  STATUS_LABEL,
  REVIEWER_STATUS_OPTIONS,
} from '../../constants/requests'
import { Routes } from '../../app/routes'
import Button from '../../components/Button'
import FormField from '../../components/FormField'
import StatusBadge from '../../components/StatusBadge'
import PriorityBadge from '../../components/PriorityBadge'
import LoadingState from '../../components/states/LoadingState'
import EmptyState from '../../components/states/EmptyState'
import ErrorState from '../../components/states/ErrorState'
import AuditHistory from './AuditHistory'
import './ReviewerRequestDetail.css'

function formatDateTime(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

const STATUS_OPTIONS = REVIEWER_STATUS_OPTIONS
const PRIORITY_OPTIONS = Object.entries(PRIORITY_LABEL).map(([value, label]) => ({ value, label }))

function TriagePanel({ request, onSaved }) {
  const [triage, setTriage] = useState({
    status: request.status,
    priority: request.priority,
    owner: request.owner,
    notes: request.notes,
  })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [savedMessage, setSavedMessage] = useState(null)
  const [savedWarning, setSavedWarning] = useState(false)

  // Keep any legacy status (e.g. Submitted) selectable so it isn't silently lost.
  const statusOptions = STATUS_OPTIONS.some((o) => o.value === request.status)
    ? STATUS_OPTIONS
    : [{ value: request.status, label: STATUS_LABEL[request.status] ?? request.status }, ...STATUS_OPTIONS]

  function update(field, value) {
    setTriage((prev) => ({ ...prev, [field]: value }))
    setSavedMessage(null)
    setSavedWarning(false)
  }

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    try {
      const result = await updateRequestTriage(request.id, triage)
      const newlyApproved = (
        request.status !== RequestStatus.APPROVED
        && triage.status === RequestStatus.APPROVED
      )
      setSavedMessage(
        result.webhook_queued
          ? 'Request approved. External handoff queued.'
          : newlyApproved
            ? 'Request approved. Webhook is not configured, so no external notification was sent.'
            : 'Changes saved.',
      )
      setSavedWarning(newlyApproved && !result.webhook_queued)
      onSaved?.(result)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="detail-card">
      <h2 className="detail-card__title">Triage</h2>

      <div className="triage-grid">
        <FormField id="triage-status" label="Status">
          <select
            id="triage-status"
            value={triage.status}
            disabled={saving}
            onChange={(e) => update('status', e.target.value)}
          >
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField id="triage-priority" label="Priority">
          <select
            id="triage-priority"
            value={triage.priority}
            disabled={saving}
            onChange={(e) => update('priority', e.target.value)}
          >
            {PRIORITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField id="triage-owner" label="Owner">
        <input
          id="triage-owner"
          type="text"
          value={triage.owner}
          disabled={saving}
          onChange={(e) => update('owner', e.target.value)}
        />
      </FormField>

      <FormField id="triage-notes" label="Notes" hint="Internal triage notes (not shown to the requester).">
        <textarea
          id="triage-notes"
          value={triage.notes}
          placeholder="Add triage notes…"
          disabled={saving}
          onChange={(e) => update('notes', e.target.value)}
        />
      </FormField>

      {saveError && <p className="triage-feedback triage-feedback--error" role="alert">{saveError}</p>}
      {savedMessage && !saveError && (
        <p
          className={`triage-feedback ${savedWarning ? 'triage-feedback--warning' : 'triage-feedback--ok'}`}
          role="status"
        >
          {savedMessage}
        </p>
      )}

      <div className="detail-actions">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </section>
  )
}

export default function ReviewerRequestDetail() {
  const { id } = useParams()
  const location = useLocation()
  const { data, loading, error, notFound, refetch } = useRequestDetail(id)
  const [briefResult, setBriefResult] = useState(null)
  const [generatingBrief, setGeneratingBrief] = useState(false)
  const [briefError, setBriefError] = useState(null)
  const [auditRefreshVersion, setAuditRefreshVersion] = useState(0)
  const auditRefreshTimers = useRef([])

  const generatedForCurrentRequest = briefResult?.requestId === id
  const aiBrief = generatedForCurrentRequest ? briefResult.brief : data?.aiBrief
  const briefUnavailable = data && !aiBrief

  useEffect(() => {
    if (!loading && data && location.hash === '#ai-brief') {
      document.getElementById('ai-brief')?.scrollIntoView({ block: 'start' })
    }
  }, [data, loading, location.hash])

  useEffect(() => () => {
    auditRefreshTimers.current.forEach((timer) => window.clearTimeout(timer))
  }, [])

  async function handleGenerateBrief() {
    setGeneratingBrief(true)
    setBriefError(null)
    try {
      const brief = await generateRequestBrief(id)
      setBriefResult({ requestId: id, brief })
    } catch (err) {
      setBriefError(err instanceof Error ? err.message : 'Failed to generate the AI brief.')
    } finally {
      setGeneratingBrief(false)
    }
  }

  function handleTriageSaved(result) {
    refetch()
    setAuditRefreshVersion((version) => version + 1)
    if (result.webhook_queued) {
      auditRefreshTimers.current.forEach((timer) => window.clearTimeout(timer))
      auditRefreshTimers.current = [1500, 6000].map((delay) => (
        window.setTimeout(() => {
          setAuditRefreshVersion((version) => version + 1)
        }, delay)
      ))
    }
  }

  return (
    <div className="page">
      <header className="page__topbar">
        <span className="page__brand">Request Intake &amp; Triage</span>
        <Link to={Routes.REVIEWER_QUEUE}>
          <Button variant="secondary">Back to queue</Button>
        </Link>
      </header>

      <main className="page__body">
        {loading && <LoadingState rows={2} />}

        {!loading && error && <ErrorState message={error} onRetry={refetch} />}

        {!loading && !error && notFound && (
          <EmptyState
            title="Request not found"
            text="This request may have been removed or the link is invalid."
            action={
              <Link to={Routes.REVIEWER_QUEUE}>
                <Button variant="secondary">Back to queue</Button>
              </Link>
            }
          />
        )}

        {!loading && !error && data && (
          <>
            <div className="detail-heading">
              <div>
                <span className="detail-heading__eyebrow">Request from {data.requester}</span>
                <h1 className="detail-heading__title">{data.title}</h1>
              </div>
              <div className="detail-heading__badges">
                <StatusBadge status={data.status} />
                <PriorityBadge priority={data.priority} />
              </div>
            </div>

            <section className="detail-card">
              <h2 className="detail-card__title">Original Request</h2>
              <dl className="detail-meta">
                <div>
                  <dt>Requester</dt>
                  <dd>{data.requester}</dd>
                </div>
                <div>
                  <dt>Business area</dt>
                  <dd>{data.businessArea ?? '—'}</dd>
                </div>
                <div>
                  <dt>Created</dt>
                  <dd>{formatDateTime(data.createdAt)}</dd>
                </div>
              </dl>
              <div className="detail-block">
                <h3>Original request</h3>
                <p className="detail-original">{data.original}</p>
              </div>
            </section>

            <section id="ai-brief" className="detail-card">
              <div className="detail-card__titlerow">
                <h2 className="detail-card__title">AI Generated Brief</h2>
                <div className="detail-card__titleactions">
                  <span className="detail-readonly-tag">Read-only</span>
                  {briefUnavailable && (
                    <Button
                      variant="secondary"
                      onClick={handleGenerateBrief}
                      disabled={generatingBrief}
                    >
                      {generatingBrief
                        ? 'Generating...'
                        : data.briefGenerationStatus === 'FAILED'
                          ? 'Retry brief'
                          : 'Generate brief'}
                    </Button>
                  )}
                </div>
              </div>

              {briefUnavailable && (
                <p className="brief-feedback brief-feedback--error" role="alert">
                  {briefError
                    ?? data.briefGenerationError
                    ?? 'The AI brief is not available yet.'}
                </p>
              )}

              {aiBrief && (
                <>
                  <div className="detail-block">
                    <h3>Problem summary</h3>
                    <p>{aiBrief.problemSummary}</p>
                  </div>

                  <div className="detail-block">
                    <h3>Likely users</h3>
                    <ul>
                      {aiBrief.likelyUsers.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="detail-block">
                    <h3>Recommended solution type</h3>
                    <p>{aiBrief.recommendedSolutionType}</p>
                  </div>

                  <div className="detail-block">
                    <h3>Clarifying questions</h3>
                    <ul>
                      {aiBrief.clarifyingQuestions.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="detail-block">
                    <h3>Risks</h3>
                    <ul>
                      {aiBrief.risks.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="detail-block">
                    <h3>Suggested next action</h3>
                    <p>{aiBrief.suggestedNextAction}</p>
                  </div>
                </>
              )}
            </section>

            <TriagePanel key={id} request={data} onSaved={handleTriageSaved} />
            <AuditHistory
              key={id}
              requestId={id}
              refreshVersion={auditRefreshVersion}
            />
          </>
        )}
      </main>
    </div>
  )
}
