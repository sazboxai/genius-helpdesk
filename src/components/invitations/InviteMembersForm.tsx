import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { PlusIcon, Trash2Icon } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { useToast } from '../ui/use-toast'
import { InvitationFormData, invitationSchema } from '../../types/invitations'
import { useAuth } from '../../contexts/AuthContext'

interface InviteMembersFormProps {
  onSuccess?: () => void
}

export function InviteMembersForm({ onSuccess }: InviteMembersFormProps) {
  const { organization, user } = useAuth()
  const supabase = useSupabaseClient()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const form = useForm<InvitationFormData>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      email: '',
      role: 'agent',
      department: ''
    }
  })

  const onSubmit = async (data: InvitationFormData) => {
    if (!organization) return

    setLoading(true)
    try {
      // 1. Generate invitation token
      const { data: tokenData, error: tokenError } = await supabase
        .rpc('generate_invitation_token')

      if (tokenError) throw tokenError
      if (!tokenData?.token) throw new Error('Failed to generate invitation token')

      // 2. Create invitation record
      const { data: invitation, error: inviteError } = await supabase
        .from('invitations')
        .insert({
          email: data.email.toLowerCase(),
          org_id: organization.id,
          role: data.role,
          token: tokenData.token,
          invited_by: user?.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          status: 'pending',
          metadata: {
            department: data.department
          }
        })
        .select()
        .single()

      if (inviteError) throw inviteError

      // 3. Send invitation email
      const { error: emailError } = await supabase.functions.invoke('send-invitation', {
        body: {
          invitation_id: invitation.id,
          base_url: window.location.origin
        }
      })

      if (emailError) throw emailError

      toast({
        title: 'Invitation sent!',
        description: `An invitation has been sent to ${data.email}`
      })

      onSuccess?.()
      form.reset()
    } catch (error) {
      console.error('Error sending invitation:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send invitation',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email address</FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="Email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department (optional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Department" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading}>
          {loading ? 'Sending invitation...' : 'Send invitation'}
        </Button>
      </form>
    </Form>
  )
} 