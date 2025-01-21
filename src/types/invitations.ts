import { Database } from './database'
import { z } from 'zod'

export type Invitation = Database['public']['Tables']['invitations']['Row']
export type NewInvitation = Database['public']['Tables']['invitations']['Insert']

export interface InvitationMetadata {
  department?: string
  [key: string]: any
}

export type InvitationWithOrg = Database['public']['Tables']['invitations']['Row'] & {
  organizations: {
    name: string
  }
  metadata: InvitationMetadata
}

export const INVITATION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  EXPIRED: 'expired'
} as const

export type InvitationStatus = typeof INVITATION_STATUS[keyof typeof INVITATION_STATUS]

// Zod schema for invitation form
export const invitationSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'agent'] as const),
  department: z.string().optional(),
  metadata: z.record(z.any()).optional()
})

export type InvitationFormData = z.infer<typeof invitationSchema> 