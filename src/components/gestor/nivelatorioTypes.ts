export interface ProblemaLaboratorio { id: string; u: string; p: string; }
export interface ResultadoLaboratorio {
 precision: number; aprobado: boolean; completo: boolean; xp: number; aciertos: number; intentos: number;
 estado_certificacion: string; diagnostico: string[];
 dominio: { categoria: string; concepto: string; intentos: number; precision: number; completado: boolean }[];
 problemas: ProblemaLaboratorio[];
 proposicion: { problema: string; unidad: string; tipo: string; metodo: string; herramientas: string[]; objetivo: string; desarrollo: string; acciones: string; seguimiento: string };
}
export interface SesionLaboratorio {
 sesion_id: string; version: number; estado: string; facultad: string | null; finished_at: string | null;
 index: number; total: number; escudos: number; racha: number; xp: number; pausa: boolean; capsule?: string; remaining_ms: number; diagnostico: string[];
 resultado: ResultadoLaboratorio | null;
 task: { id: string; mision: number; necesidad: string; problema: ProblemaLaboratorio; opciones: string[]; slots: { tipo: string; metodo: string } | null } | null;
}
export const NOMBRES: Record<string, string> = {
 cuantitativa:'Cuantitativa', cualitativa:'Cualitativa', basica:'Básica o pura', aplicada:'Aplicada', exploratoria:'Exploratoria', descriptiva:'Descriptiva', explicativa:'Explicativa',
 inductivo:'Inductivo', deductivo:'Deductivo', analitico:'Analítico', sintetico:'Sintético', experimental:'Experimental', descriptivo:'Descriptivo',
 DOFA:'DOFA', Ishikawa:'Ishikawa', Pareto:'Pareto', Afinidad:'Afinidad', Brainstorming:'Brainstorming',
};
export const MISIONES = [
 {titulo:'El Radar del Enfoque', eje:'Identificación del problema', cantidad:7},
 {titulo:'El Ensamblador Metodológico', eje:'Desarrollo del problema', cantidad:6},
 {titulo:'La Fragua Propositiva', eje:'Solución propositiva', cantidad:5},
];