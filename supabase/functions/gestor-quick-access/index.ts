import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })
  try {
    const { nombre, correo, facultad } = await req.json()
    const email = String(correo ?? '').trim().toLowerCase()
    const name = String(nombre ?? '').trim().replace(/\s+/g, ' ')
    const fac = String(facultad ?? '').trim()
    if (name.length < 3 || name.length > 100) return json({ error: 'Escribe tu nombre completo' }, 400)
    if (!/^[^\s@]+@ucundinamarca\.edu\.co$/.test(email) || email.length > 255) return json({ error: 'Usa tu correo institucional @ucundinamarca.edu.co' }, 400)
    if (!fac || fac.length > 200) return json({ error: 'Selecciona tu facultad' }, 400)

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } })

    const { data: facOk } = await admin.from('coordinadores_autorizados').select('id').eq('facultad', fac).limit(1)
    if (!facOk?.length) return json({ error: 'Facultad no válida' }, 400)

    const { data: gestor } = await admin.from('gestores_conocimiento').select('id, user_id').ilike('correo', email).maybeSingle()
    if (!gestor) {
      // Si el correo ya pertenece a otra cuenta (estudiante, coordinador, admin), no se permite
      const { data: prof } = await admin.from('profiles').select('id').ilike('email', email).maybeSingle()
      if (prof) return json({ error: 'Este correo ya tiene una cuenta en la plataforma. Ingresa con tu tipo de acceso correspondiente.' }, 409)

      const { data: nu, error: cErr } = await admin.auth.admin.createUser({
        email, password: crypto.randomUUID() + 'Aa1!', email_confirm: true, user_metadata: { full_name: name, facultad: fac },
      })
      if (cErr || !nu.user) { console.error(cErr); return json({ error: 'No se pudo preparar tu acceso' }, 500) }
      await admin.from('user_roles').delete().eq('user_id', nu.user.id)
      await admin.from('user_roles').insert({ user_id: nu.user.id, role: 'docente' })
      await admin.from('gestores_conocimiento').insert({ user_id: nu.user.id, correo: email, nombre_completo: name, facultad: fac, correo_coordinador: '' })
    } else {
      await admin.from('gestores_conocimiento').update({ nombre_completo: name, facultad: fac }).eq('id', gestor.id)
      await admin.from('profiles').update({ full_name: name }).eq('id', gestor.user_id)
    }

    const { data: link, error } = await admin.auth.admin.generateLink({ type: 'magiclink', email })
    if (error || !link?.properties?.hashed_token) { console.error(error); return json({ error: 'No se pudo generar el acceso' }, 500) }
    return json({ token_hash: link.properties.hashed_token })
  } catch (e) {
    console.error(e)
    return json({ error: 'Error al procesar la solicitud' }, 500)
  }
})
