import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import padLogo from '@/assets/pad-logo.png';
import { BookOpen, Calendar, Clock, Users, Target, FileText, Video, Download } from 'lucide-react';

export const PADMomento = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <img 
          src={padLogo} 
          alt="UDEC EFAD" 
          className="h-20 mx-auto"
        />
        <div>
          <p className="text-sm text-muted-foreground mb-2">UNIVERSIDAD DE CUNDINAMARCA</p>
          <p className="text-sm text-muted-foreground">Escuela de Formación y Aprendizaje Docente</p>
          <p className="text-sm text-muted-foreground">UCundinamarca Generación Siglo 21</p>
        </div>
        <h1 className="text-4xl font-bold text-primary">Plan de Aprendizaje Digital CAI</h1>
        <h2 className="text-2xl font-semibold">Encuentros Dialógicos</h2>
      </div>

      {/* Experiencia 1 */}
      <Card className="border-2">
        <CardHeader className="bg-primary/5">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle className="text-2xl">Experiencia 1: Ruta de la innovación: Del diagnóstico al prototipo</CardTitle>
          </div>
          <CardDescription className="text-base">
            Elaborar un prototipo de solución a un problema institucional a partir de su planteamiento y análisis crítico, orientado al fortalecimiento de la Universidad de Cundinamarca.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-3">
            <p className="text-sm leading-relaxed">
              Esta experiencia inmersiva integra todo el ciclo de fundamentación del creador de oportunidades. Se concibe como una ruta de tres etapas progresivas:
            </p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li className="text-sm"><strong>Reconocimiento:</strong> Se inicia con un diagnóstico situacional para identificar el nivel de competencia en herramientas de análisis.</li>
              <li className="text-sm"><strong>Apropiación:</strong> Se transita hacia la fundamentación teórica mediante la revisión de recursos especializados.</li>
              <li className="text-sm"><strong>Creación:</strong> Culmina con la aplicación práctica de estos saberes en el diseño de un prototipo de solución. El objetivo es empoderar al participante para que analice críticamente los problemas institucionales desde las dimensiones del MEDIT y proponga soluciones innovadoras y viables.</li>
            </ol>
          </div>

          <div className="flex items-center gap-2 text-sm font-semibold">
            <Calendar className="h-4 w-4" />
            <span>Duración Total: 3 Semanas (Semanas 2, 3 y 4 de Febrero)</span>
          </div>

          <Separator />

          {/* Actividad 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">Actividad 1: Diagnóstico</h3>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <div>
                <p className="text-sm font-semibold mb-2">Descripción:</p>
                <p className="text-sm">Fase de arranque donde el creador de oportunidades se enfrenta a un Test de Situación Aleatoria. Se le asigna un caso problemático de la Universidad y debe responder 5 interrogantes estratégicos aplicando las herramientas: Pareto, DOFA, Ishikawa, Brainstorming y Diagrama de Afinidad.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Badge variant="secondary" className="mb-2">
                    <Clock className="h-3 w-3 mr-1" />
                    Inicio: 2da semana de febrero
                  </Badge>
                  <p className="text-xs text-muted-foreground">Duración: 1 semana</p>
                </div>
                <div>
                  <Badge variant="outline" className="mb-2">
                    <Users className="h-3 w-3 mr-1" />
                    Trabajo estudiante
                  </Badge>
                  <p className="text-xs">Analiza el caso asignado, resuelve la prueba de 5 preguntas y revisa los micro-contenidos de refuerzo sugeridos según su desempeño.</p>
                </div>
              </div>
              
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Trabajo gestor del conocimiento:</p>
                <p className="text-xs text-muted-foreground">Monitorea los resultados del test diagnóstico para identificar las necesidades de refuerzo grupal y orientar la siguiente fase.</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Actividad 2 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">Actividad 2: Apropiación del conocimiento</h3>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <div>
                <p className="text-sm font-semibold mb-2">Descripción:</p>
                <p className="text-sm">Apropiación del conocimiento teórico. El participante accede a un repositorio curado de material académico (videos, papers, guías) que explican en detalle la metodología.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Badge variant="secondary" className="mb-2">
                    <Clock className="h-3 w-3 mr-1" />
                    Inicio: 3ra semana de febrero
                  </Badge>
                  <p className="text-xs text-muted-foreground">Duración: 1 semana</p>
                </div>
                <div>
                  <Badge variant="outline" className="mb-2">
                    <Users className="h-3 w-3 mr-1" />
                    Trabajo estudiante
                  </Badge>
                  <p className="text-xs">Realiza una revisión crítica y exhaustiva del material bibliográfico. Analiza los ejemplos.</p>
                </div>
              </div>
              
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Trabajo gestor del conocimiento:</p>
                <p className="text-xs text-muted-foreground">Selecciona y organiza el material académico, asegurando su calidad y pertinencia con el contenido.</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Actividad 3 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">Actividad 3: Prototipado multidimensional</h3>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <div>
                <p className="text-sm font-semibold mb-2">Descripción:</p>
                <p className="text-sm">Selecciona una de las 7 dimensiones del MEDIT (Persona, Aula, Cultura, Familia, Naturaleza, Institución, Sociedad), identifica un problema real en ella y aplica secuencialmente las 5 herramientas estudiadas para construir un prototipo de análisis que ofrezca una visión holística y una ruta de solución.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Badge variant="secondary" className="mb-2">
                    <Clock className="h-3 w-3 mr-1" />
                    Inicio: 3ra semana de febrero
                  </Badge>
                  <p className="text-xs text-muted-foreground">Duración: 1 semana</p>
                </div>
                <div>
                  <Badge variant="outline" className="mb-2">
                    <Users className="h-3 w-3 mr-1" />
                    Trabajo estudiante
                  </Badge>
                  <p className="text-xs">Aplica las 5 herramientas estudiadas para construir un prototipo de análisis.</p>
                </div>
              </div>
              
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Trabajo gestor del conocimiento:</p>
                <p className="text-xs text-muted-foreground">Valida la coherencia entre el problema, la dimensión MEDIT y la aplicación técnica de las herramientas.</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Recursos Educativos */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">Recursos Educativos</h3>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">Documentos:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4 text-xs">
                  <li>Instituto Para el Aseguramiento de la Calidad, A.C. (s.f.). Diagramas Ishikawa: Procedimiento para elaborar Diagramas Ishikawa clasificando en grupos predeterminados. ipac.</li>
                  <li>García López, T., & Cano Flores, M. (s.f.). El FODA: una técnica para el análisis de problemas en el contexto de la planeación en las organizaciones. IIESCA, 84–98.</li>
                  <li>Chávez, L. F., et al. (2024). Diagrama de Pareto. Perspectiva de la Asignatura de Control de la Calidad. Boletín de Innovación, Logística y Operaciones (BILO), 6(1), 51–56.</li>
                  <li>Alange, S. (2013). El Método de afinidad-Interrelación MAI: Una herramienta para resolver problemas de análisis de datos cualitativos.</li>
                  <li>Delgado, C. (2022). Estrategias didácticas para fortalecer el pensamiento creativo en el aula. Un estudio meta-analítico. Revista Innova Educación, 4(1).</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Videos:
                </h4>
                <ul className="space-y-1 ml-4 text-xs">
                  <li>• <a href="https://www.youtube.com/watch?v=_6vz0-Hx9cE" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOFA</a></li>
                  <li>• <a href="https://www.youtube.com/watch?v=obtZtbm45a8" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">BRAIN STORMING</a></li>
                  <li>• <a href="https://www.youtube.com/watch?v=0R9894qxiJY" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DIAGRAMA DE AFINIDAD</a></li>
                  <li>• <a href="https://www.youtube.com/watch?v=SORXxuL30sE" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DIAGRAMA DE ISHIKAWA</a></li>
                  <li>• <a href="https://www.youtube.com/watch?v=vd7QVKpW27Q" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">PARETO</a></li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Experiencia 2 */}
      <Card className="border-2">
        <CardHeader className="bg-primary/5">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle className="text-2xl">Experiencia 2: Encuentros dialógicos: Formulación y compromiso</CardTitle>
          </div>
          <CardDescription className="text-base">
            Formular los problemas institucionales, a partir de los hallazgos obtenidos en los encuentros dialógicos y formativos con el compromiso de los participantes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-3">
            <p className="text-sm leading-relaxed">
              Esta experiencia longitudinal se centra en la formalización de acuerdos cocreativos. Se desarrolla en dos momentos clave de la vigencia (Marzo y Septiembre) donde la comunidad de creadores de oportunidades se reúne para dialogar y concertar. Aquí, los prototipos y diagnósticos previos se elevan a nivel de "Plan de Mejoramiento Institucional". Se busca institucionalizar la cultura del diálogo como mecanismo para definir la ruta de trabajo, asegurando que cada problema identificado tenga un doliente, una estrategia y un indicador claro.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm font-semibold">
            <Calendar className="h-4 w-4" />
            <span>Duración Total: 2 Semanas distribuidas en el año (1ra semana Marzo y 1ra semana Septiembre)</span>
          </div>

          <Separator />

          {/* Actividad 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">Actividad 1: Encuentro dialógico I - Evaluación Inicial</h3>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <div>
                <p className="text-sm font-semibold mb-2">Descripción:</p>
                <p className="text-sm">Espacio de concertación estratégica. Modalidad: Presencial (según programación institucional). Se establecen los compromisos del primer semestre a través del diálogo constructivo.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Badge variant="secondary" className="mb-2">
                    <Clock className="h-3 w-3 mr-1" />
                    Inicio: 1ra semana de marzo
                  </Badge>
                  <p className="text-xs text-muted-foreground">Duración: 1 semana</p>
                </div>
                <div>
                  <Badge variant="outline" className="mb-2">
                    <Users className="h-3 w-3 mr-1" />
                    Trabajo estudiante
                  </Badge>
                  <p className="text-xs">Como creador de oportunidades, participa activamente en las mesas de trabajo, expone sus análisis y suscribe las actas de compromiso.</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs"><strong>Dinámica:</strong> Mesas de trabajo por programas.</p>
                <p className="text-xs"><strong>Recursos:</strong> Formato de Acta de Compromiso Digital / Herramientas de videoconferencia o auditorios.</p>
                <p className="text-xs"><strong>Producto:</strong> Acta y Plan de Mejoramiento (Fase 1).</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Actividad 2 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">Actividad 2: Encuentro dialógico III - Reformulación</h3>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <div>
                <p className="text-sm font-semibold mb-2">Descripción:</p>
                <p className="text-sm">Espacio de re-evaluación para ajustar el rumbo de vigencia de los problemas emergentes, y ajustes cara al cierre del año. Modalidad: Virtual sincrónico. Se revisan los avances y se recalibran las metas.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Badge variant="secondary" className="mb-2">
                    <Clock className="h-3 w-3 mr-1" />
                    Inicio: 1ra semana de septiembre
                  </Badge>
                  <p className="text-xs text-muted-foreground">Duración: 1 semana</p>
                </div>
                <div>
                  <Badge variant="outline" className="mb-2">
                    <Users className="h-3 w-3 mr-1" />
                    Trabajo estudiante
                  </Badge>
                  <p className="text-xs">Revisa la vigencia de los problemas emergentes y propone ajustes.</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs"><strong>Dinámica:</strong> Taller de ajuste estratégico.</p>
                <p className="text-xs"><strong>Recursos:</strong> Repositorio de hallazgos del primer semestre / Sala virtual o aula física.</p>
                <p className="text-xs"><strong>Producto:</strong> Acta y Plan de Mejoramiento Ajustado (Fase 2).</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Experiencia 3 */}
      <Card className="border-2">
        <CardHeader className="bg-primary/5">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle className="text-2xl">Experiencia 3: Mejora continua: Seguimiento y evaluación</CardTitle>
          </div>
          <CardDescription className="text-base">
            Aplicar el seguimiento continuo a los planes y estrategias de mejoramiento institucional mediante la identificación de mejoras concretas en los programas académicos de la Universidad de Cundinamarca.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-3">
            <p className="text-sm leading-relaxed">
              La experiencia final cierra los ciclos de gestión mediante la verificación rigurosa de resultados. Ocurre en mayo y noviembre, enfocándose en la medición de impacto. Los creadores de oportunidades asumen el rol de auditores de calidad, recolectando evidencias y evaluando si las soluciones implementadas efectivamente fortalecieron a la Universidad. Es el momento de la verdad donde se valida la eficacia del modelo dialógico y se consolidan las lecciones aprendidas, haciendo uso de entornos presenciales o virtuales para la socialización de resultados.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm font-semibold">
            <Calendar className="h-4 w-4" />
            <span>Duración Total: 2 Semanas distribuidas en el año (1ra semana Mayo y 1ra semana Noviembre)</span>
          </div>

          <Separator />

          {/* Actividad 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">Actividad 1: Encuentro dialógico II - Primer corte evaluativo</h3>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <div>
                <p className="text-sm font-semibold mb-2">Descripción:</p>
                <p className="text-sm">Evaluación intermedia del avance de los planes de mejoramiento. Modalidad: Presencial o Virtual. Se presentan los indicadores de gestión del primer periodo.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Badge variant="secondary" className="mb-2">
                    <Clock className="h-3 w-3 mr-1" />
                    Inicio: 1ra semana de mayo
                  </Badge>
                  <p className="text-xs text-muted-foreground">Duración: 1 semana</p>
                </div>
                <div>
                  <Badge variant="outline" className="mb-2">
                    <Users className="h-3 w-3 mr-1" />
                    Trabajo estudiante
                  </Badge>
                  <p className="text-xs">El creador de oportunidades ejecuta (digitales o físicas) y reporta el porcentaje de gestión o reuniones presenciales de seguimiento.</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs"><strong>Dinámica:</strong> Auditoría de pares o revisión de tableros de control.</p>
                <p className="text-xs"><strong>Recursos:</strong> Matriz de seguimiento de indicadores.</p>
                <p className="text-xs"><strong>Producto:</strong> Evaluación del Plan de Mejoramiento (Corte 1).</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Actividad 2 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">Actividad 2: Encuentro dialógico IV - Evaluación final y cierre</h3>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <div>
                <p className="text-sm font-semibold mb-2">Descripción:</p>
                <p className="text-sm">Balance general del año académico y medición del impacto final. Modalidad: Presencial o Virtual. Socialización de logros y lecciones aprendidas.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Badge variant="secondary" className="mb-2">
                    <Clock className="h-3 w-3 mr-1" />
                    Inicio: 1ra semana de noviembre
                  </Badge>
                  <p className="text-xs text-muted-foreground">Duración: 1 semana</p>
                </div>
                <div>
                  <Badge variant="outline" className="mb-2">
                    <Users className="h-3 w-3 mr-1" />
                    Trabajo estudiante
                  </Badge>
                  <p className="text-xs">Consolida el informe final de gestión, analizando impactos cualitativos y cuantitativos de su intervención como creador de oportunidades y lo sustenta en el encuentro de cierre.</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs"><strong>Dinámica:</strong> Socialización de logros e impactos.</p>
                <p className="text-xs"><strong>Recursos:</strong> Informe de Gestión del Conocimiento.</p>
                <p className="text-xs"><strong>Producto:</strong> Evaluación Final del Plan de Mejoramiento.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Download Button */}
      <div className="flex justify-center mt-8">
        <a 
          href="/documents/PAD_CAI_Encuentros_Dialogicos.pdf" 
          download="PAD_CAI_Encuentros_Dialogicos.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button 
            size="lg"
            className="gap-2"
          >
            <Download className="h-5 w-5" />
            Descargar Documento Completo PAD
          </Button>
        </a>
      </div>
    </div>
  );
};
