import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Crear el usuario admin
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: 'santiago@raschgo.com',
      password: '123456',
      email_confirm: true,
      user_metadata: {
        full_name: 'Administrador',
      },
    });

    if (createError) {
      console.error('Error creating admin:', createError);
      return new Response(
        JSON.stringify({ error: createError.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!newUser.user) {
      throw new Error('No se pudo crear el usuario admin');
    }

    // Crear perfil
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: newUser.user.id,
        email: 'santiago@raschgo.com',
        full_name: 'Administrador',
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
    }

    // Asignar rol de admin
    const { error: roleInsertError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: newUser.user.id,
        role: 'admin',
      });

    if (roleInsertError) {
      console.error('Error assigning admin role:', roleInsertError);
      return new Response(
        JSON.stringify({ error: 'Usuario creado pero no se pudo asignar el rol de admin' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Admin user created successfully:', newUser.user.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Usuario admin creado exitosamente',
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in create-admin function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
