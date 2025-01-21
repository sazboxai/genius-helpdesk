import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { AuthLayout } from '../../components/layout/AuthLayout'

export function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const supabase = useSupabaseClient()

  useEffect(() => {
    const token = searchParams.get('invitation_token')
    if (token) {
      navigate(`/auth/invitation-signup?token=${token}`)
    } else {
      navigate('/dashboard')
    }
  }, [searchParams])

  return (
    <AuthLayout
      title="Verifying..."
      description="Please wait while we verify your account"
    >
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    </AuthLayout>
  )
} 