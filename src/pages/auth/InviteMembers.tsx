import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { useAuth } from '../../contexts/AuthContext'
import type { Database } from '../../types/database'
import type { UserRole } from '../../types/database'
import { toast } from '../../components/ui/use-toast'
import { PlusIcon, Trash2Icon } from 'lucide-react'

interface InviteForm {
  email: string
  role: UserRole
}

const INITIAL_FORM = { email: '', role: 'agent' as UserRole }

export function InviteMembers() {
  const navigate = useNavigate()
  const { organization } = useAuth()
  const supabase = useSupabaseClient<Database>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [invites, setInvites] = useState<InviteForm[]>([INITIAL_FORM])

  const addInvite = () => {
    setInvites([...invites, { ...INITIAL_FORM }])
  }

  const removeInvite = (index: number) => {
    setInvites(invites.filter((_, i) => i !== index))
  }

  const updateInvite = (index: number, field: keyof InviteForm, value: string) => {
    const newInvites = [...invites]
    newInvites[index] = { ...newInvites[index], [field]: value }
    setInvites(newInvites)
  }

  const handleSkip = () => {
    navigate('/dashboard', { replace: true })
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!organization) {
      setError('No organization selected')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const results = await Promise.all(
        invites.map(async ({ email, role }) => {
          if (!email || !role) {
            throw new Error('Email and role are required')
          }

          // Create the invite code
          const invite_code = crypto.randomUUID()

          // Call the edge function
          const { data, error } = await supabase.functions.invoke('invite-member', {
            body: {
              email: email.toLowerCase(),
              organization_id: organization.id,
              invite_code,
              role,
              redirectBaseUrl: window.location.origin
            }
          })

          // Check if it's a member exists error (409 status)
          if (error?.message?.includes('already')) {
            toast({
              title: "Member Exists",
              description: error.message,
              variant: "destructive"
            })
            return { email, skipped: true, reason: error.message }
          }

          // Handle other errors
          if (error) {
            console.error('Edge function error:', error)
            throw new Error(error.message || 'Failed to send invitation')
          }

          // Success case
          return { email, success: true }
        })
      )

      const successful = results.filter(r => r.success).length
      const skipped = results.filter(r => r.skipped).length

      if (successful > 0) {
        toast({
          title: "Invitations Sent",
          description: `Successfully sent ${successful} invitation${successful !== 1 ? 's' : ''}${
            skipped > 0 ? ` (${skipped} skipped)` : ''
          }`,
        })
        navigate('/teams')
      } else if (skipped > 0) {
        setError('No new invitations were sent - all emails were already members or invited')
      }

    } catch (err) {
      console.error('Error sending invites:', err)
      setError(err instanceof Error ? err.message : 'Failed to send invitations')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Invite your team"
      description="Get started by adding your team members"
    >
      <form onSubmit={handleInvite} className="space-y-6">
        {error && (
          <div className="text-sm text-red-600">{error}</div>
        )}

        <div className="space-y-4">
          {invites.map((invite, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="Email address"
                  value={invite.email}
                  onChange={(e) => updateInvite(index, 'email', e.target.value)}
                  required
                />
              </div>
              <div className="w-32">
                <select
                  value={invite.role}
                  onChange={(e) => updateInvite(index, 'role', e.target.value as UserRole)}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                >
                  <option value="admin">Admin</option>
                  <option value="agent">Agent</option>
                </select>
              </div>
              {invites.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeInvite(index)}
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={addInvite}
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Add another
        </Button>

        <div className="flex gap-4">
          <Button
            type="submit"
            className="flex-1"
            disabled={loading}
          >
            {loading ? 'Sending invites...' : 'Send invites'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleSkip}
            disabled={loading}
          >
            Skip for now
          </Button>
        </div>
      </form>
    </AuthLayout>
  )
} 