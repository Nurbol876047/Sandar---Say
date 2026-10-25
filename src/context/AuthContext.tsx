import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, ApiError, type ApiChild, type ApiUser } from '../lib/api'
import { loadJSON, removeJSON, saveJSON } from '../utils/storage'

interface AuthState {
  token: string | null
  activeChildId: string | null
}

interface AuthContextValue {
  user: ApiUser | null
  token: string | null
  children: ApiChild[]
  activeChildId: string | null
  loading: boolean
  setActiveChildId: (id: string | null) => void
  addChild: (name: string) => Promise<void>
  register: (email: string, password: string, name: string, childName: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children: reactChildren }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => loadJSON('auth', { token: null, activeChildId: null }))
  const [user, setUser] = useState<ApiUser | null>(null)
  const [kids, setKids] = useState<ApiChild[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    saveJSON('auth', state)
  }, [state])

  useEffect(() => {
    let cancelled = false
    async function hydrate() {
      if (!state.token) {
        setLoading(false)
        return
      }
      try {
        const res = await api.me(state.token)
        if (cancelled) return
        setUser(res.user)
        setKids(res.children)
        if (res.user.role === 'parent' && !state.activeChildId && res.children[0]) {
          setState((s) => ({ ...s, activeChildId: res.children[0].id }))
        }
      } catch {
        if (!cancelled) setState({ token: null, activeChildId: null })
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    hydrate()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.token])

  const register = useCallback(async (email: string, password: string, name: string, childName: string) => {
    const res = await api.register({ email, password, name, childName })
    setUser(res.user)
    setKids(res.children)
    setState({ token: res.token, activeChildId: res.children[0]?.id ?? null })
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login({ email, password })
    setUser(res.user)
    setKids(res.children)
    setState({ token: res.token, activeChildId: res.children[0]?.id ?? null })
  }, [])

  const logout = useCallback(async () => {
    if (state.token) {
      try {
        await api.logout(state.token)
      } catch {
        // ignore network errors on logout
      }
    }
    setUser(null)
    setKids([])
    setState({ token: null, activeChildId: null })
    removeJSON('auth')
  }, [state.token])

  const addChild = useCallback(
    async (name: string) => {
      if (!state.token) return
      const res = await api.createChild(state.token, name)
      setKids((prev) => [...prev, res.child])
      setState((s) => (s.activeChildId ? s : { ...s, activeChildId: res.child.id }))
    },
    [state.token],
  )

  const setActiveChildId = useCallback((id: string | null) => {
    setState((s) => ({ ...s, activeChildId: id }))
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token: state.token,
      children: kids,
      activeChildId: state.activeChildId,
      loading,
      setActiveChildId,
      addChild,
      register,
      login,
      logout,
    }),
    [user, state.token, kids, state.activeChildId, loading, setActiveChildId, addChild, register, login, logout],
  )

  return <AuthContext.Provider value={value}>{reactChildren}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export { ApiError }
