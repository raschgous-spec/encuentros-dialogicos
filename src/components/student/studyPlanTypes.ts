export interface StudyContext {
  diagnostico: {
    fecha: string; nivel: string | null; promedio: number | null;
    herramientas: { tema: string; puntaje: number; maximo: number }[];
  } | null;
  nivelatorio: { fecha: string; puntaje: number; maximo: number; aprobado: boolean; nota_coordinador: number | null } | null;
}
export interface StudyPlan {
  id: string; difficulties: string; minutes_per_day: number; results_snapshot: StudyContext; plan: string; created_at: string;
}