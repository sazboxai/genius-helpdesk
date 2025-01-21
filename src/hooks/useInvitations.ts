import { useCallback, useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import type { InvitationWithOrg } from '../types/invitations'

export function useInvitations(orgId: string) {
  const supabase = useSupabaseClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const listInvitations = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('*, organizations(name)')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as InvitationWithOrg[]
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invitations')
      return []
    } finally {
      setLoading(false)
    }
  }, [orgId, supabase])

  const revokeInvitation = useCallback(async (id: string) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('invitations')
        .update({ status: 'expired' })
        .eq('id', id)

      if (error) throw error
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke invitation')
      return false
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const resendInvitation = useCallback(async (id: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.functions.invoke('send-invitation', {
        body: {
          invitation_id: id,
          base_url: window.location.origin
        }
      })

      if (error) throw error
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend invitation')
      return false
    } finally {
      setLoading(false)
    }
  }, [supabase])

  return {
    loading,
    error,
    listInvitations,
    revokeInvitation,
    resendInvitation
  }
} 