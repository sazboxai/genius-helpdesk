import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useEffect } from 'react'

interface PrivateRouteProps {
  children: React.ReactNode
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { user, organization, loading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!loading) {
      console.log('PrivateRoute state:', { user, organization, location }) // Debug log
      
      // First check: If no user, always redirect to sign-in
      if (!user) {
        navigate('/auth/sign-in', { 
          replace: true,
          state: { from: location }
        })
        return
      }

      // Second check: Only check organization if user exists
      if (user && !organization && !token) {
        const isInvitationFlow = 
          location.pathname.includes('/auth/invitation-signup') || 
          location.pathname.includes('/auth/join') ||
          location.pathname.includes('/auth/accept-invite')

        if (!isInvitationFlow) {
          navigate('/auth/create-org', { replace: true })
        }
      }
    }
  }, [user, organization, loading, location, token])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  // Only render children if user exists
  return user ? <>{children}</> : null
} 