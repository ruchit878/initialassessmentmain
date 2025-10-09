'use client'
import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

export type User = {
  sub: string
  name: string
  given_name?: string
  family_name?: string
  email?: string
  picture?: string
}

type AuthContextShape = {
  user: User | null
  isLoading: boolean
  setUser: (u: User | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextShape>({
  user: null,
  isLoading: true,
  setUser: () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setLoading] = useState(true)
  const router = useRouter()

  // run-once guard to prevent StrictMode double init
  const didInitRef = useRef(false)
  useEffect(() => {
    if (didInitRef.current) return
    didInitRef.current = true

    const saved = typeof window !== 'undefined' ? localStorage.getItem('socialUser') : null
    if (saved) setUser(JSON.parse(saved))
    setLoading(false)
  }, [])

  // avoid redundant writes to localStorage
  const lastSerialized = useRef<string | null>(null)
  useEffect(() => {
    const serialized = user ? JSON.stringify(user) : null
    if (serialized === lastSerialized.current) return
    lastSerialized.current = serialized

    if (typeof window === 'undefined') return
    if (user) localStorage.setItem('socialUser', serialized)
    else localStorage.removeItem('socialUser')
  }, [user])

  const logout = () => {
    setUser(null)
    router.push('/')
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
