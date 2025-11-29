export interface Problematica {
  id: string;
  categoria: string;
  titulo: string;
  items: string[];
}

export const problematicas: Problematica[] = [
  {
    id: "persona",
    categoria: "1. Dimensión de la Persona",
    titulo: "La Persona",
    items: [
      "Bajo interés y motivación para aprender una segunda lengua (inglés)",
      "Reducción del nivel de lengua extranjera post-pandemia",
      "Bajo rendimiento académico en matemáticas y temor a la disciplina",
      "Dificultades cognitivas en comprensión y aplicación de conceptos matemáticos",
      "Afectaciones emocionales derivadas del COVID-19",
      "Perfil psicomotor infantil desconocido (Soacha)",
      "Patologías físicas, motrices y psicológicas no caracterizadas en adultos mayores (Soacha)",
      "Maltrato, abuso infantil y problemas de salud mental (Girardot)",
      "Consumo de SPA, depresión, intentos de suicidio en jóvenes (Girardot)",
      "Desempleo que afecta el desarrollo profesional y el proyecto de vida",
      "Bajo nivel de tecnificación en procesos agrícolas que genera sobrecarga laboral"
    ]
  },
  {
    id: "aula",
    categoria: "2. Dimensión del Aula",
    titulo: "El Aula",
    items: [
      "La transversalidad de inglés no es evidente en los programas académicos",
      "Pocas estrategias pedagógicas para enseñanza de lenguas",
      "Falta de materiales didácticos modernos en escuelas rurales (Sumapaz)",
      "Ausencia de recursos tecnológicos: computadores, conectividad, laboratorios",
      "Ausencia de espacios académicos de ciencia y tecnología para niños y jóvenes",
      "Procesos pedagógicos de educación física sin caracterización de población",
      "Limitadas didácticas en matemáticas que afectan el rendimiento estudiantil",
      "Falta de integración curricular con prácticas internacionales en escuelas rurales"
    ]
  },
  {
    id: "cultura",
    categoria: "3. Dimensión de la Cultura",
    titulo: "La Cultura",
    items: [
      "Resistencia de agricultores al uso de TIC para comercialización de productos",
      "Tradición minera con bajos estándares de formación profesional (Ubaté)",
      "Cultura de la informalidad empresarial (Fusagasugá)",
      "Prácticas de silvicultura urbana con especies exóticas (Girardot)",
      "Desconexión entre cultura académica y cultura productiva rural",
      "Falta de apropiación comunitaria hacia el cuidado ambiental y manejo de residuos",
      "Persistencia de modelos tradicionales de comercio agrícola sin asociatividad",
      "Cultura del abandono y maltrato animal (Sabana Occidente)"
    ]
  },
  {
    id: "familia",
    categoria: "4. Dimensión de la Familia",
    titulo: "La Familia",
    items: [
      "Violencia intrafamiliar que afecta a niños, adolescentes y adultos mayores (Girardot)",
      "Abuso infantil en sus diferentes modalidades",
      "Consumo de SPA en jóvenes dentro de entornos familiares vulnerables",
      "Pobre acompañamiento familiar en procesos educativos durante y después del COVID-19",
      "Migración forzada de familias por desempleo y falta de oportunidades",
      "Abandono del adulto mayor en sus hogares",
      "Familias afectadas por falta de conectividad y recursos para educación virtual/rural"
    ]
  },
  {
    id: "naturaleza",
    categoria: "5. Dimensión de la Naturaleza",
    titulo: "La Naturaleza",
    items: [
      "Impactos ambientales por actividades antrópicas (Fusagasugá, Sumapaz)",
      "Contaminación del agua, disponibilidad y calidad insuficiente (Facatativá)",
      "Uso de especies exóticas en silvicultura urbana (Girardot)",
      "Gestión ineficiente de residuos sólidos domiciliarios",
      "Explotación minera y carbonífera contaminante (Ubaté)",
      "Sobreutilización de pesticidas y baja monitorización de variables ambientales",
      "Pérdida de biodiversidad y falta de aprovechamiento sostenible del ecoturismo",
      "Problemas de ruido, emisiones y afectación del aire por conurbación"
    ]
  },
  {
    id: "institucion",
    categoria: "6. Dimensión de la Institución",
    titulo: "La Institución",
    items: [
      "Falta de estudios, proyectos y políticas regionales con enfoque de sostenibilidad",
      "Escasos proyectos de vigilancia tecnológica en MIPYMES",
      "Falta de coordinación administrativa para proyectos regionales",
      "Carencia de apoyo institucional a emprendimientos y fortalecimiento empresarial",
      "Insuficiencia de infraestructura vial, recreativa y turística",
      "Falta de digitalización de PYMES y dificultades para sostenibilidad postpandemia",
      "Ausencia de políticas efectivas para la caracterización y uso de Big Data en empresas",
      "Recursos económicos limitados para proyectos de ciencia, tecnología e innovación",
      "Ausencia de un sistema efectivo de recolección y aprovechamiento de residuos sólidos",
      "Débil articulación entre universidad y territorios para el desarrollo de ciencia y tecnología"
    ]
  },
  {
    id: "sociedad",
    categoria: "7. Dimensión de la Sociedad",
    titulo: "La Sociedad",
    items: [
      "Destrucción del tejido social por presencia de grupos armados y estructuras criminales (Soacha)",
      "Aumento de pobreza y desigualdad post-COVID",
      "Baja asociatividad campesina y debilidades en la economía rural",
      "Migración y subempleo por bajo desarrollo empresarial en regiones (Ubaté)",
      "Problemas graves de movilidad entre Soacha y Bogotá",
      "Empleos vulnerables derivados de la informalidad empresarial",
      "Falta de políticas públicas orientadas a desarrollo productivo específico por región",
      "Abandono estatal y falta de acceso a servicios públicos esenciales (Ubaté)",
      "Débil integración regional para proyectos colectivos",
      "Crecimiento urbano sin planificación y sin proyección de servicios públicos",
      "Contaminación, residuos, y deterioro ambiental como fenómeno social colectivo"
    ]
  }
];
