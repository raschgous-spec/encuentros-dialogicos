import { describe, expect, test } from 'bun:test';
import { ownerResultQueries, studyContext } from './context';

describe('Planes basados en resultados propios', () => {
  test('consulta exclusivamente las valoraciones del estudiante autenticado', () => {
    const filters: Record<string, unknown[]> = {};
    const db = { from(table: string) {
      filters[table] = [];
      const query = { select() { return query; }, eq(column: string, value: string) { filters[table].push([column, value]); return query; }, order() { return query; }, limit() { return query; }, maybeSingle() { return null; } };
      return query;
    } };
    ownerResultQueries(db, 'estudiante-autenticado');
    expect(filters.evaluaciones).toEqual([['estudiante_id', 'estudiante-autenticado']]);
    expect(filters.student_evaluations).toEqual([['user_id', 'estudiante-autenticado'], ['momento', 'nivelatorio']]);
  });
  test('envía puntajes reales por tema sin identidad ni respuestas privadas', () => {
    const diagnostic = { id: 'privado', fecha: '2026-11-22', nivel: 'basico', puntaje_promedio: 54, puntaje_brainstorming: 80, puntaje_affinity: 60, puntaje_ishikawa: 30, puntaje_dofa: 50, puntaje_pareto: 50, email: 'dato-privado', respuestas_completas: 'respuesta privada' };
    const result = studyContext(diagnostic, null);
    expect(result.diagnostico?.herramientas.find(x => x.tema === 'Ishikawa')?.puntaje).toBe(30);
    expect(result.diagnostico?.promedio).toBe(54);
    expect(JSON.stringify(result)).not.toContain('privado');
  });
  test('no inventa resultados cuando no existen', () => {
    expect(studyContext(null, null)).toEqual({ diagnostico: null, nivelatorio: null });
  });
});