import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { repo } from '../services/repo'
import type { User } from '../types'

interface AuthState {
  user: User | null
  loading: boolean
  refresh: () => Promise<void>
  login: (userId: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  refresh: async () => {},
  login: async () => {},
  logout: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const u = await repo.getCurrentUser()
    setUser(u)
  }, [])

  useEffect(() => {
    repo.getCurrentUser().then((u) => {
      setUser(u)
      setLoading(false)
    })
    const unsub = repo.subscribe(() => {
      repo.getCurrentUser().then(setUser)
    })
    return unsub
  }, [])

  const login = useCallback(async (userId: string) => {
    await repo.switchUser(userId)
    const u = await repo.getCurrentUser()
    setUser(u)
  }, [])

  const logout = useCallback(async () => {
    await repo.switchUser('stu-001')
    setUser(await repo.getCurrentUser())
  }, [])

  return <AuthContext.Provider value={{ user, loading, refresh, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}