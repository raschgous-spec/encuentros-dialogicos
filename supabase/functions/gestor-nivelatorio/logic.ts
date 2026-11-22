import { PROBLEMAS } from '../_shared/problemasTranslocales.ts';

export const TIPOS = ['cuantitativa', 'cualitativa', 'basica', 'aplicada', 'exploratoria', 'descriptiva', 'explicativa'];
export const METODOS = ['inductivo', 'deductivo', 'analitico', 'sintetico', 'experimental', 'descriptivo'];
export const HERRAMIENTAS = ['DOFA', 'Ishikawa', 'Pareto', 'Afinidad', 'Brainstorming'];
const NECESIDADES: Record<string, string> = {
 cuantitativa: 'Medir variables, frecuencias y promedios mediante encuestas estructuradas a una muestra amplia.',
 cualitativa: 'Comprender las experiencias y significados de la comunidad mediante entrevistas y grupos focales en su contexto natural.',
 basica: 'Formular principios teóricos que amplíen el conocimiento, sin buscar una intervención práctica inmediata.',
 aplicada: 'Diseñar un prototipo o intervención práctica que responda directamente a esta necesidad territorial.',
 exploratoria: 'Delimitar un fenómeno poco conocido, con información escasa, e identificar hipótesis preliminares.',
 descriptiva: 'Caracterizar perfiles y condiciones actuales sin explicar causas ni manipular variables.',
 explicativa: 'Determinar por qué y cómo ocurre el fenómeno mediante un modelo de sus relaciones causales.',
 inductivo: 'Partir de observaciones particulares del territorio, encontrar patrones y construir una conclusión general.',
 deductivo: 'Partir de una teoría general, formular una hipótesis verificable y contrastarla con datos del territorio.',
 analitico: 'Descomponer el problema en factores y estudiar cada componente por separado.',
 sintetico: 'Integrar los hallazgos dispersos previamente analizados para reconstruir una explicación sistémica.',
 experimental: 'Manipular una variable independiente con asignación aleatoria a grupos experimental y de control para comprobar causalidad.',
 descriptivo: 'Observar y registrar qué, cómo, cuándo y dónde ocurre el fenómeno sin intervenir ni manipular variables.',
 DOFA: 'Formular una estrategia considerando fortalezas y debilidades internas, y oportunidades y amenazas externas.',
 Ishikawa: 'Organizar las posibles causas raíz por personas, métodos, recursos y entorno.',
 Pareto: 'Priorizar, a partir de frecuencias documentadas, los pocos factores que concentran la mayor parte del impacto.',
 Afinidad: 'Agrupar aportes dispersos de la comunidad por semejanza temática para reconocer categorías.',
 Brainstorming: 'Generar muchas ideas de solución sin juzgarlas durante la fase creativa inicial.',
};
export interface Task { id: string; mision: number; concepto: string; necesidad: string; problema: { id: string; u: string; p: string }; }
export interface Attempt { id: string; concepto: string; mision: number; elegido: string; correcto: boolean; tiempo_ms: number; }
export interface Game {
 tasks: Task[]; index: number; escudos: number; racha: number; xp: number; historial: Attempt[];
 pausa: boolean; capsule?: string; remaining_ms: number; clock_at: number; diagnostico: string[];
}
export const shuffle = <T,>(arr: T[]) => {
 const result = [...arr];
 for (let i = result.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [result[i], result[j]] = [result[j], result[i]];
 }
 return result;
};
const problemKey = (p: { p: string }) => p.p.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
// The bank contains the same statement under several regional IDs: deduplicate the text too.
export function selectProblems(count: number, recentIds: string[] = []) {
 const lastSeen = new Map<string, number>();
 recentIds.forEach((id, i) => { const p = PROBLEMAS.find(x => x.id === id); if(p && !lastSeen.has(problemKey(p))) lastSeen.set(problemKey(p), i); });
 const unique = new Map<string, typeof PROBLEMAS[number]>();
 shuffle(PROBLEMAS).forEach(p => { if(!unique.has(problemKey(p))) unique.set(problemKey(p), p); });
 const pool = shuffle([...unique.values()]).sort((a,b) => {
  const ar=lastSeen.get(problemKey(a)), br=lastSeen.get(problemKey(b));
  if(ar === undefined) return br === undefined ? 0 : -1;
  if(br === undefined) return 1;
  return br - ar;
 });
 if(pool.length < count) throw new Error('El banco no tiene suficientes problemas distintos.');
 return pool.slice(0,count);
}
export function createGame(brechas: string[] = [], now = Date.now(), recentIds: string[] = []): Game {
 const problems = selectProblems(TIPOS.length + METODOS.length + HERRAMIENTAS.length, recentIds);
 const prioritize = (xs: string[], prefix: string) => shuffle(xs).sort((a, b) => Number(brechas.includes(prefix + b)) - Number(brechas.includes(prefix + a)));
 const groups = [prioritize(TIPOS, 'tipo_'), prioritize(METODOS, 'metodo_'), shuffle(HERRAMIENTAS)];
 let position = 0;
 const tasks = groups.flatMap((concepts, i) => concepts.map((concepto, j) => ({ id: `${i + 1}-${j}`, mision: i + 1, concepto, necesidad: NECESIDADES[concepto], problema: problems[position++] })));
 return { tasks, index: 0, escudos: 3, racha: 0, xp: 0, historial: [], pausa: false, remaining_ms: 90_000, clock_at: now, diagnostico: brechas };
}
export function answer(game: Game, elegido: string, now = Date.now()) {
 const task = game.tasks[game.index];
 if (!task || game.pausa || game.historial.some(a => a.id === task.id)) throw new Error('La asignación no está disponible.');
 const elapsed = Math.max(0, now - game.clock_at);
 const time = Math.min(90_000, 90_000 - game.remaining_ms + elapsed);
 const correcto = elapsed <= game.remaining_ms && elegido === task.concepto;
 const next: Game = { ...game, historial: [...game.historial, { id: task.id, concepto: task.concepto, mision: task.mision, elegido, correcto, tiempo_ms: time }], racha: correcto ? game.racha + 1 : 0, escudos: correcto ? game.escudos : Math.max(0, game.escudos - 1) };
 if (correcto) { next.xp += next.racha >= 3 ? 200 : 100; next.index++; next.remaining_ms = 90_000; next.clock_at = now; }
 else { next.pausa = true; next.capsule = (task.mision === 1 ? 'tipo_' : task.mision === 2 ? 'metodo_' : 'herramienta_') + task.concepto; next.remaining_ms = Math.max(0, game.remaining_ms - elapsed); }
 return { game: next, correcto };
}
export function resume(game: Game, now = Date.now()): Game {
 if (!game.pausa) throw new Error('No se puede continuar esta expedición.');
 return { ...game, index: game.index + 1, pausa: false, capsule: undefined, remaining_ms: 90_000, clock_at: now };
}
export function finalResult(game: Game) {
 const correct = game.historial.filter(x => x.correcto).length;
 const precision = game.historial.length ? Math.round(correct / game.historial.length * 10000) / 100 : 0;
 const completeMission = (mission: number, concepts: string[]) => concepts.every(concept => {
   const task = game.tasks.find(t => t.mision === mission && t.concepto === concept);
   return task !== undefined && game.historial.some(a => a.id === task.id && a.mision === mission && a.concepto === concept);
 });
 const completo = game.index === game.tasks.length
   && completeMission(1, TIPOS) && completeMission(2, METODOS) && completeMission(3, HERRAMIENTAS);
 const aprobado = completo && precision >= 80;
 const dominio = game.tasks.map(t => {
   const h = game.historial.filter(a => a.id === t.id);
   return { categoria: t.mision === 1 ? 'Tipo' : t.mision === 2 ? 'Método' : 'Herramienta', concepto: t.concepto, intentos: h.length, precision: h.length ? Math.round(h.filter(a => a.correcto).length / h.length * 100) : 0, completado: h.length > 0 };
 });
 const p = game.tasks.find(t => t.mision === 3)?.problema;
 return { precision, aprobado, completo, xp: game.xp, aciertos: correct, intentos: game.historial.length, dominio, problemas: [1, 2, 3].map(n => game.tasks.find(t => t.mision === n)?.problema), asignaciones: game.tasks.map(t => ({ mision:t.mision, concepto:t.concepto, problema:t.problema })), diagnostico: game.diagnostico,
   estado_certificacion: aprobado ? 'Habilitado para Encuentro Dialógico' : 'Requiere refuerzo en Cápsulas MEDIT',
   proposicion: { problema: p?.p || '', unidad: p?.u || '', tipo: 'aplicada', metodo: 'analitico', herramientas: HERRAMIENTAS,
     objetivo: `Diseñar una intervención piloto para abordar: ${p?.p || ''}`,
     desarrollo: 'Descomponer los factores del problema, contrastarlos con evidencia local y construir un prototipo de intervención con la comunidad.',
     acciones: 'Generar ideas con Brainstorming; agruparlas con Afinidad; identificar causas con Ishikawa; priorizar con Pareto cuando existan frecuencias; contrastar la estrategia con DOFA.',
     seguimiento: 'Acordar con el coordinador responsables, plazos e indicadores; levantar una línea base y comparar los resultados del piloto. Borrador orientativo, pendiente de validación territorial.' } };
}
export function publicGame(game: Game) {
 const task = game.tasks[game.index];
 return { index: game.index, total: game.tasks.length, escudos: game.escudos, racha: game.racha, xp: game.xp, pausa: game.pausa, capsule: game.capsule,
 remaining_ms: game.pausa ? game.remaining_ms : Math.max(0, game.remaining_ms - (Date.now() - game.clock_at)), diagnostico: game.diagnostico,
 task: task ? { id: task.id, mision: task.mision, necesidad: task.necesidad, problema: task.problema, opciones: shuffle(task.mision === 1 ? TIPOS : task.mision === 2 ? METODOS : HERRAMIENTAS), slots: task.mision === 3 ? { tipo: 'aplicada', metodo: 'analitico' } : null } : null };
}