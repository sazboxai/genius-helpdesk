import { useEffect, useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Button } from '../ui/button'
import { MoreHorizontal, Shield, UserX } from 'lucide-react'
import { useToast } from '../ui/use-toast'
import { useAuth } from '../../contexts/AuthContext'
import type { Database } from '../../types/database'

type Member = {
  id: string
  user_id: string
  role: string
  status: string
  invited_email?: string
  user?: {
    email: string
    user_metadata: {
      full_name: string
      avatar_url?: string
    }
  } | null
}

interface MembersListProps {
  organizationId: string
}

export function MembersList({ organizationId }: MembersListProps) {
  const supabase = useSupabaseClient<Database>()
  const { user } = useAuth()
  const { toast } = useToast()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMembers()
  }, [organizationId])

  const loadMembers = async () => {
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
        .eq('org_id', organizationId)
        .order('role', { ascending: false })
        .order('status', { ascending: false })

      if (error) throw error
      setMembers(data || [])
    } catch (error) {
      console.error('Error loading members:', error)
      toast({
        title: 'Error',
        description: 'Failed to load team members',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMember = async (memberId: string, userId: string) => {
    // Don't allow removing yourself
    if (userId === user?.id) {
      toast({
        title: 'Error',
        description: 'You cannot remove yourself from the team',
        variant: 'destructive'
      })
      return
    }

    try {
      const { error } = await supabase
        .from('org_members')
        .delete()
        .eq('id', memberId)

      if (error) throw error

      toast({
        title: 'Member removed',
        description: 'The team member has been removed successfully.'
      })

      loadMembers()
    } catch (error) {
      console.error('Error removing member:', error)
      toast({
        title: 'Error',
        description: 'Failed to remove team member',
        variant: 'destructive'
      })
    }
  }

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('org_members')
        .update({ role: newRole })
        .eq('id', memberId)

      if (error) throw error

      toast({
        title: 'Role updated',
        description: 'The member role has been updated successfully.'
      })

      loadMembers()
    } catch (error) {
      console.error('Error updating role:', error)
      toast({
        title: 'Error',
        description: 'Failed to update member role',
        variant: 'destructive'
      })
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Team Members</h3>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name/Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                <div>
                  <div className="font-medium">
                    {member.user?.user_metadata?.full_name || 'Pending'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {member.user?.email || member.invited_email}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  {member.role === 'admin' && (
                    <Shield className="h-4 w-4 mr-1 text-blue-500" />
                  )}
                  <span className="capitalize">{member.role}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  member.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {member.status}
                </span>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {member.role !== 'admin' && (
                      <DropdownMenuItem
                        onClick={() => handleRoleChange(member.id, 'admin')}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Make Admin
                      </DropdownMenuItem>
                    )}
                    {member.role === 'admin' && (
                      <DropdownMenuItem
                        onClick={() => handleRoleChange(member.id, 'agent')}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Remove Admin
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => handleRemoveMember(member.id, member.user_id)}
                      className="text-red-600"
                      disabled={member.user_id === user?.id}
                    >
                      <UserX className="h-4 w-4 mr-2" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 