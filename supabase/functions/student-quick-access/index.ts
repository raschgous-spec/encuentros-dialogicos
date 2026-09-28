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
    const { documento, correo } = await req.json()
    const doc = String(documento ?? '').trim()
    const email = String(correo ?? '').trim().toLowerCase()
    if (!doc || doc.length > 30 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
      return json({ error: 'Datos inválidos' }, 400)
    }

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { data: est } = await admin
      .from('estudiantes_autorizados')
      .select('nombre_completo, sede, facultad, programa')
      .eq('documento', doc)
      .ilike('correo', email)
      .maybeSingle()
    if (!est) return json({ error: 'Tu documento y correo no coinciden con la lista de estudiantes autorizados.' }, 404)

    // Crear usuario si aún no existe
    const { data: prof } = await admin.from('profiles').select('id').ilike('email', email).maybeSingle()
    if (!prof) {
      const { error: cErr } = await admin.auth.admin.createUser({
        email,
        password: crypto.randomUUID() + 'Aa1!',
        email_confirm: true,
        user_metadata: { full_name: est.nombre_completo, documento: doc, sede: est.sede, facultad: est.facultad, programa: est.programa },
      })
      if (cErr && !/already/i.test(cErr.message)) {
        console.error(cErr)
        return json({ error: 'No se pudo preparar tu acceso' }, 500)
      }
    }

    const { data: link, error: lErr } = await admin.auth.admin.generateLink({ type: 'magiclink', email })
    if (lErr || !link?.properties?.hashed_token) {
      console.error(lErr)
      return json({ error: 'No se pudo generar el acceso' }, 500)
    }
    return json({ token_hash: link.properties.hashed_token })
  } catch (e) {
    console.error(e)
    return json({ error: 'Error al procesar la solicitud' }, 500)
  }
})
