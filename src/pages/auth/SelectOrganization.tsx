import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Button } from '../../components/ui/button'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { useAuth } from '../../contexts/AuthContext'
import type { Database } from '../../types/database'

interface OrgListItem {
  id: string
  name: string
  role: string
}

export function SelectOrganization() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const supabase = useSupabaseClient<Database>()
  const [organizations, setOrganizations] = useState<OrgListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadOrganizations()
    }
  }, [user])

  const loadOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('org_members')
        .select(`
          role,
          organization:organizations(
            id,
            name
          )
        `)
        .eq('user_id', user?.id)
        .eq('status', 'active')

      if (error) throw error

      const orgs = data.map(item => ({
        id: item.organization.id,
        name: item.organization.name,
        role: item.role
      }))

      setOrganizations(orgs)

      // If only one org, redirect automatically
      if (orgs.length === 1) {
        navigate(`/org/${orgs[0].id}/dashboard`)
      }
    } catch (error) {
      console.error('Error loading organizations:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <AuthLayout
      title="Select Organization"
      description="Choose an organization to continue"
    >
      <div className="space-y-4">
        {organizations.map(org => (
          <Button
            key={org.id}
            onClick={() => navigate(`/org/${org.id}/dashboard`)}
            className="w-full justify-start"
            variant="outline"
          >
            {org.name}
          </Button>
        ))}

        <div className="pt-4 border-t">
          <Button
            onClick={() => navigate('/auth/create-org')}
            className="w-full"
          >
            Create New Organization
          </Button>
        </div>
      </div>
    </AuthLayout>
  )
} 