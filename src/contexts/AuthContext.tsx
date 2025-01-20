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
      const { data: memberData, error: memberError } = await supabase
        .from('org_members')
        .select(`
          role,
          organizations(*)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()

      if (memberError) {
        console.error('Error loading organization:', memberError)
        return
      }

      if (memberData) {
        setOrganization(memberData.organizations as Organization)
        setUserRole(memberData.role)
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

  const setCurrentOrganization = (org: Organization) => {
    setOrganization(org)
  }

  const value = {
    user,
    organization,
    userRole,
    loading,
    signOut,
    setCurrentOrganization
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
} 