import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { useAuth } from '../../contexts/AuthContext'
import type { Database } from '../../types/database'

export function CreateOrganization() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const supabase = useSupabaseClient<Database>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      // Create organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name,
          slug,
          created_by: user.id,
          subscription_tier: 'free',
          max_users: 5,
          is_active: true
        })
        .select()
        .single()

      if (orgError) throw orgError

      // Create owner membership
      const { error: memberError } = await supabase
        .from('org_members')
        .insert({
          org_id: org.id,
          user_id: user.id,
          role: 'admin',
          status: 'active',
          joined_at: new Date().toISOString()
        })

      if (memberError) throw memberError

      // Navigate to invite members page
      navigate('/auth/invite-members')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create your organization"
      description="Set up your help desk workspace"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Organization Name
          </label>
          <Input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
            URL Slug
          </label>
          <Input
            id="slug"
            type="text"
            required
            pattern="^[a-z0-9-]+$"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase())}
            className="mt-1"
          />
          <p className="mt-1 text-sm text-gray-500">
            Only lowercase letters, numbers, and hyphens
          </p>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Organization'}
        </Button>
      </form>
    </AuthLayout>
  )
} 