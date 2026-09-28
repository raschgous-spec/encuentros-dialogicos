import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } })

import { PROBLEMAS } from './problemas.ts'

// ---------- Casos construidos sobre el banco de problemas translocales ----------
// id de caso = "<id_problema>|<indice_plantilla>"; la respuesta se deriva de la plantilla (solo servidor)
type Enfoque = 'Cuantitativo' | 'Cualitativo' | 'Mixto'
const T1: { t: string; ok: Enfoque }[] = [
  { t: 'Se necesita medir la magnitud y frecuencia del problema con datos estadísticos por municipio y programa.', ok: 'Cuantitativo' },
  { t: 'Se busca establecer, con encuestas estructuradas, qué porcentaje de la población está afectada.', ok: 'Cuantitativo' },
  { t: 'Se busca comprender las vivencias y significados que la comunidad le atribuye, mediante entrevistas a profundidad.', ok: 'Cualitativo' },
  { t: 'Se quiere interpretar la percepción de los actores del territorio a través de grupos focales.', ok: 'Cualitativo' },
  { t: 'Se requiere cuantificar su alcance con encuestas y, además, comprender sus causas con entrevistas.', ok: 'Mixto' },
  { t: 'Se evaluará el efecto de una intervención con indicadores y cómo la viven los participantes.', ok: 'Mixto' },
]
const FASES = ['Planteamiento del problema', 'Marco teórico', 'Metodología', 'Recolección de datos', 'Resultados']
type Herr = 'Ishikawa' | 'Pareto' | 'DOFA'
const MOD: Record<Herr, string> = { Ishikawa: 'modulo_desarrollo_ishikawa', Pareto: 'modulo_desarrollo_pareto', DOFA: 'modulo_desarrollo_dofa' }
const T3: { t: string; ok: Herr }[] = [
  { t: 'Hay que encontrar sus causas raíz agrupadas por personas, métodos, recursos y entorno.', ok: 'Ishikawa' },
  { t: 'Tiene múltiples causas interrelacionadas que nadie ha organizado; se debe identificar su origen.', ok: 'Ishikawa' },
  { t: 'Se registraron muchos factores asociados; hay que priorizar los pocos que generan la mayoría de los casos.', ok: 'Pareto' },
  { t: 'Con datos de frecuencia de sus causas, se debe definir el 20% que explica el 80% del impacto.', ok: 'Pareto' },
  { t: 'Para formular una estrategia territorial, hay que analizar fortalezas, debilidades, oportunidades y amenazas.', ok: 'DOFA' },
  { t: 'Se debe diseñar un plan considerando el contexto interno de la universidad y el externo del territorio.', ok: 'DOFA' },
]
const prob = (id: string) => PROBLEMAS.find((x) => x.id === id)!
const tpl = (id: string) => Number(id.split('|')[1])
const pid = (id: string) => id.split('|')[0]
const titulo = (p: string) => (p.length > 80 ? p.slice(0, 77).trimEnd() + '…' : p)
const ctx = (id: string, t: string) => { const p = prob(pid(id)); return `Problema translocal (${p.u}): ${p.p} ${t}` }

const LIMITE_MS: Record<number, number> = { 1: 90_000, 2: 60_000, 3: 90_000 }
const PESOS: Record<number, number> = { 1: 0.3, 2: 0.3, 3: 0.4 }

const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] } return b }

function ajustarTiempo(base: number, nivel: number, ms: number) {
  const lim = LIMITE_MS[nivel]
  let s = base
  let nota = ''
  if (ms > lim) { s *= 0.8; nota = 'Tiempo excedido: penalización del 20%.' }
  else if (ms < lim * 0.5 && base >= 60) { s += 10; nota = 'Bonificación por agilidad estratégica (+10).' }
  return { puntaje: Math.round(Math.min(100, s) * 10) / 10, nota }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })
  try {
    const auth = req.headers.get('Authorization')
    if (!auth) return json({ error: 'No autenticado' }, 401)
    const url = Deno.env.get('SUPABASE_URL')!
    const uc = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } }, auth: { persistSession: false } })
    const { data: { user } } = await uc.auth.getUser()
    if (!user) return json({ error: 'No autenticado' }, 401)
    const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } })

    const { data: roles } = await admin.from('user_roles').select('role').eq('user_id', user.id)
    const r = (roles || []).map((x: any) => x.role)
    if (!r.includes('docente') && !r.includes('admin')) return json({ error: 'Solo para Gestores del Conocimiento' }, 403)

    const body = await req.json()
    const accion = body.accion as string

    if (accion === 'iniciar') {
      // facultad / programa: vía coordinador (gestor) o propio correo
      const { data: g } = await admin.from('gestores_conocimiento').select('correo_coordinador, facultad').eq('user_id', user.id).maybeSingle()
      const correo = (g?.correo_coordinador || user.email || '').toLowerCase()
      const { data: c } = await admin.from('coordinadores_autorizados').select('facultad, programa, sede').ilike('correo', correo).limit(1).maybeSingle()

      // Evitar repetir problemas ya vistos por el usuario (si quedan suficientes)
      const { data: prev } = await admin.from('medit_sesiones').select('casos').eq('user_id', user.id)
      const vistos = new Set<string>((prev || []).flatMap((x: any) => x.casos?.probs || []))
      let pool = PROBLEMAS.filter((x) => !vistos.has(x.id))
      if (pool.length < 8) pool = PROBLEMAS
      const probs = shuffle(pool).slice(0, 8).map((x) => x.id) // 3 N1 + 1 N2 + 4 N3, todos distintos
      const e1 = shuffle(['Cuantitativo', 'Cualitativo', 'Mixto'] as Enfoque[])
      const n1 = e1.map((e, i) => { const opts = T1.map((t, k) => ({ t, k })).filter((o) => o.t.ok === e); return `${probs[i]}|${shuffle(opts)[0].k}` })
      const h3 = shuffle([...shuffle(['Ishikawa', 'Pareto', 'DOFA'] as Herr[]), shuffle(['Ishikawa', 'Pareto', 'DOFA'] as Herr[])[0]])
      const n3 = h3.map((h, i) => { const opts = T3.map((t, k) => ({ t, k })).filter((o) => o.t.ok === h); return `${probs[4 + i]}|${shuffle(opts)[0].k}` })
      const casos = { n1, n2: shuffle(FASES), n2_problema: probs[3], n3, probs }
      const { data: s, error } = await admin.from('medit_sesiones').insert({
        user_id: user.id, facultad: (g as any)?.facultad || c?.facultad || null, programa: c?.programa ?? null, sede: c?.sede ?? null, casos,
      }).select('id, started_at').single()
      if (error) throw error
      return json({
        sesion_id: s.id,
        timestamp_inicio: s.started_at,
        limites_ms: LIMITE_MS,
        nivel1: n1.map((id) => ({ id, titulo: titulo(prob(pid(id)).p), contexto: ctx(id, T1[tpl(id)].t) })),
        nivel2: casos.n2,
        nivel2_problema: { unidad: prob(probs[3]).u, problematica: prob(probs[3]).p },
        nivel3: n3.map((id) => ({ id, contexto: ctx(id, T3[tpl(id)].t) })),
      })
    }

    const { data: ses } = await admin.from('medit_sesiones').select('*').eq('id', body.sesion_id).eq('user_id', user.id).maybeSingle()
    if (!ses) return json({ error: 'Sesión no encontrada' }, 404)
    if (ses.finished_at) return json({ error: 'La expedición ya finalizó' }, 400)

    if (accion === 'evaluar_nivel') {
      const nivel = Number(body.nivel_id)
      const ms = Math.max(0, Number(body.tiempo_consumido_ms) || 0)
      const resp = body.respuestas || {}
      let base = 0
      const detalle: any[] = []
      if (nivel === 1) {
        const ids: string[] = ses.casos.n1
        ids.forEach((id) => { const ok = resp[id] === T1[tpl(id)]?.ok; if (ok) base++; detalle.push({ id, elegido: resp[id] ?? null, correcto: ok }) })
        base = (base / ids.length) * 100
      } else if (nivel === 2) {
        const orden: string[] = Array.isArray(resp.orden) ? resp.orden : []
        let ok = 0
        FASES.forEach((f, i) => { if (orden[i] === f) ok++ })
        base = (ok / FASES.length) * 100
        detalle.push({ orden, posiciones_correctas: ok })
      } else if (nivel === 3) {
        const ids: string[] = ses.casos.n3
        ids.forEach((id) => { const h = T3[tpl(id)]?.ok; const ok = resp[id] === h; if (ok) base++; detalle.push({ id, elegido: resp[id] ?? null, correcto: ok, modulo: MOD[h] }) })
        base = (base / ids.length) * 100
      } else return json({ error: 'Nivel inválido' }, 400)

      const { puntaje, nota } = ajustarTiempo(base, nivel, ms)
      const niveles = { ...ses.niveles, [nivel]: { puntaje, precision: Math.round(base), tiempo_ms: ms, detalle } }
      await admin.from('medit_sesiones').update({ niveles }).eq('id', ses.id)
      const fb = base >= 80 ? '¡Excelente rigor metodológico!' : base >= 50 ? 'Buen avance, hay aspectos por afinar.' : 'Brecha detectada: se reforzará en el nivelatorio.'
      return json({ estado_nivel: base >= 50 ? 'completado' : 'fallido', puntaje_obtenido: puntaje, precision: Math.round(base), feedback_inmediato: `${fb} ${nota}`.trim() })
    }

    if (accion === 'finalizar') {
      const nv = ses.niveles || {}
      const p = (n: number) => Number(nv[n]?.puntaje ?? 0)
      const global = Math.round((p(1) * PESOS[1] + p(2) * PESOS[2] + p(3) * PESOS[3]) * 10) / 10
      const insignia = global >= 80 ? 'Estratega de Soluciones' : global >= 55 ? 'Metodólogo' : 'Investigador Táctico'
      const ruta = new Set<string>()
      if ((nv[1]?.precision ?? 0) < 70) ruta.add('modulo_identificacion')
      if ((nv[2]?.precision ?? 0) < 70) ruta.add('modulo_fases_investigacion')
      if ((nv[3]?.precision ?? 0) < 70) ruta.add('modulo_solucion_propositiva')
      ;(nv[3]?.detalle || []).forEach((d: any) => { if (!d.correcto) ruta.add(d.modulo) })
      const rutaArr = [...ruta]
      await admin.from('medit_sesiones').update({ puntaje_global: global, insignia, ruta: rutaArr, finished_at: new Date().toISOString() }).eq('id', ses.id)
      return json({ puntaje_global: global, insignia_asignada: insignia, ruta_nivelatorio_requerida: rutaArr, niveles: nv })
    }

    return json({ error: 'Acción inválida' }, 400)
  } catch (e) {
    console.error(e)
    return json({ error: 'Error al procesar la solicitud' }, 500)
  }
})
