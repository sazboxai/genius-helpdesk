import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
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
    const { invitation_id, base_url } = await req.json()
    
    // Log for debugging
    console.log('Received request:', { invitation_id, base_url })

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get invitation with organization details
    const { data: invitation, error: inviteError } = await supabase
      .from('invitations')
      .select(`
        *,
        organizations (
          name
        )
      `)
      .eq('id', invitation_id)
      .single()

    console.log('Invitation data:', invitation)

    if (inviteError || !invitation) {
      throw new Error('Invitation not found')
    }

    // Create signup link that goes to public route
    const signUpUrl = `${base_url}/auth/accept-invite?token=${invitation.token}`
    
    console.log('Generated signup URL:', signUpUrl)

    // Use magicLink instead of signup to avoid automatic auth
    const { error: emailError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: invitation.email,
      options: {
        redirectTo: signUpUrl,
        data: {
          invitation_id: invitation.id,
          organization_name: invitation.organizations.name,
          organization_id: invitation.org_id
        }
      }
    })

    if (emailError) {
      console.error('Email generation error:', emailError)
      throw emailError
    }

    return new Response(
      JSON.stringify({ success: true, url: signUpUrl }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
}) 