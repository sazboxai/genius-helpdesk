import { useState } from 'react'
import { Button } from '../../components/ui/button'
import { PlusIcon } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { InviteMembersForm } from '../../components/invitations/InviteMembersForm'
import { InvitationsList } from '../../components/invitations/InvitationsList'
import { MembersList } from '../../components/teams/MembersList'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"

export function Teams() {
  const { organization } = useAuth()
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)

  if (!organization) return null

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Team Management</h2>
          <p className="text-muted-foreground">
            Manage your team members and invitations
          </p>
        </div>
        
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Send invitations to new team members
              </DialogDescription>
            </DialogHeader>
            <InviteMembersForm onSuccess={() => setIsInviteDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-8">
        <MembersList organizationId={organization.id} />
        <InvitationsList organizationId={organization.id} />
      </div>
    </div>
  )
} 