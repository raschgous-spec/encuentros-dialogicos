import { DiagnosticConfig } from '@/types/diagnostic';

export const diagnosticConfig: DiagnosticConfig = {
  brainstorming: {
    max_selections: 5,
    options: [
      { id: "opt1", text: "Implementar compostaje con residuos de cafetería" },
      { id: "opt2", text: "Suspender los proyectos productivos temporalmente" },
      { id: "opt3", text: "Cambiar proveedores a productos biodegradables" },
      { id: "opt4", text: "Organizar campañas de educación ambiental" },
      { id: "opt5", text: "Aumentar los horarios de producción" },
      { id: "opt6", text: "Reutilizar envases y materiales en laboratorios" },
      { id: "opt7", text: "Reducir el consumo de energía mediante sensores" },
      { id: "opt8", text: "Incrementar la venta de productos locales" }
    ],
    correct_option_ids: ["opt1", "opt3", "opt4", "opt6", "opt7"]
  },
  affinity: {
    categories: ["Energía", "Residuos", "Educación", "Gestión Admin."],
    items: [
      { id: "item1", text: "Luces encendidas en aulas desocupadas", correct: "Energía" },
      { id: "item2", text: "Poca separación de residuos reciclables", correct: "Residuos" },
      { id: "item3", text: "Falta de campañas informativas ambientales", correct: "Educación" },
      { id: "item4", text: "Escasa planificación de compras sostenibles", correct: "Gestión Admin." }
    ]
  },
  ishikawa: {
    categories: ["Métodos", "Materiales", "Personas", "Entorno", "Maquinaria"],
    causes: [
      { id: "c1", text: "Falta de cultura ambiental", correct: "Personas" },
      { id: "c2", text: "Uso de materiales no biodegradables", correct: "Materiales" },
      { id: "c3", text: "Procesos productivos ineficientes", correct: "Métodos" },
      { id: "c4", text: "Falta de control energético", correct: "Maquinaria" },
      { id: "c5", text: "Espacios sin gestión de residuos", correct: "Entorno" }
    ]
  },
  dofa: {
    quadrants: ["Fortalezas", "Debilidades", "Oportunidades", "Amenazas"],
    statements: [
      { id: "s1", text: "Apoyo institucional a proyectos verdes", correct: "Fortalezas" },
      { id: "s2", text: "Exceso de desechos plásticos", correct: "Debilidades" },
      { id: "s3", text: "Posibilidad de alianzas con proveedores sostenibles", correct: "Oportunidades" },
      { id: "s4", text: "Limitaciones de presupuesto para innovación", correct: "Amenazas" }
    ]
  },
  pareto: {
    ranks: ["1° (Mayor impacto)", "2°", "3°", "4° (Menor impacto)"],
    causes: [
      { id: "p1", text: "Falta de educación ambiental", impact_score: 75, correct_rank: "3°" },
      { id: "p2", text: "Desperdicio de materiales", impact_score: 50, correct_rank: "4° (Menor impacto)" },
      { id: "p3", text: "Mala disposición de residuos", impact_score: 90, correct_rank: "1° (Mayor impacto)" },
      { id: "p4", text: "Consumo excesivo de energía", impact_score: 85, correct_rank: "2°" }
    ]
  }
};
