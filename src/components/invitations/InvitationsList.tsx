import { useEffect, useState } from 'react'
import { format } from 'date-fns'
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
import { MoreHorizontal, RefreshCw, XCircle } from 'lucide-react'
import { useToast } from '../ui/use-toast'
import { useInvitations } from '../../hooks/useInvitations'
import type { InvitationWithOrg } from '../../types/invitations'
import { INVITATION_STATUS } from '../../types/invitations'

interface InvitationsListProps {
  organizationId: string
}

export function InvitationsList({ organizationId }: InvitationsListProps) {
  const { toast } = useToast()
  const [invitations, setInvitations] = useState<InvitationWithOrg[]>([])
  const { loading, error, listInvitations, revokeInvitation, resendInvitation } = useInvitations(organizationId)

  useEffect(() => {
    loadInvitations()
  }, [organizationId])

  const loadInvitations = async () => {
    const data = await listInvitations()
    setInvitations(data)
  }

  const handleRevoke = async (id: string) => {
    const success = await revokeInvitation(id)
    if (success) {
      toast({
        title: 'Invitation revoked',
        description: 'The invitation has been revoked successfully.'
      })
      loadInvitations()
    }
  }

  const handleResend = async (id: string) => {
    const success = await resendInvitation(id)
    if (success) {
      toast({
        title: 'Invitation resent',
        description: 'The invitation has been resent successfully.'
      })
      loadInvitations()
    }
  }

  if (error) {
    return (
      <div className="text-red-600 p-4">
        Error loading invitations: {error}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Pending Invitations</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={loadInvitations}
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead>Department</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No pending invitations
              </TableCell>
            </TableRow>
          ) : (
            invitations.map((invitation) => (
              <TableRow key={invitation.id}>
                <TableCell>{invitation.email}</TableCell>
                <TableCell className="capitalize">{invitation.role}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    invitation.status === INVITATION_STATUS.PENDING
                      ? 'bg-yellow-100 text-yellow-800'
                      : invitation.status === INVITATION_STATUS.ACCEPTED
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {invitation.status}
                  </span>
                </TableCell>
                <TableCell>
                  {format(new Date(invitation.expires_at), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  {invitation.metadata?.department || '-'}
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
                      <DropdownMenuItem
                        onClick={() => handleResend(invitation.id)}
                        disabled={invitation.status !== INVITATION_STATUS.PENDING}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Resend
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleRevoke(invitation.id)}
                        disabled={invitation.status !== INVITATION_STATUS.PENDING}
                        className="text-red-600"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Revoke
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
} 