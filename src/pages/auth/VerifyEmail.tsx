import { useLocation } from 'react-router-dom'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { Button } from '../../components/ui/button'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

export function VerifyEmail() {
  const location = useLocation()
  const email = location.state?.email
  const supabase = useSupabaseClient()

  const handleResendEmail = async () => {
    await supabase.auth.resend({
      type: 'signup',
      email: email,
    })
  }

  return (
    <AuthLayout
      title="Check your email"
      description="We've sent you a verification link"
    >
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-4">
          We've sent a verification link to <strong>{email}</strong>
        </p>
        <p className="text-sm text-gray-600 mb-8">
          Click the link in the email to verify your account and continue setting up your organization.
        </p>
        <Button
          variant="outline"
          onClick={handleResendEmail}
          className="mt-4"
        >
          Resend verification email
        </Button>
      </div>
    </AuthLayout>
  )
} 