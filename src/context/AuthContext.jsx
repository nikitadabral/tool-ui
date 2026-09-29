import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import * as authService from '../services/authService'
import { clearToken, getToken } from '../services/http'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [initializing, setInitializing] = useState(true)
  const [loading, setLoading] = useState(false)

  // On load, restore the session from a stored token by fetching /me.
  useEffect(() => {
    let active = true
    async function bootstrap() {
      if (!getToken()) {
        setInitializing(false)
        return
      }
      try {
        const me = await authService.getMe()
        if (active) setUser(me)
      } catch {
        clearToken()
      } finally {
        if (active) setInitializing(false)
      }
    }
    bootstrap()
    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async ({ email, password }) => {
    setLoading(true)
    try {
      const loggedIn = await authService.login({ email, password })
      setUser(loggedIn)
      return loggedIn
    } finally {
      setLoading(false)
    }
  }, [])

  const signup = useCallback(async ({ name, email, password, role }) => {
    setLoading(true)
    try {
      await authService.signup({ name, email, password, role })
      const loggedIn = await authService.login({ email, password })
      setUser(loggedIn)
      return loggedIn
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      role: user?.role ?? null,
      isAuthenticated: Boolean(user),
      initializing,
      loading,
      login,
      signup,
      logout,
    }),
    [user, initializing, loading, login, signup, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
