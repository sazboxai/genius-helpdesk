import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import { useToast } from '../../components/ui/use-toast'
import { AuthLayout } from '../../components/layout/AuthLayout'
import type { Database } from '../../types/database'
import { useAuth } from '../../contexts/AuthContext'
import type { UserRole } from '../../types/database'

const invitationSignUpSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type InvitationSignUpFormData = z.infer<typeof invitationSignUpSchema>

interface Invitation {
  id: string
  email: string
  org_id: string
  role: UserRole
  organizations: {
    name: string
  }
}

export function InvitationSignUp() {
  const { assignUserToOrganization } = useAuth()
  const [searchParams] = useSearchParams()
  const invitationToken = searchParams.get('token')
  const navigate = useNavigate()
  const supabase = useSupabaseClient<Database>()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [invitation, setInvitation] = useState<Invitation | null>(null)

  const form = useForm<InvitationSignUpFormData>({
    resolver: zodResolver(invitationSignUpSchema),
    defaultValues: {
      fullName: '',
      password: '',
      confirmPassword: ''
    }
  })

  useEffect(() => {
    if (invitationToken) {
      loadInvitation()
    } else {
      navigate('/auth/sign-in')
    }
  }, [invitationToken])

  const loadInvitation = async () => {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('*, organizations(name)')
        .eq('token', invitationToken)
        .eq('status', 'pending')
        .single()

      if (error) throw error
      if (!data) throw new Error('Invitation not found or expired')
      
      setInvitation(data)
    } catch (error) {
      console.error('Error loading invitation:', error)
      toast({
        title: 'Invalid Invitation',
        description: 'This invitation link is invalid or has expired',
        variant: 'destructive'
      })
      navigate('/auth/sign-in')
    }
  }

  const onSubmit = async (data: InvitationSignUpFormData) => {
    if (!invitation) return

    setLoading(true)
    try {
      // 1. Create the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: invitation.email,
        password: data.password,
        options: {
          data: { full_name: data.fullName }
        }
      })

      if (signUpError) throw signUpError
      if (!authData.user) throw new Error('Failed to create user')

      // 2. Assign to organization
      const { success, error: assignError } = await assignUserToOrganization(
        authData.user.id,
        invitation.org_id,
        invitation.role
      )

      if (!success) throw assignError

      // 3. Update invitation status
      const { error: updateError } = await supabase
        .from('invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          user_id: authData.user.id
        })
        .eq('id', invitation.id)

      if (updateError) throw updateError

      // 4. Sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: invitation.email,
        password: data.password,
      })

      if (signInError) throw signInError

      toast({
        title: 'Success',
        description: 'Your account has been created successfully'
      })

      navigate('/dashboard')
    } catch (error) {
      console.error('Error signing up:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create account',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  if (!invitation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  return (
    <AuthLayout 
      title="Accept Invitation" 
      description={`Join ${invitation.organizations.name} on AutoCRM`}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Complete your account</h1>
            <p className="text-muted-foreground">
              You've been invited to join {invitation.organizations.name}
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <p className="text-sm text-gray-500">{invitation.email}</p>
          </div>

          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </Button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/auth/sign-in" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </a>
          </p>
        </form>
      </Form>
    </AuthLayout>
  )
} 