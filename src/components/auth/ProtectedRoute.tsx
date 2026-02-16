import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useSpace } from '../../context/SpaceContext'
import { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { currentUser, loading: authLoading } = useAuth()
  const { userSpaces, loading: spaceLoading } = useSpace()
  const location = useLocation()

  if (authLoading || spaceLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  // If user has no spaces and not on create-first-space page, redirect
  if (userSpaces.length === 0 && location.pathname !== '/create-first-space') {
    return <Navigate to="/create-first-space" replace />
  }

  return <>{children}</>
}
