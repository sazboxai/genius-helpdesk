// @ts-ignore - Deno imports don't have types
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    console.log('Request body:', body)

    const { email, organization_id, invite_code, role, redirectBaseUrl } = body
    
    if (!email || !organization_id || !invite_code || !role) {
      throw new Error('Missing required fields')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // First check if user already exists in auth.users
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers()
    const userExists = existingUser.users.some(u => u.email === email.toLowerCase())

    // Then check if there's a pending invitation
    const { data: existingMember, error: checkError } = await supabaseAdmin
      .from('org_members')
      .select('id, status')
      .eq('org_id', organization_id)
      .eq('invited_email', email.toLowerCase())
      .single()

    if (existingMember) {
      throw new Error('This email is already invited to this organization')
    }

    // Get organization details
    const { data: org, error: orgError } = await supabaseAdmin
      .from('organizations')
      .select('name')
      .eq('id', organization_id)
      .single()

    if (orgError || !org) {
      throw new Error('Organization not found')
    }

    // Create the pending membership first
    const { error: membershipError } = await supabaseAdmin
      .from('org_members')
      .insert({
        org_id: organization_id,
        invited_email: email.toLowerCase(),
        role,
        status: 'pending',
        invite_code
      })

    if (membershipError) {
      throw membershipError
    }

    const baseUrl = redirectBaseUrl || 'https://main.d2d0n7t8x45hph.amplifyapp.com'
    const acceptInviteUrl = `${baseUrl}/auth/accept-invite?code=${invite_code}`

    // If user doesn't exist, send signup invitation
    if (!userExists) {
      const { error: signupError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'signup',
        email,
        options: {
          redirectTo: acceptInviteUrl,
          data: {
            invite_code,
            organization_id,
            organization_name: org.name,
            role
          }
        }
      })

      if (signupError) throw signupError
    } else {
      // If user exists, send magic link
      const { error: magicLinkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: {
          redirectTo: acceptInviteUrl,
          data: {
            invite_code,
            organization_id,
            organization_name: org.name,
            role
          }
        }
      })

      if (magicLinkError) throw magicLinkError
    }

    return new Response(
      JSON.stringify({ 
        message: 'Invitation sent successfully',
        url: acceptInviteUrl 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in invite-member function:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error instanceof Error && error.message.includes('already') ? 409 : 400,
      },
    )
  }
}) 