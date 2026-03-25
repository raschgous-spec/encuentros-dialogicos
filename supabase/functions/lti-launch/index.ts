import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as jose from "https://deno.land/x/jose@v5.2.0/index.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// LTI 1.3 role URIs mapping
const ROLE_MAP: Record<string, string> = {
  'http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor': 'docente',
  'http://purl.imsglobal.org/vocab/lis/v2/membership#ContentDeveloper': 'docente',
  'http://purl.imsglobal.org/vocab/lis/v2/membership#Administrator': 'admin',
  'http://purl.imsglobal.org/vocab/lis/v2/institution/person#Administrator': 'admin',
  'http://purl.imsglobal.org/vocab/lis/v2/membership#Learner': 'estudiante',
  'http://purl.imsglobal.org/vocab/lis/v2/institution/person#Student': 'estudiante',
  'http://purl.imsglobal.org/vocab/lis/v2/institution/person#Observer': 'observador',
  'http://purl.imsglobal.org/vocab/lis/v2/membership#Mentor': 'observador',
};

function mapLtiRoles(ltiRoles: string[]): string {
  for (const role of ltiRoles) {
    if (ROLE_MAP[role]) {
      return ROLE_MAP[role];
    }
  }
  // Check partial matches
  for (const role of ltiRoles) {
    const lower = role.toLowerCase();
    if (lower.includes('instructor') || lower.includes('teacher')) return 'docente';
    if (lower.includes('administrator') || lower.includes('admin')) return 'admin';
    if (lower.includes('observer') || lower.includes('mentor')) return 'observador';
    if (lower.includes('learner') || lower.includes('student')) return 'estudiante';
  }
  return 'estudiante'; // default
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Parse form data (Moodle sends POST with form_post response_mode)
    const formData = await req.formData();
    const idToken = formData.get('id_token')?.toString();
    const state = formData.get('state')?.toString();

    if (!idToken || !state) {
      return new Response('Missing id_token or state', { status: 400 });
    }

    // Verify state and get nonce
    const { data: nonceData, error: nonceError } = await supabase
      .from('lti_nonces')
      .select('*, lti_platforms(*)')
      .eq('state', state)
      .maybeSingle();

    if (nonceError || !nonceData) {
      console.error('Invalid state:', state, nonceError);
      return new Response('Invalid or expired state', { status: 400 });
    }

    const platform = nonceData.lti_platforms;

    // Delete the used nonce
    await supabase.from('lti_nonces').delete().eq('id', nonceData.id);

    // Fetch Moodle's JWKS and verify the id_token
    const jwks = jose.createRemoteJWKSet(new URL(platform.jwks_url));
    
    let payload: jose.JWTPayload;
    try {
      const result = await jose.jwtVerify(idToken, jwks, {
        issuer: platform.issuer,
        audience: platform.client_id,
      });
      payload = result.payload;
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return new Response('Invalid LTI token', { status: 401 });
    }

    // Verify nonce matches
    if (payload.nonce !== nonceData.nonce) {
      console.error('Nonce mismatch');
      return new Response('Nonce mismatch', { status: 400 });
    }

    // Verify LTI message type
    const messageType = payload['https://purl.imsglobal.org/spec/lti/claim/message_type'];
    if (messageType !== 'LtiResourceLinkRequest') {
      console.error('Unexpected message type:', messageType);
      return new Response('Invalid LTI message type', { status: 400 });
    }

    // Extract user info from claims
    const email = (payload.email as string)?.toLowerCase();
    const fullName = payload.name as string || 
      `${payload.given_name || ''} ${payload.family_name || ''}`.trim() || 
      'Usuario LTI';
    const ltiRoles = (payload['https://purl.imsglobal.org/spec/lti/claim/roles'] as string[]) || [];
    const mappedRole = mapLtiRoles(ltiRoles);

    if (!email) {
      console.error('No email in LTI token');
      return new Response('Email is required in LTI claims', { status: 400 });
    }

    console.log(`LTI Launch: email=${email}, name=${fullName}, role=${mappedRole}, ltiRoles=`, ltiRoles);

    // Check if user exists in Supabase Auth
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email?.toLowerCase() === email);

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
      console.log('Existing user found:', userId);
    } else {
      // Create the user with a random password (they'll only access via LTI)
      const randomPassword = crypto.randomUUID() + crypto.randomUUID();
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password: randomPassword,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          lti_user: true,
        },
      });

      if (createError || !newUser.user) {
        console.error('Error creating user:', createError);
        return new Response('Failed to create user', { status: 500 });
      }

      userId = newUser.user.id;
      console.log('New user created:', userId);

      // Update profile with full name
      await supabase.from('profiles').update({ full_name: fullName }).eq('id', userId);

      // Update role if not estudiante (default trigger assigns estudiante)
      if (mappedRole !== 'estudiante') {
        await supabase.from('user_roles').update({ role: mappedRole }).eq('user_id', userId);
      }
    }

    // Generate a magic link for the user (one-time sign-in)
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: `${SUPABASE_URL.replace('supabase.co', 'lovable.app').replace(/api$/, '')}`
      }
    });

    if (linkError || !linkData) {
      console.error('Error generating magic link:', linkError);
      return new Response('Failed to generate session', { status: 500 });
    }

    // Extract the token from the generated link
    const actionLink = linkData.properties?.action_link;
    
    if (!actionLink) {
      console.error('No action link generated');
      return new Response('Failed to generate session link', { status: 500 });
    }

    // Parse the hashed_token from the action link
    const linkUrl = new URL(actionLink);
    const hashedToken = linkUrl.searchParams.get('token') || linkUrl.hash;
    const tokenType = linkUrl.searchParams.get('type') || 'magiclink';
    
    // Build the frontend callback URL
    // The frontend app URL - we need to redirect the browser there
    const appBaseUrl = Deno.env.get('APP_BASE_URL') || linkUrl.origin;
    
    // Redirect to the frontend LTI callback page with the verification params
    const callbackUrl = new URL(`${appBaseUrl}/lti-callback`);
    
    // Pass the full action link verification URL for the frontend to use
    const verifyUrl = `${SUPABASE_URL}/auth/v1/verify?token=${linkUrl.searchParams.get('token')}&type=${tokenType}&redirect_to=${encodeURIComponent(appBaseUrl + '/lti-callback')}`;
    
    // Redirect browser to the verify URL which will set the session and redirect to our callback
    return new Response(null, {
      status: 302,
      headers: {
        'Location': verifyUrl,
      },
    });
  } catch (error) {
    console.error('LTI Launch error:', error);
    return new Response('Internal server error: ' + (error as Error).message, { status: 500 });
  }
});
