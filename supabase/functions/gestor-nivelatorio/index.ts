import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3';
import { createGame, answer, resume, finalResult, publicGame, type Game } from './logic.ts';
const schema = z.object({ accion: z.enum(['iniciar','estado','responder','continuar','finalizar']), sesion_id: z.string().uuid().optional(), version: z.number().int().nonnegative().optional(), seleccion: z.string().max(40).optional(), tipo: z.string().optional(), metodo: z.string().optional() });
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type':'application/json' } });
Deno.serve(async req => {
 if (req.method === 'OPTIONS') return new Response('ok', {headers:corsHeaders});
 try {
  const url = Deno.env.get('SUPABASE_URL'), anon = Deno.env.get('SUPABASE_ANON_KEY'), key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !anon || !key) throw new Error('Configuración no disponible');
  const token = req.headers.get('Authorization'); if (!token) return json({error:'Ingresa para continuar.'},401);
  const client = createClient(url, anon, {global:{headers:{Authorization:token}}, auth:{persistSession:false}});
  const { data:{user} } = await client.auth.getUser(); if (!user) return json({error:'La sesión expiró.'},401);
  const db = createClient(url,key,{auth:{persistSession:false}});
  const {data:g} = await db.from('gestores_conocimiento').select('facultad').eq('user_id',user.id).maybeSingle();
  const {data:roles} = await db.from('user_roles').select('role').eq('user_id',user.id);
  if (!g && !(roles || []).some(r => r.role === 'admin')) return json({error:'Esta experiencia es exclusiva para gestores.'},403);
  const parsed = schema.safeParse(await req.json()); if (!parsed.success) return json({error:'Solicitud no válida.'},400);
  const body = parsed.data;
  let row;
  if (body.accion === 'iniciar' || (body.accion === 'estado' && !body.sesion_id)) {
   const {data:existing,error} = await db.from('gestor_nivelatorio_sesiones').select('*').eq('user_id',user.id).order('started_at',{ascending:false}).limit(1).maybeSingle(); if(error) throw error;
   if (existing && (body.accion === 'estado' || existing.estado === 'en_progreso')) row = existing;
   else if (body.accion === 'estado') return json({sesion:null});
   else {
    const {data:diag} = await db.from('medit_sesiones').select('ruta').eq('user_id',user.id).not('finished_at','is',null).order('finished_at',{ascending:false}).limit(1).maybeSingle();
    const brechas = (diag?.ruta || []) as string[];
    // El diagnóstico identifica ejes, no distingue todos los 13 conceptos. Priorizar sin atribuirle mediciones que no guarda.
    const prioridades = [...brechas];
    if (brechas.includes('modulo_identificacion')) prioridades.push('tipo_cuantitativa','tipo_cualitativa');
    if (brechas.includes('modulo_fases_investigacion')) prioridades.push('metodo_deductivo','metodo_inductivo');
    const {data:created,error:e} = await db.from('gestor_nivelatorio_sesiones').insert({user_id:user.id,facultad:g?.facultad,contenido:createGame(prioridades)}).select('*').single(); if(e) throw e; row=created;
   }
  } else {
   if (!body.sesion_id) return json({error:'Falta la sesión.'},400);
   const {data,error} = await db.from('gestor_nivelatorio_sesiones').select('*').eq('id',body.sesion_id).eq('user_id',user.id).maybeSingle(); if(error) throw error; row=data;
  }
  if(!row) return json({error:'Sesión no encontrada.'},404);
  let game = row.contenido as Game;
  if (!['estado','iniciar'].includes(body.accion)) {
   if (row.estado !== 'en_progreso' || body.version !== row.version) return json({error:'Esta sesión cambió. Actualiza para continuar.'},409);
   if(body.accion === 'responder') {
    if (typeof body.seleccion !== 'string') return json({error:'Selecciona una carta.'},400);
    if(game.tasks[game.index]?.mision === 3 && (body.tipo !== 'aplicada' || body.metodo !== 'analitico')) return json({error:'Completa las ranuras validadas de tipo y método.'},400);
    game = answer(game, body.seleccion).game;
   }
   if(body.accion === 'continuar') game = resume(game);
   if(body.accion === 'finalizar' && game.index < game.tasks.length && game.escudos > 0) return json({error:'Completa las tres misiones antes de finalizar.'},400);
   const end = game.index === game.tasks.length || game.escudos === 0 || body.accion === 'finalizar';
   const {data:updated,error} = await db.from('gestor_nivelatorio_sesiones').update({contenido:game,version:row.version+1,...(end ? {estado:'finalizado',resultado:finalResult(game),finished_at:new Date().toISOString()} : {})}).eq('id',row.id).eq('user_id',user.id).eq('version',body.version).select('*').maybeSingle();
   if(error) throw error; if(!updated) return json({error:'Otra respuesta ya se guardó. Actualiza para continuar.'},409); row=updated;
  }
  return json({sesion_id:row.id,version:row.version,estado:row.estado,facultad:row.facultad,finished_at:row.finished_at,resultado:row.resultado,...publicGame(game)});
 } catch(e) { return json({error:e instanceof Error && !('code' in e) ? e.message : 'No se pudo guardar la misión. Inténtalo de nuevo.'},400); }
});