// Request domain model. JS project, so interfaces are expressed as JSDoc typedefs
// (editor-checked). Mirror these when the FastAPI schemas are finalized.

/**
 * Data captured from the Submit Request form.
 * @typedef {Object} BusinessRequestInput
 * @property {string} title
 * @property {string} description        Unstructured business request text.
 * @property {string} requesterName      Name or identifier of the requester.
 * @property {string} [businessArea]     Optional business area.
 */

/**
 * A persisted business request returned by the backend.
 * @typedef {Object} BusinessRequest
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} requesterName
 * @property {string} [businessArea]
 * @property {string} status             One of RequestStatus values.
 * @property {string} priority           One of Priority values.
 * @property {string} createdAt          ISO timestamp.
 */

/**
 * AI-generated triage brief. Read-only for reviewers in this MVP.
 * @typedef {Object} AiBrief
 * @property {string} problemSummary
 * @property {string[]} likelyUsers
 * @property {string} recommendedSolutionType
 * @property {string[]} clarifyingQuestions
 * @property {string[]} risks
 * @property {string} suggestedNextAction
 */

/**
 * Full request detail shown to a reviewer.
 * @typedef {Object} RequestDetail
 * @property {string} id
 * @property {string} title
 * @property {string} original          Original unstructured request text.
 * @property {string} requester
 * @property {string} [businessArea]
 * @property {string} createdAt
 * @property {string} status
 * @property {string} priority
 * @property {string} owner
 * @property {string} notes
 * @property {AiBrief} aiBrief
 */

/**
 * Editable triage fields the reviewer can save.
 * @typedef {Object} TriageUpdate
 * @property {string} status
 * @property {string} priority
 * @property {string} owner
 * @property {string} notes
 */

export {}
