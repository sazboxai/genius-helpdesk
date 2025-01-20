import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Edge function received request')
    const body = await req.json()
    console.log('Request body:', body)

    const { email, organization_id, invite_code, role } = body
    
    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get organization details
    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('name')
      .eq('id', organization_id)
      .single()

    if (!org) {
      throw new Error('Organization not found')
    }

    // Get the app URL from environment variable
    const appUrl = Deno.env.get('PUBLIC_APP_URL') ?? 'http://localhost:3000'
    const redirectTo = `${appUrl}/auth/accept-invite?code=${invite_code}`

    console.log('Redirect URL:', redirectTo)

    // Send invitation email
    const { error: emailError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo,
      data: {
        invite_code,
        organization_id,
        organization_name: org.name,
        role
      }
    })

    if (emailError) throw emailError

    return new Response(
      JSON.stringify({ 
        message: 'Invitation sent successfully',
        redirectUrl: redirectTo 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
}) 