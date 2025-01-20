import { useState, useEffect } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Button } from '../../components/ui/button'
import { PlusIcon } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { InviteMembersDialog } from '../../components/teams/InviteMembersDialog'
import type { Database } from '../../types/database'

type Member = {
  id: string
  email: string
  role: string
  status: string
  invited_email?: string
  user?: {
    email: string
    user_metadata: {
      full_name: string
    }
  } | null
}

export function Teams() {
  const { organization } = useAuth()
  const supabase = useSupabaseClient<Database>()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)

  useEffect(() => {
    if (organization) {
      loadMembers()
    }
  }, [organization])

  const loadMembers = async () => {
    if (!organization) return

    try {
      const { data, error } = await supabase
        .from('org_members')
        .select(`
          id,
          user_id,
          role,
          status,
          invited_email,
          user:users(email, user_metadata)
        `)
        .eq('org_id', organization.id)
        .order('status', { ascending: false })

      if (error) throw error
      setMembers(data || [])
    } catch (error) {
      console.error('Error loading members:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInvitationsSent = () => {
    loadMembers()
    setIsInviteDialogOpen(false)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Team Members</h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage your team members and their roles
            </p>
          </div>
          <Button onClick={() => setIsInviteDialogOpen(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Invite Members
          </Button>
        </div>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name/Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((member) => (
                <tr key={member.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {member.user?.user_metadata?.full_name || 'Pending'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {member.user?.email || member.invited_email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      member.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <InviteMembersDialog 
        open={isInviteDialogOpen}
        onClose={() => setIsInviteDialogOpen(false)}
        onInvitationsSent={handleInvitationsSent}
      />
    </DashboardLayout>
  )
} 