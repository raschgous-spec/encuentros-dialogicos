import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } })

// ---------- Banco de casos (respuestas solo en servidor) ----------
type Enfoque = 'Cuantitativo' | 'Cualitativo' | 'Mixto'
const N1: { id: string; titulo: string; contexto: string; ok: Enfoque }[] = [
  { id: 'n1a', titulo: 'Deserción en primer semestre', contexto: 'La tasa de deserción subió del 12% al 19% en dos años. Planeación necesita medir la magnitud por programa y sede con los registros académicos.', ok: 'Cuantitativo' },
  { id: 'n1b', titulo: 'Percepción del bienestar', contexto: 'Estudiantes de la sede rural expresan sentirse "invisibles" para la institución. Se busca comprender sus vivencias y significados.', ok: 'Cualitativo' },
  { id: 'n1c', titulo: 'Apropiación del aula virtual', contexto: 'Se requiere saber cuántos docentes usan el aula virtual y, además, por qué algunos la rechazan, mediante encuestas y entrevistas.', ok: 'Mixto' },
  { id: 'n1d', titulo: 'Fallas de conectividad', contexto: 'Se reportan caídas de red. Se necesita cuantificar la frecuencia y duración de las interrupciones por edificio durante un mes.', ok: 'Cuantitativo' },
  { id: 'n1e', titulo: 'Cultura de la calidad', contexto: 'Tras la visita de pares, se quiere interpretar cómo los equipos docentes entienden la autoevaluación, a través de grupos focales.', ok: 'Cualitativo' },
  { id: 'n1f', titulo: 'Impacto del programa de tutorías', contexto: 'Se evaluará si las tutorías mejoran el promedio académico y cómo las viven los estudiantes que participan.', ok: 'Mixto' },
]
const FASES = ['Planteamiento del problema', 'Marco teórico', 'Metodología', 'Recolección de datos', 'Resultados']
type Herr = 'Ishikawa' | 'Pareto' | 'DOFA'
const N3: { id: string; contexto: string; ok: Herr; modulo: string }[] = [
  { id: 'n3a', contexto: 'La cafetería central recibe quejas repetidas. Hay que encontrar las causas raíz agrupadas por mano de obra, métodos, materiales y entorno.', ok: 'Ishikawa', modulo: 'modulo_desarrollo_ishikawa' },
  { id: 'n3b', contexto: 'Hay 14 tipos de incidencias en la mesa de ayuda. Se debe priorizar el 20% de causas que generan el 80% de los reportes.', ok: 'Pareto', modulo: 'modulo_desarrollo_pareto' },
  { id: 'n3c', contexto: 'La facultad planea abrir un programa virtual y necesita analizar fortalezas, debilidades, oportunidades y amenazas del entorno.', ok: 'DOFA', modulo: 'modulo_desarrollo_dofa' },
  { id: 'n3d', contexto: 'La baja asistencia a laboratorios parece tener múltiples causas interrelacionadas que nadie ha organizado.', ok: 'Ishikawa', modulo: 'modulo_desarrollo_ishikawa' },
  { id: 'n3e', contexto: 'De los motivos de cancelación de matrícula registrados, se debe identificar cuáles pocos concentran la mayoría de casos.', ok: 'Pareto', modulo: 'modulo_desarrollo_pareto' },
  { id: 'n3f', contexto: 'La dirección quiere definir la estrategia de investigación 2027 considerando el contexto interno y externo.', ok: 'DOFA', modulo: 'modulo_desarrollo_dofa' },
]
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

      const n1 = shuffle(N1).slice(0, 3)
      const n3 = shuffle(N3).slice(0, 4)
      const casos = { n1: n1.map((x) => x.id), n2: shuffle(FASES), n3: n3.map((x) => x.id) }
      const { data: s, error } = await admin.from('medit_sesiones').insert({
        user_id: user.id, facultad: (g as any)?.facultad || c?.facultad || null, programa: c?.programa ?? null, sede: c?.sede ?? null, casos,
      }).select('id, started_at').single()
      if (error) throw error
      return json({
        sesion_id: s.id,
        timestamp_inicio: s.started_at,
        limites_ms: LIMITE_MS,
        nivel1: n1.map(({ id, titulo, contexto }) => ({ id, titulo, contexto })),
        nivel2: casos.n2,
        nivel3: n3.map(({ id, contexto }) => ({ id, contexto })),
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
        ids.forEach((id) => { const c = N1.find((x) => x.id === id)!; const ok = resp[id] === c.ok; if (ok) base++; detalle.push({ id, elegido: resp[id] ?? null, correcto: ok }) })
        base = (base / ids.length) * 100
      } else if (nivel === 2) {
        const orden: string[] = Array.isArray(resp.orden) ? resp.orden : []
        let ok = 0
        FASES.forEach((f, i) => { if (orden[i] === f) ok++ })
        base = (ok / FASES.length) * 100
        detalle.push({ orden, posiciones_correctas: ok })
      } else if (nivel === 3) {
        const ids: string[] = ses.casos.n3
        ids.forEach((id) => { const c = N3.find((x) => x.id === id)!; const ok = resp[id] === c.ok; if (ok) base++; detalle.push({ id, elegido: resp[id] ?? null, correcto: ok, modulo: c.modulo }) })
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
