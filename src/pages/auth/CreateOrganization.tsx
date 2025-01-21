import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/ui/use-toast'
import { AuthLayout } from '../../components/layout/AuthLayout'
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
import type { Database } from '../../types/database'

const createOrgSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  slug: z.string()
    .min(1, 'URL slug is required')
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens allowed')
})

type CreateOrgFormData = z.infer<typeof createOrgSchema>

export function CreateOrganization() {
  const { user, setCurrentOrganization } = useAuth()
  const navigate = useNavigate()
  const supabase = useSupabaseClient<Database>()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const form = useForm<CreateOrgFormData>({
    resolver: zodResolver(createOrgSchema),
    defaultValues: {
      name: '',
      slug: ''
    }
  })

  const onSubmit = async (data: CreateOrgFormData) => {
    if (!user) return
    
    setLoading(true)
    try {
      // 1. Create the organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: data.name,
          slug: data.slug,
          created_by: user.id
        })
        .select()
        .single()

      if (orgError) throw orgError

      // 2. Create the membership
      const { error: memberError } = await supabase
        .from('org_members')
        .insert({
          org_id: org.id,
          user_id: user.id,
          role: 'owner',
          status: 'active'
        })

      if (memberError) throw memberError

      // 3. Update the auth context with new organization
      await setCurrentOrganization(org)

      toast({
        title: 'Success',
        description: 'Organization created successfully'
      })

      // 4. Add a small delay to ensure state is updated
      setTimeout(() => {
        navigate('/dashboard', { replace: true })
      }, 100)
    } catch (error) {
      console.error('Error creating organization:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create organization',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create your organization"
      description="Set up your help desk workspace"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL Slug</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    onChange={(e) => field.onChange(e.target.value.toLowerCase())}
                  />
                </FormControl>
                <p className="text-sm text-muted-foreground">
                  Only lowercase letters, numbers, and hyphens
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Creating Organization...' : 'Create Organization'}
          </Button>
        </form>
      </Form>
    </AuthLayout>
  )
} 