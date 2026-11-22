type Diagnostic = {
  id: string; fecha: string; nivel: string | null; puntaje_promedio: number | null;
  puntaje_brainstorming: number | null; puntaje_affinity: number | null;
  puntaje_ishikawa: number | null; puntaje_dofa: number | null; puntaje_pareto: number | null;
};
type Nivelatorio = {
  id: string; completed_at: string; automatic_score: number; max_score: number;
  passed: boolean; coordinator_reviewed: boolean; coordinator_score: number | null;
};
export const DIAGNOSTIC_COLUMNS = 'id,fecha,nivel,puntaje_promedio,puntaje_brainstorming,puntaje_affinity,puntaje_ishikawa,puntaje_dofa,puntaje_pareto';
export const NIVELATORIO_COLUMNS = 'id,completed_at,automatic_score,max_score,passed,coordinator_reviewed,coordinator_score';
export function studyContext(diagnostic: Diagnostic | null, nivelatorio: Nivelatorio | null) {
  const herramientas = diagnostic ? [
    { tema: 'Lluvia de ideas', puntaje: diagnostic.puntaje_brainstorming, maximo: 100 },
    { tema: 'Afinidad', puntaje: diagnostic.puntaje_affinity, maximo: 100 },
    { tema: 'Ishikawa', puntaje: diagnostic.puntaje_ishikawa, maximo: 100 },
    { tema: 'DOFA', puntaje: diagnostic.puntaje_dofa, maximo: 100 },
    { tema: 'Pareto', puntaje: diagnostic.puntaje_pareto, maximo: 100 },
  ].filter(item => typeof item.puntaje === 'number' && Number.isFinite(item.puntaje)) : [];
  return {
    diagnostico: diagnostic ? { fecha: diagnostic.fecha, nivel: diagnostic.nivel, promedio: diagnostic.puntaje_promedio, herramientas } : null,
    nivelatorio: nivelatorio ? {
      fecha: nivelatorio.completed_at, puntaje: nivelatorio.automatic_score, maximo: nivelatorio.max_score,
      aprobado: nivelatorio.passed,
      nota_coordinador: nivelatorio.coordinator_reviewed ? nivelatorio.coordinator_score : null,
    } : null,
  };
}

export function ownerResultQueries<T extends { from: (table: string) => any }>(db: T, userId: string) {
  return [
    db.from('evaluaciones').select(DIAGNOSTIC_COLUMNS).eq('estudiante_id', userId).order('fecha', { ascending: false }).limit(1).maybeSingle(),
    db.from('student_evaluations').select(NIVELATORIO_COLUMNS).eq('user_id', userId).eq('momento', 'nivelatorio').order('completed_at', { ascending: false }).limit(1).maybeSingle(),
  ];
}