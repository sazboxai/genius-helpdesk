import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { AuthLayout } from '../../components/layout/AuthLayout'
import type { Database } from '../../types/database'

export function AcceptInvite() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const supabase = useSupabaseClient<Database>()
  const [error, setError] = useState<string | null>(null)
  const inviteCode = searchParams.get('code')

  useEffect(() => {
    const acceptInvite = async () => {
      if (!inviteCode) {
        setError('Invalid invitation link')
        return
      }

      try {
        // Get the pending membership
        const { data: membership, error: membershipError } = await supabase
          .from('org_members')
          .select('*')
          .eq('invite_code', inviteCode)
          .eq('status', 'pending')
          .single()

        if (membershipError || !membership) {
          throw new Error('Invalid or expired invitation')
        }

        // Update the membership status
        const { error: updateError } = await supabase
          .from('org_members')
          .update({ status: 'active' })
          .eq('id', membership.id)

        if (updateError) throw updateError

        // Redirect to dashboard
        navigate('/dashboard', { replace: true })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to accept invitation')
      }
    }

    acceptInvite()
  }, [inviteCode])

  if (error) {
    return (
      <AuthLayout
        title="Error"
        description={error}
      >
        <button
          onClick={() => navigate('/auth/sign-in')}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Go to Sign In
        </button>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Accepting Invitation"
      description="Please wait while we process your invitation..."
    >
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    </AuthLayout>
  )
} 