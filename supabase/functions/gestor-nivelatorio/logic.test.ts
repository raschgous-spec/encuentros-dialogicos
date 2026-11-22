import { describe, test, expect } from 'bun:test';
import { createGame, answer, resume, finalResult } from './logic';
describe('Reglas del Nivelatorio de gestores', () => {
 test('abarca los 7 tipos, los 6 métodos y las 5 herramientas en 3 problemas distintos', () => {
  const g = createGame(); expect(g.tasks.filter(t => t.mision === 1)).toHaveLength(7); expect(g.tasks.filter(t => t.mision === 2)).toHaveLength(6); expect(g.tasks.filter(t => t.mision === 3)).toHaveLength(5); expect(new Set(g.tasks.map(t => t.problema.id)).size).toBe(3);
 });
 test('inicia con 3 escudos y cada error resta uno y pausa el reloj', () => {
  const g = createGame([], 0); expect(g.escudos).toBe(3); const n = answer(g, 'incorrecto', 1000).game; expect(n.escudos).toBe(2); expect(n.pausa).toBe(true); expect(resume(n, 10000).remaining_ms).toBe(89000);
 });
 test('tres aciertos seguidos activan XP x2 y un error rompe la racha', () => {
  let g = createGame([], 0); for (let i=0;i<3;i++) g = answer(g, g.tasks[g.index].concepto, 100).game; expect(g.xp).toBe(400); g = answer(g, 'incorrecto', 200).game; expect(g.racha).toBe(0);
 });
 test('certifica al 80% solo si están completadas todas las asignaciones', () => {
  const g = createGame(); g.index = g.tasks.length; g.historial = Array.from({length: 20}, (_,i) => ({id:'1-0', concepto:'aplicada', mision:1, elegido:'aplicada', correcto:i<16, tiempo_ms:0})); expect(finalResult(g).precision).toBe(80); expect(finalResult(g).aprobado).toBe(true); g.historial[15].correcto = false; expect(finalResult(g).aprobado).toBe(false); g.index = 0; expect(finalResult(g).aprobado).toBe(false);
 });
 test('el límite de tiempo se valida en servidor, sin aciertos fuera de plazo', () => { const g = createGame([], 0); expect(answer(g, g.tasks[0].concepto, 90001).correcto).toBe(false); });
 test('sin escudos no permite nuevas respuestas', () => { const g = createGame(); g.escudos=0; expect(() => answer(g,'aplicada')).toThrow(); });
});