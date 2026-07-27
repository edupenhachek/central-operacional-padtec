import { ReactNode } from 'react'
import { Navigate } from 'react'
import { useAuth } from '@/hooks/use-auth'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: 'ADMIN' | 'BKO' | 'COPE' | 'NOC'
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user?.role !== requiredRole && user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
