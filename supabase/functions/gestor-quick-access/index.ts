import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } })
const norm = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })
  try {
    const { nombre, correo } = await req.json()
    const email = String(correo ?? '').trim().toLowerCase()
    const name = norm(String(nombre ?? ''))
    if (name.length < 2 || name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Datos inválidos' }, 400)

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } })
    const { data: g } = await admin.from('gestores_conocimiento').select('nombre_completo').ilike('correo', email).maybeSingle()
    const reg = g ? norm(g.nombre_completo) : ''
    const palabras = name.split(' ')
    const coincide = g && (reg === name || palabras.every((p) => reg.includes(p)))
    if (!coincide) return json({ error: 'Tu nombre y correo no coinciden con un Gestor del Conocimiento registrado.' }, 404)

    const { data: link, error } = await admin.auth.admin.generateLink({ type: 'magiclink', email })
    if (error || !link?.properties?.hashed_token) { console.error(error); return json({ error: 'No se pudo generar el acceso' }, 500) }
    return json({ token_hash: link.properties.hashed_token })
  } catch (e) {
    console.error(e)
    return json({ error: 'Error al procesar la solicitud' }, 500)
  }
})
