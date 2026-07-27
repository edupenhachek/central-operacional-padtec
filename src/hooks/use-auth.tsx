import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'

export interface UserRecord {
  id: string
  email: string
  name?: string
  role?: 'NOC' | 'COPE' | 'BKO' | 'ADMIN'
  avatar?: string
}

interface AuthContextType {
  user: UserRecord | null
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any }>
  signOut: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserRecord | null>(
    pb.authStore.isValid ? (pb.authStore.record as unknown as UserRecord) : null,
  )
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(pb.authStore.isValid)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((_token, record) => {
      setUser(pb.authStore.isValid ? (record as unknown as UserRecord) : null)
      setIsAuthenticated(pb.authStore.isValid)
    })

    if (pb.authStore.isValid) {
      pb.collection('users')
        .authRefresh()
        .then((res) => {
          setUser(res.record as unknown as UserRecord)
        })
        .catch(() => {
          pb.authStore.clear()
        })
        .finally(() => setLoading(false))
    } else {
      if (pb.authStore.record) pb.authStore.clear()
      setLoading(false)
    }

    return () => {
      unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const res = await pb.collection('users').authWithPassword(email, password)
      setUser(res.record as unknown as UserRecord)
      setIsAuthenticated(true)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      await pb.collection('users').create({
        email,
        password,
        passwordConfirm: password,
        name: name || email.split('@')[0],
        role: 'BKO',
      })
      const res = await pb.collection('users').authWithPassword(email, password)
      setUser(res.record as unknown as UserRecord)
      setIsAuthenticated(true)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signOut = () => {
    pb.authStore.clear()
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, signIn, signUp, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
