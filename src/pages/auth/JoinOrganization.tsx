import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useToast } from '../../components/ui/use-toast'

export function JoinOrganization() {
  const { user, assignUserToOrganization } = useAuth()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const supabase = useSupabaseClient()
  const { toast } = useToast()

  useEffect(() => {
    if (token) {
      handleInvitation()
    }
  }, [token])

  const handleInvitation = async () => {
    try {
      // 1. Get invitation details
      const { data: invitation, error } = await supabase
        .from('invitations')
        .select('*, organizations(name)')
        .eq('token', token)
        .single()

      if (error) throw error

      if (user) {
        // If logged in user is not the invited user
        if (user.email !== invitation.email) {
          toast({
            title: 'Wrong Account',
            description: `This invitation was sent to ${invitation.email}. Please sign out first.`,
            variant: 'destructive'
          })
          navigate('/auth/sign-out')
          return
        }

        // Assign user to organization
        const { success, error: assignError } = await assignUserToOrganization(
          user.id,
          invitation.org_id,
          invitation.role as UserRole
        )

        if (!success) throw assignError

        // Update invitation status
        await supabase
          .from('invitations')
          .update({
            status: 'accepted',
            accepted_at: new Date().toISOString(),
            user_id: user.id
          })
          .eq('id', invitation.id)

        toast({
          title: 'Success',
          description: 'You have joined the organization'
        })

        navigate('/dashboard')
      } else {
        // Redirect to invitation signup instead of regular signup
        navigate(`/auth/invitation-signup?token=${token}`)
      }
    } catch (error) {
      console.error('Error handling invitation:', error)
      toast({
        title: 'Error',
        description: 'Failed to process invitation'
      })
      navigate('/auth/sign-in')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-lg font-medium">Processing invitation...</h2>
        <p className="text-muted-foreground">Please wait while we verify your invitation.</p>
      </div>
    </div>
  )
} 