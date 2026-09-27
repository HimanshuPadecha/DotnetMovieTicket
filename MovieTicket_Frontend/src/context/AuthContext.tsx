import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { authApi } from '../api'
import type { AuthResponse, Role, User } from '../types'
import { getErrorMessage } from '../api/client'

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  refreshProfile: () => Promise<void>
  updateUser: (user: User) => void
  isAuthenticated: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthState | null>(null)

function persist(auth: AuthResponse) {
  localStorage.setItem('mt_token', auth.token)
  localStorage.setItem('mt_user', JSON.stringify(auth.user))
  localStorage.setItem('mt_expires', auth.expiresAt)
}

function clear() {
  localStorage.removeItem('mt_token')
  localStorage.removeItem('mt_user')
  localStorage.removeItem('mt_expires')
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem('mt_user')
      return raw ? (JSON.parse(raw) as User) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('mt_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const boot = async () => {
      const t = localStorage.getItem('mt_token')
      if (!t) {
        setLoading(false)
        return
      }
      try {
        const me = await authApi.me()
        setUser(me)
        setToken(t)
        localStorage.setItem('mt_user', JSON.stringify(me))
      } catch {
        clear()
        setUser(null)
        setToken(null)
      } finally {
        setLoading(false)
      }
    }
    void boot()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await authApi.login(email, password)
      persist(res)
      setToken(res.token)
      setUser(res.user)
    } catch (e) {
      throw new Error(getErrorMessage(e, 'Login failed'))
    }
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      const res = await authApi.register(name, email, password)
      persist(res)
      setToken(res.token)
      setUser(res.user)
    } catch (e) {
      throw new Error(getErrorMessage(e, 'Registration failed'))
    }
  }, [])

  const logout = useCallback(() => {
    clear()
    setUser(null)
    setToken(null)
  }, [])

  const refreshProfile = useCallback(async () => {
    const me = await authApi.me()
    setUser(me)
    localStorage.setItem('mt_user', JSON.stringify(me))
  }, [])

  const updateUser = useCallback((u: User) => {
    setUser(u)
    localStorage.setItem('mt_user', JSON.stringify(u))
  }, [])

  const value = useMemo<AuthState>(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      refreshProfile,
      updateUser,
      isAuthenticated: !!token && !!user,
      isAdmin: (user?.role as Role) === 'ADMIN',
    }),
    [user, token, loading, login, register, logout, refreshProfile, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
