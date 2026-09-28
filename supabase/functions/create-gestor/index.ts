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
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'No autenticado' }, 401)
    const url = Deno.env.get('SUPABASE_URL')!
    const userClient = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    })
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return json({ error: 'No autenticado' }, 401)

    const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } })
    const { data: roles } = await admin.from('user_roles').select('role').eq('user_id', user.id)
    const r = (roles || []).map((x: any) => x.role)
    const isAdmin = r.includes('admin')
    const { data: selfGestor } = await admin.from('gestores_conocimiento').select('id').eq('user_id', user.id).maybeSingle()
    const isCoord = r.includes('docente') && !selfGestor
    if (!isAdmin && !isCoord) return json({ error: 'Sin permisos' }, 403)

    const { email, password, fullName, correoCoordinador } = await req.json()
    const e = String(email ?? '').trim().toLowerCase()
    const name = String(fullName ?? '').trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return json({ error: 'Correo inválido' }, 400)
    if (!password || password.length < 8) return json({ error: 'La contraseña debe tener al menos 8 caracteres' }, 400)
    if (name.length < 2 || name.length > 100) return json({ error: 'Nombre inválido' }, 400)

    const coord = isAdmin && correoCoordinador ? String(correoCoordinador).trim().toLowerCase() : (user.email || '').toLowerCase()
    if (!coord) return json({ error: 'Debe indicar el correo del coordinador' }, 400)

    const { data: nu, error: cErr } = await admin.auth.admin.createUser({
      email: e, password, email_confirm: true, user_metadata: { full_name: name },
    })
    if (cErr || !nu.user) return json({ error: cErr?.message || 'No se pudo crear el usuario' }, 400)
    const id = nu.user.id

    await admin.from('user_roles').delete().eq('user_id', id)
    await admin.from('user_roles').insert({ user_id: id, role: 'docente' })
    const { error: gErr } = await admin.from('gestores_conocimiento').insert({
      user_id: id, correo: e, nombre_completo: name, correo_coordinador: coord, created_by: user.id,
    })
    if (gErr) return json({ error: 'Usuario creado pero no se pudo vincular al coordinador' }, 500)
    return json({ success: true })
  } catch (err) {
    console.error(err)
    return json({ error: 'Error al procesar la solicitud' }, 500)
  }
})
