import { useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Dialog } from '@radix-ui/react-dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { useAuth } from '../../contexts/AuthContext'
import { PlusIcon, Trash2Icon } from 'lucide-react'
import { toast } from '../ui/use-toast'
import type { Database } from '../../types/database'
import type { UserRole } from '../../types/database'

interface InviteForm {
  email: string
  role: UserRole
}

const INITIAL_FORM = { email: '', role: 'agent' as UserRole }

interface Props {
  open: boolean
  onClose: () => void
  onInvitationsSent: () => void
}

export function InviteMembersDialog({ open, onClose, onInvitationsSent }: Props) {
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

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!organization) return

    setLoading(true)
    setError(null)

    try {
      await Promise.all(
        invites.map(async ({ email, role }) => {
          const { error: memberError, data: membership } = await supabase
            .from('org_members')
            .insert({
              org_id: organization.id,
              invited_email: email.toLowerCase(),
              role,
              status: 'pending',
              invite_code: crypto.randomUUID()
            })
            .select()
            .single()

          if (memberError) throw memberError

          const { error: inviteError } = await supabase.functions.invoke(
            'invite-member',
            {
              body: {
                email: email.toLowerCase(),
                organization_id: organization.id,
                invite_code: membership.invite_code,
                role: role
              }
            }
          )

          if (inviteError) throw inviteError
        })
      )

      toast({
        title: "Invitations sent successfully!",
        description: "Team members will receive an email to join your organization.",
      })

      onInvitationsSent()
      setInvites([INITIAL_FORM])
    } catch (err) {
      setError(
        err instanceof Error 
          ? err.message 
          : 'Failed to send invitations. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-medium mb-4">Invite Team Members</h3>
          
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
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  )
} 