import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, getApiErrorMessage, loadStoredToken, persistToken, setAuthToken } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setTokenState] = useState(() => loadStoredToken())
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setAuthToken(token || null)
    if (!token) {
      setUser(null)
      setReady(true)
      return
    }
    let cancelled = false
    api
      .get('/auth/me')
      .then((res) => {
        if (!cancelled) setUser(res.data.data.user)
      })
      .catch(() => {
        if (!cancelled) {
          persistToken(null)
          setAuthToken(null)
          setTokenState(null)
          setUser(null)
        }
      })
      .finally(() => {
        if (!cancelled) setReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [token])

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { token: t, user: u } = res.data.data
    persistToken(t)
    setAuthToken(t)
    setTokenState(t)
    setUser(u)
    return u
  }, [])

  const register = useCallback(async (payload) => {
    const res = await api.post('/auth/register', payload)
    const { token: t, user: u } = res.data.data
    persistToken(t)
    setAuthToken(t)
    setTokenState(t)
    setUser(u)
    return u
  }, [])

  const logout = useCallback(() => {
    persistToken(null)
    setAuthToken(null)
    setTokenState(null)
    setUser(null)
  }, [])

  const refreshMe = useCallback(async () => {
    try {
      const res = await api.get('/auth/me')
      setUser(res.data.data.user)
    } catch (e) {
      throw new Error(getApiErrorMessage(e))
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      ready,
      login,
      register,
      logout,
      refreshMe,
      isAdmin: user?.role === 'admin',
      isAnalyst: user?.role === 'analyst',
      isUser: user?.role === 'user',
    }),
    [user, token, ready, login, register, logout, refreshMe]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
