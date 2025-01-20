import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { AuthLayout } from '../../components/layout/AuthLayout'

export function AuthCallback() {
  const navigate = useNavigate()
  const supabase = useSupabaseClient()

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error('Error:', error.message)
        navigate('/auth/sign-in')
        return
      }

      if (user) {
        // Check if user is already part of any organization
        const { data: memberships } = await supabase
          .from('org_members')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .limit(1)

        if (memberships && memberships.length > 0) {
          navigate('/dashboard', { replace: true })
        } else {
          navigate('/auth/create-org', { replace: true })
        }
      }
    }

    handleCallback()
  }, [navigate, supabase])

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