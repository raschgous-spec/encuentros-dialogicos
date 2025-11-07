export interface Problematica {
  id: string;
  categoria: string;
  titulo: string;
  items: string[];
}

export const problematicas: Problematica[] = [
  {
    id: "academica",
    categoria: "1. Dimensión Académica y Pedagógica",
    titulo: "Académica y Pedagógica",
    items: [
      "Limitado uso de metodologías activas en los entornos digitales de aprendizaje",
      "Baja participación estudiantil en espacios de construcción académica y reflexión crítica",
      "Desarticulación entre contenidos curriculares y contextos locales o regionales",
      "Escasa integración de proyectos interdisciplinarios entre programas académicos",
      "Dificultades en la implementación de estrategias de aprendizaje autónomo",
      "Necesidad de fortalecer la mediación pedagógica en plataformas virtuales",
      "Insuficiente seguimiento a los procesos de evaluación formativa",
      "Desconocimiento en el uso de herramientas digitales para la gestión del conocimiento",
      "Inconsistencia en la planeación de experiencias de aprendizaje basadas en problemas reales",
      "Limitado acompañamiento académico en los primeros semestres de formación",
      "Escasez de espacios de retroalimentación docente-estudiante mediante recursos digitales",
      "Falta de estrategias institucionales para la nivelación académica inicial",
      "Baja participación del estudiantado en procesos de autoevaluación de programas",
      "Escaso uso de Recursos Educativos Abiertos (REA) para fortalecer la autonomía del aprendizaje",
      "Necesidad de actualizar materiales didácticos a entornos digitales accesibles e inclusivos"
    ]
  },
  {
    id: "tecnologica",
    categoria: "2. Dimensión Tecnológica y de Transformación Digital",
    titulo: "Tecnológica y Transformación Digital",
    items: [
      "Limitaciones en la conectividad o acceso a internet en algunas sedes y zonas rurales",
      "Desigualdad en la disponibilidad de equipos tecnológicos para estudiantes y docentes",
      "Dificultad en la adopción del CAI como herramienta integral de aprendizaje",
      "Escaso conocimiento del profesorado sobre plataformas de gestión educativa digital",
      "Carencia de sistemas integrados de seguimiento académico en línea",
      "Falta de interoperabilidad entre las plataformas institucionales y los sistemas de información",
      "Dificultad en el manejo de datos para la toma de decisiones académicas",
      "Ausencia de políticas institucionales claras sobre seguridad y protección de datos educativos",
      "Insuficiente capacitación docente en competencias digitales avanzadas"
    ]
  },
  {
    id: "administrativa",
    categoria: "3. Dimensión Administrativa y de Gestión Institucional",
    titulo: "Administrativa y de Gestión",
    items: [
      "Lentitud en los procesos administrativos que afectan la experiencia del estudiante",
      "Dificultad en la gestión y actualización de los trámites institucionales en línea",
      "Inconsistencia en los canales de comunicación interna entre áreas académicas y administrativas",
      "Falta de mecanismos efectivos de seguimiento a los compromisos de los planes de mejoramiento",
      "Insuficiente articulación entre la planeación académica y los recursos institucionales disponibles",
      "Desconocimiento de los procedimientos administrativos por parte del estudiantado",
      "Escasa socialización de los resultados de gestión institucional a la comunidad universitaria",
      "Necesidad de fortalecer la cultura de evaluación y rendición de cuentas digital",
      "Baja eficiencia en los procesos de archivo y trazabilidad documental",
      "Limitaciones en la gestión de recursos financieros para proyectos innovadores",
      "Falta de indicadores actualizados para medir el impacto institucional en tiempo real",
      "Necesidad de estandarizar formatos y procesos administrativos entre sedes"
    ]
  },
  {
    id: "ambiental",
    categoria: "4. Dimensión Ambiental y Sostenibilidad",
    titulo: "Ambiental y Sostenibilidad",
    items: [
      "Escasa implementación de prácticas de sostenibilidad ambiental en las sedes",
      "Consumo ineficiente de recursos naturales (energía, agua, papel)",
      "Ausencia de un sistema integral de gestión ambiental universitaria",
      "Poca participación de la comunidad académica en campañas ambientales",
      "Limitado aprovechamiento de residuos sólidos reciclables en los campus",
      "Falta de sensibilización sobre el impacto ambiental de las prácticas institucionales",
      "Escasa articulación entre los programas académicos y los proyectos ambientales locales",
      "Dificultades para incorporar la educación ambiental en todos los currículos"
    ]
  },
  {
    id: "bienestar",
    categoria: "5. Dimensión de Bienestar Universitario y Clima Institucional",
    titulo: "Bienestar y Clima Institucional",
    items: [
      "Bajo nivel de sentido de pertenencia y participación estudiantil",
      "Necesidad de fortalecer la salud mental y emocional de los estudiantes",
      "Insuficiente cobertura de programas de bienestar y acompañamiento integral",
      "Dificultad para atender la diversidad e inclusión de poblaciones vulnerables",
      "Falta de espacios de diálogo intercultural y convivencia universitaria",
      "Escasa articulación entre bienestar y programas académicos",
      "Necesidad de fortalecer la comunicación empática entre docentes y estudiantes",
      "Carencia de canales efectivos para la atención de sugerencias y conflictos"
    ]
  },
  {
    id: "proyeccion",
    categoria: "6. Dimensión de Proyección Social y Extensión",
    titulo: "Proyección Social y Extensión",
    items: [
      "Limitada articulación entre la universidad y el sector productivo regional",
      "Baja participación de los estudiantes en proyectos de impacto comunitario",
      "Falta de visibilización de los resultados de extensión y responsabilidad social",
      "Necesidad de fortalecer las alianzas con gobiernos locales y organizaciones civiles",
      "Escasa difusión digital de los logros de la proyección social",
      "Dificultad para articular proyectos interdisciplinarios con enfoque territorial",
      "Poca presencia institucional en escenarios internacionales de cooperación académica"
    ]
  },
  {
    id: "investigacion",
    categoria: "7. Dimensión de Ciencia, Innovación e Investigación",
    titulo: "Ciencia, Innovación e Investigación",
    items: [
      "Débil cultura investigativa en los primeros niveles de formación",
      "Limitadas oportunidades de participación en semilleros de investigación",
      "Escaso acompañamiento docente en la formulación de proyectos científicos",
      "Falta de herramientas digitales para la gestión y seguimiento de proyectos de investigación",
      "Baja divulgación de los resultados investigativos en medios académicos digitales",
      "Limitaciones en la financiación de proyectos de innovación educativa",
      "Dificultad en la articulación de la investigación con los problemas reales del entorno",
      "Falta de capacitación en metodologías de investigación-acción participativa",
      "Necesidad de crear repositorios institucionales más accesibles y actualizados",
      "Carencia de estrategias para fomentar la escritura académica y la publicación científica estudiantil"
    ]
  },
  {
    id: "cultural",
    categoria: "8. Dimensión Cultural, Ética y Comunitaria",
    titulo: "Cultural, Ética y Comunitaria",
    items: [
      "Disminución del sentido de comunidad y compromiso institucional",
      "Falta de espacios artísticos y culturales en los programas académicos",
      "Escasa participación en actividades de integración universitaria",
      "Dificultad para incorporar la ética y la ciudadanía digital en los procesos formativos",
      "Debilidad en los mecanismos de reconocimiento a la labor docente y estudiantil",
      "Falta de diálogo intergeneracional en la comunidad universitaria",
      "Necesidad de promover la equidad de género y el respeto por la diversidad",
      "Escaso reconocimiento institucional de las iniciativas estudiantiles y comunitarias"
    ]
  }
];
