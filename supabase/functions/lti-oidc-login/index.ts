import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Parse form data or query params (Moodle sends POST with form data)
    let params: Record<string, string> = {};
    if (req.method === 'POST') {
      const formData = await req.formData();
      formData.forEach((value, key) => {
        params[key] = value.toString();
      });
    } else {
      const url = new URL(req.url);
      url.searchParams.forEach((value, key) => {
        params[key] = value;
      });
    }

    const { iss, login_hint, target_link_uri, lti_message_hint, client_id } = params;

    if (!iss || !login_hint) {
      return new Response(JSON.stringify({ error: 'Missing required LTI parameters (iss, login_hint)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Find the platform configuration
    let query = supabase.from('lti_platforms').select('*').eq('issuer', iss);
    if (client_id) {
      query = query.eq('client_id', client_id);
    }
    const { data: platform, error: platformError } = await query.maybeSingle();

    if (platformError || !platform) {
      console.error('Platform not found:', iss, client_id, platformError);
      return new Response(JSON.stringify({ error: 'LTI platform not registered' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate nonce and state
    const nonce = crypto.randomUUID();
    const state = crypto.randomUUID();

    // Clean up old nonces first
    await supabase.rpc('cleanup_old_nonces');

    // Store nonce for validation during launch
    const { error: nonceError } = await supabase.from('lti_nonces').insert({
      nonce,
      state,
      platform_id: platform.id,
      login_hint,
      lti_message_hint: lti_message_hint || null,
    });

    if (nonceError) {
      console.error('Error storing nonce:', nonceError);
      return new Response(JSON.stringify({ error: 'Failed to initiate login' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build the redirect URL to Moodle's auth endpoint
    const launchUrl = `${SUPABASE_URL}/functions/v1/lti-launch`;
    const authParams = new URLSearchParams({
      scope: 'openid',
      response_type: 'id_token',
      client_id: platform.client_id,
      redirect_uri: launchUrl,
      login_hint,
      state,
      response_mode: 'form_post',
      nonce,
      prompt: 'none',
    });

    if (lti_message_hint) {
      authParams.set('lti_message_hint', lti_message_hint);
    }

    const redirectUrl = `${platform.auth_login_url}?${authParams.toString()}`;

    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': redirectUrl,
      },
    });
  } catch (error) {
    console.error('LTI OIDC Login error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
