import { apiFetch, clearToken, setToken } from './http'

/**
 * Register a new account.
 * @param {{ name: string, email: string, password: string, role: string }} input
 * @returns {Promise<{ id: number, name: string, email: string, role: string }>}
 */
export async function signup({ name, email, password, role }) {
  return apiFetch('/api/auth/signup', {
    method: 'POST',
    auth: false,
    body: { name, email, password, role },
  })
}

/**
 * Log in, persist the JWT, and return the authenticated user.
 * @param {{ email: string, password: string }} input
 * @returns {Promise<{ id: number, name: string, email: string, role: string }>}
 */
export async function login({ email, password }) {
  const data = await apiFetch('/api/auth/login', {
    method: 'POST',
    auth: false,
    body: { email, password },
  })
  setToken(data.access_token)
  return data.user
}

/**
 * Fetch the currently authenticated user using the stored token.
 * @returns {Promise<{ id: number, name: string, email: string, role: string }>}
 */
export async function getMe() {
  return apiFetch('/api/auth/me')
}

/** Log out on the server (best-effort) and always clear the local token. */
export async function logout() {
  try {
    await apiFetch('/api/auth/logout', { method: 'POST' })
  } catch {
    /* ignore: logout is best-effort for stateless JWTs */
  } finally {
    clearToken()
  }
}
