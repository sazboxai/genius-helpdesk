import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { useAuth } from '../../contexts/AuthContext'
import type { Database } from '../../types/database'

export function JoinOrganization() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const supabase = useSupabaseClient<Database>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inviteCode, setInviteCode] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      // Verify and accept invitation
      const { data: invitation, error: inviteError } = await supabase
        .from('org_members')
        .select('*, organization:organizations(*)')
        .eq('invite_code', inviteCode)
        .eq('invited_email', user.email)
        .single()

      if (inviteError) throw new Error('Invalid or expired invite code')

      // Update membership status
      const { error: updateError } = await supabase
        .from('org_members')
        .update({
          status: 'active',
          joined_at: new Date().toISOString(),
          user_id: user.id,
          invite_code: null // Clear the invite code after use
        })
        .eq('id', invitation.id)

      if (updateError) throw updateError

      navigate(`/org/${invitation.organization.id}/dashboard`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Join Organization"
      description="Enter your invitation code"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <div>
          <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700">
            Invitation Code
          </label>
          <Input
            id="inviteCode"
            type="text"
            required
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            className="mt-1"
            placeholder="Enter your invitation code"
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Joining...' : 'Join Organization'}
        </Button>

        <p className="text-center text-sm text-gray-600">
          Don't have an invite code?{' '}
          <a href="/auth/create-org" className="font-medium text-blue-600 hover:text-blue-500">
            Create a new organization
          </a>
        </p>
      </form>
    </AuthLayout>
  )
} 