import { createContext, useContext, useEffect, useState } from 'react'
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react'
import type { User } from '@supabase/supabase-js'
import type { Database } from '../types/database'
import type { Organization, UserRole } from '../types/database'

interface AuthContextType {
  user: User | null
  organization: Organization | null
  userRole: UserRole | null
  loading: boolean
  signOut: () => Promise<void>
  setCurrentOrganization: (org: Organization) => void
  assignUserToOrganization: (userId: string, orgId: string, role: UserRole) => Promise<{ success: boolean, error?: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Export the hook as a named constant instead of a function declaration
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useSupabaseClient<Database>()
  const session = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user) {
      setUser(session.user)
      loadUserOrganization(session.user.id)
    } else {
      setUser(null)
      setOrganization(null)
      setUserRole(null)
    }
  }, [session])

  const loadUserOrganization = async (userId: string) => {
    try {
      const { data: memberData } = await supabase
        .from('org_members')
        .select(`
          role,
          organizations(*)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle()

      if (memberData) {
        console.log('Loaded organization:', memberData) // Debug log
        setOrganization(memberData.organizations as Organization)
        setUserRole(memberData.role as UserRole)
      } else {
        setOrganization(null)
        setUserRole(null)
      }
    } catch (error) {
      console.error('Error loading organization:', error)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const setCurrentOrganization = async (org: Organization) => {
    setOrganization(org)
    // Also set the user role since they're the creator
    setUserRole('owner')
    
    // Force reload organization data to ensure everything is in sync
    if (session?.user) {
      await loadUserOrganization(session.user.id)
    }
  }

  const assignUserToOrganization = async (userId: string, orgId: string, role: UserRole) => {
    try {
      // 1. Create organization membership
      const { error: membershipError } = await supabase
        .from('org_members')
        .insert({
          org_id: orgId,
          user_id: userId,
          role: role,
          status: 'active'
        })

      if (membershipError) throw membershipError

      // 2. Load the organization data
      await loadUserOrganization(userId)

      return { success: true }
    } catch (error) {
      console.error('Error assigning user to organization:', error)
      return { success: false, error }
    }
  }

  const value = {
    user,
    organization,
    userRole,
    loading,
    signOut,
    setCurrentOrganization,
    assignUserToOrganization
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
} 