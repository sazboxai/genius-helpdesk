import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function AcceptInvite() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) {
      navigate('/auth/sign-in')
      return
    }

    if (user) {
      // If user is logged in, send them to join organization
      navigate(`/auth/join?token=${token}`)
    } else {
      // If no user, send them to invitation signup
      navigate(`/auth/invitation-signup?token=${token}`)
    }
  }, [token, user])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  )
} 