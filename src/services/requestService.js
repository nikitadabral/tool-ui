import { Priority } from '../constants/requests'
import { apiFetch } from './http'

// Parse the combined free-text back into display fields (see buildRequestText).
function parseRequestText(text) {
  const raw = text ?? ''
  let title = ''
  let businessArea
  const bodyLines = []
  for (const line of raw.split('\n')) {
    if (line.startsWith('Title: ')) {
      title = line.slice('Title: '.length).trim()
    } else if (line.startsWith('Business area: ')) {
      businessArea = line.slice('Business area: '.length).trim()
    } else {
      bodyLines.push(line)
    }
  }
  const description = bodyLines.join('\n').trim()
  if (!title) {
    title = (description.split('\n')[0] || raw).trim().slice(0, 80) || 'Untitled request'
  }
  return { title, description: description || raw.trim(), businessArea }
}

// Map a backend request row to the card shape used by the list screens.
function toCard(row) {
  const { title, description } = parseRequestText(row.request_text)
  return {
    id: row.id,
    title,
    summary: description,
    status: row.status,
    priority: row.priority ?? undefined,
    createdAt: row.created_at,
    owner: row.owner || undefined,
    requester: row.requester_name || undefined,
    requesterId: row.requester_id ?? undefined,
  }
}

// Assign a stable, per-requester sequential display number (#1, #2, …).
// Numbering follows creation order (ascending id) so existing numbers never
// shift when new requests are added; the returned array order is preserved.
function withRequestNumbers(cards) {
  const counters = new Map()
  const numberById = new Map()
  const byCreation = [...cards].sort((a, b) => a.id - b.id)
  for (const card of byCreation) {
    const key = card.requesterId ?? card.requester ?? 'unknown'
    const next = (counters.get(key) ?? 0) + 1
    counters.set(key, next)
    numberById.set(card.id, next)
  }
  return cards.map((card) => ({ ...card, number: numberById.get(card.id) }))
}

/**
 * Fetch the requests submitted by the current requester.
 * @returns {Promise<Array<object>>}
 */
export async function getMyRequests() {
  const rows = await apiFetch('/api/requests/mine')
  return withRequestNumbers(rows.map(toCard))
}

/**
 * Fetch all submitted requests for the reviewer triage queue.
 * @returns {Promise<Array<object>>}
 */
export async function getAllRequests() {
  const rows = await apiFetch('/api/requests')
  return withRequestNumbers(rows.map(toCard))
}

/**
 * Export all reviewer-visible requests as a CSV file.
 * @returns {Promise<Blob>}
 */
export async function exportRequestsCsv() {
  return apiFetch('/api/requests/export/csv', {
    headers: { Accept: 'text/csv' },
    responseType: 'blob',
  })
}

/**
 * Submit a new business request to the FastAPI backend.
 * The form fields are combined into a single unstructured `request_text`, which
 * is what the backend persists. The returned shape stays UI-friendly.
 * @param {import('../types/request').BusinessRequestInput} input
 * @returns {Promise<import('../types/request').BusinessRequest>}
 */
export async function submitRequest(input) {
  const requestText = buildRequestText(input)
  const saved = await apiFetch('/api/requests', {
    method: 'POST',
    body: { request_text: requestText },
  })
  return {
    id: saved.id,
    title: input.title?.trim() || '',
    description: input.description.trim(),
    requesterName: input.requesterName?.trim() || '',
    status: saved.status,
    priority: saved.priority ?? Priority.MEDIUM,
    createdAt: saved.created_at,
  }
}

// Combine the request into one free-text block; title is optional.
function buildRequestText({ title, description }) {
  const trimmedTitle = title?.trim()
  const parts = []
  if (trimmedTitle) {
    parts.push(`Title: ${trimmedTitle}`, '')
  }
  parts.push(description.trim())
  return parts.join('\n')
}

function toAiBrief(brief) {
  return {
    problemSummary: brief.problem_summary,
    likelyUsers: brief.likely_users,
    recommendedSolutionType: brief.solution_type,
    clarifyingQuestions: brief.clarifying_questions,
    risks: brief.risks,
    suggestedNextAction: brief.next_action,
  }
}

/**
 * Generate and persist a structured AI brief for a request.
 * @param {string|number} id
 * @returns {Promise<import('../types/request').AiBrief>}
 */
export async function generateRequestBrief(id) {
  const brief = await apiFetch(`/api/requests/${id}/generate-brief`, {
    method: 'POST',
  })
  return toAiBrief(brief)
}

/**
 * Fetch a single request with its triage state and generated AI brief.
 * @param {string|number} id
 * @returns {Promise<import('../types/request').RequestDetail | null>}
 */
export async function getRequestById(id) {
  let row
  try {
    row = await apiFetch(`/api/requests/${id}`)
  } catch (err) {
    if (err?.status === 404) return null
    throw err
  }
  const { title, businessArea } = parseRequestText(row.request_text)
  return {
    id: row.id,
    title,
    original: row.request_text,
    requester: row.requester_name ?? 'Unknown',
    businessArea,
    createdAt: row.created_at,
    status: row.status,
    priority: row.priority ?? Priority.MEDIUM,
    owner: row.owner ?? '',
    notes: row.notes ?? '',
    briefGenerationStatus: row.brief_generation_status,
    briefGenerationError: row.brief_generation_error,
    aiBrief: row.generated_brief ? toAiBrief(row.generated_brief) : null,
  }
}

/**
 * Fetch a request's reviewer audit history in chronological order.
 * @param {string|number} id
 * @returns {Promise<Array<import('../types/request').AuditEvent>>}
 */
export async function getRequestAuditHistory(id) {
  const rows = await apiFetch(`/api/requests/${id}/audit-history`)
  return rows.map((row) => ({
    id: row.id,
    timestamp: row.timestamp,
    eventType: row.event_type,
    previousStatus: row.previous_status,
    newStatus: row.new_status,
    note: row.note,
    reviewerId: row.reviewer_id,
    reviewerName: row.reviewer_name,
  }))
}

/**
 * Persist reviewer triage changes to the backend.
 * @param {string|number} id
 * @param {import('../types/request').TriageUpdate} triage
 * @returns {Promise<object>}
 */
export async function updateRequestTriage(id, triage) {
  return apiFetch(`/api/requests/${id}/triage`, {
    method: 'PATCH',
    body: {
      status: triage.status,
      priority: triage.priority || null,
      owner: triage.owner?.trim() || null,
      notes: triage.notes?.trim() || null,
    },
  })
}

/**
 * Persist a reviewer status change only, preserving other triage fields.
 * @param {string|number} id
 * @param {string} status
 * @returns {Promise<object>}
 */
export async function updateRequestStatus(id, status) {
  return apiFetch(`/api/requests/${id}/triage`, {
    method: 'PATCH',
    body: { status },
  })
}
