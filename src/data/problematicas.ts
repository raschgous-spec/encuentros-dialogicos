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
      "Falta de hábitos de estudio autónomo en entornos digitales",
      "Desmotivación frente a los procesos académicos virtuales",
      "Dificultades para la autorregulación del tiempo y la organización personal",
      "Desconocimiento de herramientas digitales para el aprendizaje independiente",
      "Baja autoestima académica en los primeros semestres",
      "Estrés y ansiedad asociados a las exigencias universitarias",
      "Escaso reconocimiento de las propias fortalezas y potencialidades",
      "Dificultades para establecer metas personales y académicas claras",
      "Carencia de estrategias para la gestión emocional frente al fracaso",
      "Falta de compromiso con la responsabilidad ética en entornos virtuales",
      "Débil desarrollo de habilidades blandas (asertividad, empatía, liderazgo)",
      "Desinterés por la formación continua o por los procesos de actualización digital",
      "Falta de conciencia sobre el autocuidado físico y mental en la vida universitaria"
    ]
  },
  {
    id: "aula",
    categoria: "2. Dimensión del Aula",
    titulo: "El Aula",
    items: [
      "Escasa participación en actividades colaborativas digitales",
      "Limitada interacción entre estudiantes y docentes en el CAI",
      "Uso tradicionalista de las plataformas digitales (como repositorio, no como espacio de co-construcción)",
      "Dificultades para la comunicación efectiva en espacios virtuales",
      "Desigualdad en el acceso a dispositivos o conexión a internet",
      "Baja apropiación de los recursos educativos digitales por parte del estudiantado",
      "Dificultades en la retroalimentación oportuna en entornos virtuales",
      "Limitada integración entre la teoría y la práctica mediante herramientas digitales",
      "Poca innovación en las estrategias de mediación pedagógica",
      "Falta de acompañamiento docente en el uso de entornos interactivos",
      "Dificultades para la evaluación formativa mediante instrumentos digitales",
      "Inadecuada planeación del aprendizaje colaborativo en línea",
      "Limitado uso de herramientas de coautoría digital (Miro, Padlet, Jamboard, etc.)"
    ]
  },
  {
    id: "cultura",
    categoria: "3. Dimensión de la Cultura",
    titulo: "La Cultura",
    items: [
      "Desconocimiento del valor del patrimonio cultural regional en los procesos educativos",
      "Escasa integración de la diversidad cultural en las dinámicas institucionales",
      "Debilidad en la promoción de eventos artísticos y culturales en formato digital",
      "Pérdida del sentido de comunidad universitaria",
      "Insuficiente reconocimiento de la identidad cundinamarquesa en los programas académicos",
      "Falta de espacios para el diálogo intercultural y la inclusión",
      "Escasa participación de estudiantes en grupos o semilleros culturales",
      "Débil apropiación de la ética y los valores institucionales",
      "Limitado aprovechamiento de los medios digitales para difundir la cultura universitaria",
      "Dificultades para integrar la cultura digital como forma de expresión académica",
      "Desinterés por la participación en proyectos artísticos o culturales colectivos",
      "Falta de reconocimiento a las prácticas culturales estudiantiles"
    ]
  },
  {
    id: "familia",
    categoria: "4. Dimensión de la Familia",
    titulo: "La Familia",
    items: [
      "Escaso acompañamiento familiar en el proceso educativo universitario",
      "Falta de comprensión por parte de las familias del modelo educativo digital",
      "Conflictos familiares que afectan la continuidad académica",
      "Dificultad para conciliar responsabilidades familiares y académicas",
      "Desconocimiento de los logros y avances del estudiante por parte de su familia",
      "Brecha generacional en el uso de tecnologías y comprensión del entorno digital",
      "Ausencia de redes de apoyo familiar durante los periodos de evaluación",
      "Poca participación de la familia en las actividades institucionales",
      "Sobrecarga emocional derivada de la falta de apoyo familiar",
      "Desmotivación académica por desinterés del núcleo familiar",
      "Limitado acceso de las familias a los canales de información institucional",
      "Falta de orientación a los padres o tutores sobre la formación universitaria"
    ]
  },
  {
    id: "naturaleza",
    categoria: "5. Dimensión de la Naturaleza",
    titulo: "La Naturaleza",
    items: [
      "Falta de conciencia ambiental entre estudiantes y personal universitario",
      "Desperdicio de recursos (agua, energía, papel) en las sedes universitarias",
      "Escasa participación en proyectos de sostenibilidad o reciclaje",
      "Débil articulación de la educación ambiental en los programas académicos",
      "Contaminación visual y auditiva en espacios universitarios",
      "Falta de campañas institucionales permanentes sobre sostenibilidad",
      "Inadecuado manejo de residuos sólidos y orgánicos",
      "Ausencia de indicadores de sostenibilidad ambiental en los planes de mejora",
      "Escaso aprovechamiento de zonas verdes con fines educativos o ecológicos",
      "Desinterés por la implementación de tecnologías limpias o energías renovables",
      "Falta de proyectos de reforestación o compensación ambiental universitaria"
    ]
  },
  {
    id: "institucion",
    categoria: "6. Dimensión de la Institución",
    titulo: "La Institución",
    items: [
      "Procesos administrativos lentos o poco digitalizados",
      "Inconsistencia en la comunicación institucional entre sedes",
      "Falta de seguimiento al cumplimiento de los planes de mejoramiento",
      "Dificultades en la actualización de datos académicos y administrativos",
      "Escasa coordinación entre dependencias académicas y administrativas",
      "Débil cultura de evaluación institucional y rendición de cuentas",
      "Limitada formación del personal administrativo en competencias digitales",
      "Poca participación de los estudiantes en procesos de planeación institucional",
      "Falta de reconocimiento a las buenas prácticas de gestión y docencia",
      "Necesidad de fortalecer los canales de comunicación interna",
      "Débil articulación entre programas académicos y políticas institucionales",
      "Inadecuado aprovechamiento del CAI como sistema integral de gestión educativa"
    ]
  },
  {
    id: "sociedad",
    categoria: "7. Dimensión de la Sociedad",
    titulo: "La Sociedad",
    items: [
      "Escasa vinculación entre la universidad y el sector productivo local",
      "Falta de impacto visible de los proyectos académicos en las comunidades regionales",
      "Limitada participación de la universidad en redes de cooperación nacional e internacional",
      "Dificultades para transferir conocimiento científico a la sociedad",
      "Baja participación en procesos de innovación social y tecnológica",
      "Escasa articulación de los proyectos de aula con problemáticas sociales reales",
      "Falta de estrategias de comunicación para divulgar el aporte institucional al desarrollo local",
      "Dificultades en la inclusión de comunidades rurales y vulnerables en proyectos académicos",
      "Desconexión entre la investigación universitaria y las necesidades territoriales",
      "Poca participación estudiantil en proyectos de responsabilidad social",
      "Falta de políticas institucionales de voluntariado y servicio social",
      "Débil promoción del pensamiento crítico frente a los desafíos globales"
    ]
  }
];
