// Thin HTTP client for the FastAPI backend: base URL, bearer token, JSON, errors.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8010'
const TOKEN_KEY = 'auth.token'

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    /* ignore storage failures */
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* ignore storage failures */
  }
}

function extractErrorMessage(data, status) {
  if (typeof data === 'string' && data) return data
  if (data && typeof data.detail === 'string') return data.detail
  if (data && Array.isArray(data.detail)) {
    return data.detail.map((d) => d.msg).filter(Boolean).join(', ')
  }
  return `Request failed (${status})`
}

/**
 * Perform a JSON request against the API.
 * @param {string} path e.g. '/api/auth/login'
 * @param {{ method?: string, body?: unknown, auth?: boolean, headers?: object, responseType?: 'json'|'blob' }} [options]
 */
export async function apiFetch(
  path,
  { method = 'GET', body, auth = true, headers = {}, responseType = 'json' } = {},
) {
  const finalHeaders = { Accept: 'application/json', ...headers }
  if (body !== undefined) {
    finalHeaders['Content-Type'] = 'application/json'
  }
  if (auth) {
    const token = getToken()
    if (token) finalHeaders.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (res.status === 204) return null

  if (!res.ok) {
    const text = await res.text()
    let data = text
    if (text) {
      try {
        data = JSON.parse(text)
      } catch {
        data = text
      }
    }
    if (res.status === 401) clearToken()
    const error = new Error(extractErrorMessage(data, res.status))
    error.status = res.status
    throw error
  }

  if (responseType === 'blob') return res.blob()

  const text = await res.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }
  return data
}
