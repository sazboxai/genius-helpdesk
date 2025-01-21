export type UserRole = 'admin' | 'agent' | 'customer' 

export interface InviteMembership {
  id: string
  org_id: string
  invited_email: string
  role: UserRole
  status: 'pending' | 'active'
  invite_code: string
  user_id?: string
  organizations: {
    name: string
    slug: string
  }
} 

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      org_members: {
        Row: {
          id: string
          org_id: string
          user_id: string
          role: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          user_id: string
          role: string
          status: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          user_id?: string
          role?: string
          status?: string
          updated_at?: string
        }
      }
      invitations: {
        Row: {
          id: string
          org_id: string
          email: string
          role: string
          token: string
          status: string
          invited_by: string
          user_id?: string
          accepted_at?: string
          expires_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          email: string
          role: string
          token: string
          status?: string
          invited_by: string
          user_id?: string
          accepted_at?: string
          expires_at: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: string
          user_id?: string
          accepted_at?: string
          updated_at?: string
        }
      }
      // ... other tables
    }
    Functions: {
      generate_invitation_token: {
        Args: Record<string, never>
        Returns: { token: string }
      }
    }
  }
} 