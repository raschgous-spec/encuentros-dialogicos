import { describe, test, expect } from 'bun:test';
import { createGame, answer, resume, finalResult } from './logic';
import { PROBLEMAS } from '../_shared/problemasTranslocales';
describe('Reglas del Nivelatorio de gestores', () => {
 test('abarca los 7 tipos, los 6 métodos y las 5 herramientas en 18 problemas distintos del banco', () => {
  const g = createGame(); expect(g.tasks.filter(t => t.mision === 1)).toHaveLength(7); expect(g.tasks.filter(t => t.mision === 2)).toHaveLength(6); expect(g.tasks.filter(t => t.mision === 3)).toHaveLength(5); expect(new Set(g.tasks.map(t => t.problema.id)).size).toBe(18);
  expect(new Set(g.tasks.map(t => t.problema.p.toLowerCase().replace(/[^a-záéíóúñ0-9]+/g,' ').trim())).size).toBe(18);
  for(const t of g.tasks) expect(PROBLEMAS.find(p=>p.id===t.problema.id)).toEqual(t.problema);
  expect(g.tasks.filter(t => t.mision === 1).map(t => t.concepto).sort()).toEqual(['aplicada','basica','cualitativa','cuantitativa','descriptiva','explicativa','exploratoria']);
  expect(g.tasks.filter(t => t.mision === 2).map(t => t.concepto).sort()).toEqual(['analitico','deductivo','descriptivo','experimental','inductivo','sintetico']);
 });
 test('una nueva prueba no repite los problemas ya asignados al usuario ni sus textos duplicados', () => {
  const first=createGame();const second=createGame([],0,first.tasks.map(t=>t.problema.id));
  const keys=new Set(first.tasks.map(t=>t.problema.p.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()));
  for(const t of second.tasks) expect(keys.has(t.problema.p.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim())).toBe(false);
 });
 test('al agotar el banco reutiliza los menos recientes y no los de la última prueba', () => {
  const last=createGame();const recent=last.tasks.map(t=>t.problema.id);const g=createGame([],0,[...recent,...PROBLEMAS.filter(p=>!recent.includes(p.id)).map(p=>p.id)]);
  for(const t of g.tasks) expect(recent.includes(t.problema.id)).toBe(false);
  expect(new Set(g.tasks.map(t=>t.problema.id)).size).toBe(18);
 });
 test('inicia con 3 escudos y cada error resta uno y pausa el reloj', () => {
  const g = createGame([], 0); expect(g.escudos).toBe(3); const n = answer(g, 'incorrecto', 1000).game; expect(n.escudos).toBe(2); expect(n.pausa).toBe(true); expect(resume(n, 10000).remaining_ms).toBe(89000);
 });
 test('tres aciertos seguidos activan XP x2 y un error rompe la racha', () => {
  let g = createGame([], 0); for (let i=0;i<3;i++) g = answer(g, g.tasks[g.index].concepto, 100).game; expect(g.xp).toBe(400); g = answer(g, 'incorrecto', 200).game; expect(g.racha).toBe(0);
 });
 test('certifica al 80% solo si están completadas todas las asignaciones', () => {
  const g = createGame(); g.index = g.tasks.length;
  g.historial = g.tasks.map(t => ({id:t.id, concepto:t.concepto, mision:t.mision, elegido:t.concepto, correcto:true, tiempo_ms:0}));
  g.historial.push({...g.historial[0]}, {...g.historial[1]});
  for(let i=0;i<5;i++) g.historial.push({...g.historial[0], elegido:'incorrecto', correcto:false});
  expect(finalResult(g).precision).toBe(80); expect(finalResult(g).aprobado).toBe(true);
  g.historial.push({...g.historial[0], elegido:'incorrecto', correcto:false}); expect(finalResult(g).aprobado).toBe(false);
  g.index = 0; expect(finalResult(g).aprobado).toBe(false);
 });
 test('no certifica si falta cualquiera de las tres etapas aunque el puntaje sea 100%', () => {
  for(const mission of [1,2,3]) {
   const g=createGame();g.index=g.tasks.length;
   g.historial=g.tasks.filter(t=>t.mision!==mission).map(t=>({id:t.id,concepto:t.concepto,mision:t.mision,elegido:t.concepto,correcto:true,tiempo_ms:0}));
   expect(finalResult(g).precision).toBe(100);expect(finalResult(g).completo).toBe(false);expect(finalResult(g).aprobado).toBe(false);
  }
 });
 test('recorre Radar, Ensamblador y Fragua en orden y registra los 18 conceptos', () => {
  let g=createGame([],0);const missions:number[]=[];
  while(g.index<g.tasks.length){const t=g.tasks[g.index];missions.push(t.mision);g=answer(g,t.concepto,100).game;}
  expect(missions).toEqual([1,1,1,1,1,1,1,2,2,2,2,2,2,3,3,3,3,3]);
  expect(finalResult(g).dominio).toHaveLength(18);expect(finalResult(g).aprobado).toBe(true);
 });
 test('el límite de tiempo se valida en servidor, sin aciertos fuera de plazo', () => { const g = createGame([], 0); expect(answer(g, g.tasks[0].concepto, 90001).correcto).toBe(false); });
 test('sin escudos no permite nuevas respuestas', () => { const g = createGame(); g.escudos=0; expect(() => answer(g,'aplicada')).toThrow(); });
});