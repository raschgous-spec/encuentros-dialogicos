export interface ProblemaLaboratorio { id: string; u: string; p: string; }
export interface ResultadoLaboratorio {
 precision: number; aprobado: boolean; completo: boolean; xp: number; aciertos: number; intentos: number;
 estado_certificacion: string; diagnostico: string[];
 dominio: { categoria: string; concepto: string; intentos: number; precision: number; completado: boolean }[];
 problemas: ProblemaLaboratorio[];
 asignaciones?: { mision: number; concepto: string; problema: ProblemaLaboratorio }[];
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
 {titulo:'El Radar del Enfoque', eje:'Identificación del problema', cantidad:7, orientacion:'Identifica el tipo de investigación que mejor responde a la necesidad planteada, no solo al tema del problema.', pasos:['Lee el problema translocal y la necesidad de investigación.', 'Reconoce qué se busca conocer, qué información se necesita y para qué se utilizará.', 'Compara los tipos de investigación y selecciona el que corresponda al propósito descrito.']},
 {titulo:'El Ensamblador Metodológico', eje:'Desarrollo del problema', cantidad:6, orientacion:'Identifica el método que permite desarrollar la investigación de acuerdo con el procedimiento descrito.', pasos:['Lee el problema translocal y la necesidad de investigación.', 'Reconoce cómo se propone estudiar el problema: qué pasos se siguen y cómo se relacionan los datos, las partes y las conclusiones.', 'Compara los métodos y selecciona el que mejor coincida con ese procedimiento.']},
 {titulo:'La Fragua Propositiva', eje:'Solución propositiva', cantidad:5, orientacion:'Selecciona la herramienta de calidad que mejor ayuda a cumplir el requerimiento del prototipo.', pasos:['Lee el problema translocal y el requerimiento del prototipo.', 'Identifica qué debe producir la herramienta: ideas, agrupaciones, análisis de causas, prioridades o estrategias.', 'Completa los campos de tipo y método validados y selecciona la herramienta adecuada para ese requerimiento.']},
];