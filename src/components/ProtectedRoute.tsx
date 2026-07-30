import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth, type UserRole } from '@/hooks/use-auth'

export function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: ReactNode
  requiredRole?: UserRole
}) {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-muted-foreground">
        Carregando...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.primeiro_acesso) {
    return <Navigate to="/set-new-password" replace />
  }

  if (requiredRole) {
    const userRole = user?.role
    if (userRole !== requiredRole && userRole !== 'SUPERADMIN') {
      return <Navigate to="/" replace />
    }
  }

  return <>{children}</>
}

export function FirstAccessRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-muted-foreground">
        Carregando...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!user?.primeiro_acesso) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
