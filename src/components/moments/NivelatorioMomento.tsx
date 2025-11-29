import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { BookOpen, Video, FileCheck, Download, Key } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { calculateCaseStudyScore } from '@/utils/evaluation';
import { ReporteCasoEstudio } from '@/components/evaluation/ReporteCasoEstudio';
import dofaImage from '@/assets/dofa-diagram.webp';
import brainstormingImage from '@/assets/brainstorming-diagram.png';
import affinityImage from '@/assets/affinity-diagram.png';
import ishikawaImage from '@/assets/ishikawa-diagram.jpeg';
import paretoImage from '@/assets/pareto-diagram.png';
import { CasoEstudioEvaluacion } from '@/components/evaluation/CasoEstudioEvaluacion';

interface NivelatorioMomentoProps {
  onComplete?: () => void;
}

export const NivelatorioMomento = ({ onComplete }: NivelatorioMomentoProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showVideos, setShowVideos] = useState(false);
  const [showMaterial, setShowMaterial] = useState(false);
  const [showEvaluacion, setShowEvaluacion] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [completeCode, setCompleteCode] = useState('');
  const [latestEvaluation, setLatestEvaluation] = useState<any>(null);
  const [showReport, setShowReport] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);

  // Load latest evaluation on mount
  useEffect(() => {
    const loadLatestEvaluation = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('student_evaluations')
        .select('*')
        .eq('user_id', user.id)
        .eq('momento', 'nivelatorio')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (!error && data) {
        setLatestEvaluation(data);
      }
    };
    
    loadLatestEvaluation();
  }, [user]);

  const materials = [
    {
      id: 'arbolProblemas',
      title: '🌳 Árbol de Problemas',
      description: 'Herramienta gráfica para análisis de causas y efectos',
      image: null,
      content: [
        '💡 Concepto: El árbol de problemas es una herramienta de análisis que organiza la información de un problema central, desglosando sus causas (raíces) y sus efectos o consecuencias (ramas).',
        '🔧 Uso y desarrollo: Esta herramienta visual permite identificar las relaciones causa-efecto de una situación problemática. El problema central se coloca en el tronco, las causas que lo originan forman las raíces, y los efectos o consecuencias constituyen las ramas.',
        '✅ Ventajas: Facilita la comprensión integral de un problema. Permite identificar causas raíz y priorizar intervenciones. Visual y fácil de comunicar.',
        '⚠️ Limitaciones: Requiere tiempo para un análisis completo. Puede simplificar problemas muy complejos. La calidad depende de la participación del grupo.',
        '📌 Ejemplo: Análisis de bajo rendimiento académico identificando causas (falta de hábitos de estudio, problemas familiares) y efectos (deserción, baja autoestima).'
      ],
      pdfUrl: null
    },
    {
      id: 'dofa',
      title: '🧭 Matriz DOFA / FODA (SWOT)',
      description: 'Análisis estratégico de Debilidades, Oportunidades, Fortalezas y Amenazas',
      image: dofaImage,
      content: [
        '📖 Referencia: Talancón, H. P. (2007). La matriz FODA: alternativa de diagnóstico y planeación estratégica.',
        '💡 Concepto: El análisis FODA identifica Fortalezas, Oportunidades, Debilidades y Amenazas de una organización o situación, brindando una visión integral para la toma de decisiones estratégicas.',
        '🔧 Uso y desarrollo: Talancón explica su evolución desde el método SOFT de los años 60. Se usa ampliamente en planificación organizacional, educativa y social para evaluar entornos internos y externos.',
        '✅ Ventajas: Permite diagnósticos claros y decisiones estratégicas. Sencillo y adaptable a distintos contextos.',
        '⚠️ Limitaciones: No cuantifica la magnitud de los factores. Puede depender del criterio subjetivo de los participantes.',
        '📌 Ejemplo: Evaluación de una institución educativa para definir estrategias de mejora.'
      ],
      pdfUrl: '/documents/DOFA.pdf'
    },
    {
      id: 'brainstorming',
      title: '🧠 Brainstorming (Lluvia de Ideas)',
      description: 'Técnica de generación creativa de ideas en grupo',
      image: brainstormingImage,
      content: [
        '📖 Referencia: Delgado, C. (2022). Estrategias didácticas para fortalecer el pensamiento creativo en estudiantes de educación básica.',
        '💡 Concepto: El brainstorming es una técnica grupal que busca generar la mayor cantidad posible de ideas sobre un problema, suspendiendo el juicio crítico durante la fase inicial.',
        '🔧 Uso y desarrollo: Delgado resalta su valor pedagógico como herramienta para fomentar la creatividad y la participación activa. Se originó en los años 40 con Alex Osborn, y su aplicación se ha ampliado en entornos educativos, empresariales y de innovación.',
        '✅ Ventajas: Estimula la creatividad colectiva. Promueve la colaboración y el pensamiento divergente.',
        '⚠️ Limitaciones: Puede verse afectado por la presión social o por participantes dominantes. Requiere moderación adecuada.',
        '📌 Ejemplo: Generación de ideas para proyectos escolares o soluciones innovadoras en grupos de trabajo.'
      ],
      pdfUrl: '/documents/Brainstorming.pdf'
    },
    {
      id: 'affinity',
      title: '🧩 Diagrama de Afinidad (Método KJ)',
      description: 'Organización y agrupación de ideas relacionadas',
      image: affinityImage,
      content: [
        '📖 Referencia: García, M., & Carrero de Blanco, A. (2008). Aplicación del diagrama de afinidad para plantear problemas ambientales.',
        '💡 Concepto: El diagrama de afinidad agrupa ideas o datos cualitativos en categorías basadas en su relación natural, ayudando a clarificar temas complejos.',
        '🔧 Uso y desarrollo: Originado por Jiro Kawakita (método KJ), este enfoque se utiliza para organizar información de manera visual. García y Carrero lo aplican a problemas ambientales, mostrando su utilidad en la estructuración participativa de causas y efectos.',
        '✅ Ventajas: Permite visualizar patrones ocultos en datos cualitativos. Facilita la colaboración interdisciplinaria.',
        '⚠️ Limitaciones: Requiere consenso para agrupar datos. Puede ser subjetivo si no se guía correctamente.',
        '📌 Ejemplo: Clasificación de problemas ambientales por tipo de causa o impacto.'
      ],
      pdfUrl: '/documents/Affinity.pdf'
    },
    {
      id: 'ishikawa',
      title: '🪶 Diagrama de Ishikawa (Causa-Efecto)',
      description: 'Análisis causa-efecto para identificar raíces de problemas',
      image: ishikawaImage,
      content: [
        '📖 Referencia: Bermúdez, E. R. (2010). El uso del diagrama causa-efecto en el análisis de casos.',
        '💡 Concepto: También conocido como "espina de pescado", este diagrama identifica y organiza las causas potenciales de un problema en categorías (métodos, maquinaria, mano de obra, materiales, medio ambiente, medición).',
        '🔧 Uso y desarrollo: Bermúdez explica cómo la herramienta, desarrollada por Kaoru Ishikawa en los años 50, ayuda a encontrar causas raíz dentro de la gestión de calidad o el análisis de procesos.',
        '✅ Ventajas: Clarifica relaciones causa-efecto. Sirve de base para la mejora continua.',
        '⚠️ Limitaciones: Puede omitir factores no evidentes si el grupo carece de experiencia.',
        '📌 Ejemplo: Análisis de causas de retrasos en una línea de producción o en la entrega de servicios.'
      ],
      pdfUrl: '/documents/Ishikawa.pdf'
    },
    {
      id: 'pareto',
      title: '📊 Diagrama de Pareto (Principio 80/20)',
      description: 'Principio 80/20 para priorizar problemas o causas',
      image: paretoImage,
      content: [
        '📖 Referencia: Borjas, C. M. B. (2005). La ley de Pareto aplicada a la fiabilidad.',
        '💡 Concepto: El principio de Pareto establece que un pequeño número de causas genera la mayoría de los efectos (80/20). El diagrama correspondiente permite priorizar acciones sobre las causas más influyentes.',
        '🔧 Uso y desarrollo: Borjas describe su aplicación en ingeniería de fiabilidad para detectar los fallos más recurrentes. Es útil en control de calidad, gestión del tiempo y mejora de procesos.',
        '✅ Ventajas: Enfoca esfuerzos en los factores de mayor impacto. Se integra fácilmente con otras herramientas de calidad.',
        '⚠️ Limitaciones: No muestra relaciones causales. Depende de datos cuantitativos precisos.',
        '📌 Ejemplo: Priorización de defectos en una línea de producción o análisis de causas frecuentes de fallas en sistemas técnicos.'
      ],
      pdfUrl: '/documents/Pareto.pdf'
    }
  ];

  const handleMarkComplete = async () => {
    if (completeCode.trim().toUpperCase() !== 'MEDIT') {
      toast({
        title: "Código incorrecto",
        description: "Por favor, verifica el código e intenta nuevamente",
        variant: "destructive",
      });
      return;
    }

    if (!latestEvaluation) {
      toast({
        title: "Error",
        description: "No se encontró ninguna evaluación para generar el reporte",
        variant: "destructive",
      });
      return;
    }

    // Calculate score with current progress
    const evaluacionData = {
      problematica: latestEvaluation.problematica,
      dimension: latestEvaluation.dimension,
      arbolProblemas: latestEvaluation.arbol_problemas_data,
      brainstorming: latestEvaluation.brainstorming_data,
      affinity: latestEvaluation.affinity_data,
      ishikawa: latestEvaluation.ishikawa_data,
      dofa: latestEvaluation.dofa_data,
      pareto: latestEvaluation.pareto_data
    };

    const result = calculateCaseStudyScore(evaluacionData);
    setEvaluationResult(result);
    
    // Update evaluation if score changed
    if (result.automaticScore !== latestEvaluation.automatic_score) {
      await supabase
        .from('student_evaluations')
        .update({
          automatic_score: result.automaticScore,
          max_score: result.maxScore,
          passed: result.passed
        })
        .eq('id', latestEvaluation.id);
    }

    setShowCompleteDialog(false);
    setCompleteCode('');
    setShowReport(true);

    toast({
      title: "Reporte generado",
      description: "Tu evaluación ha sido procesada. Revisa los resultados y descarga el PDF.",
    });
  };

  const videos = [
    {
      id: 'eO7sNmZ9Ut8',
      title: 'ÁRBOL DE PROBLEMAS',
      description: 'Herramienta gráfica para análisis de causas y efectos'
    },
    {
      id: '_6vz0-Hx9cE',
      title: 'DOFA',
      description: 'Análisis DOFA: Debilidades, Oportunidades, Fortalezas y Amenazas'
    },
    {
      id: 'obtZtbm45a8',
      title: 'Brainstorming',
      description: 'Técnicas de lluvia de ideas para solución de problemas'
    },
    {
      id: '0R9894qxiJY',
      title: 'Diagrama de Afinidad',
      description: 'Organización y agrupación de ideas relacionadas'
    },
    {
      id: 'SORXxuL30sE',
      title: 'Diagrama de Ishikawa',
      description: 'Diagrama causa-efecto para análisis de problemas'
    },
    {
      id: 'vd7QVKpW27Q',
      title: 'Pareto',
      description: 'Principio 80/20 y análisis de Pareto'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary border-b-2 border-primary pb-3 mb-6">
          MOMENTO 2 - NIVELATORIO
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setShowMaterial(!showMaterial)}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">1. MATERIAL DE ESTUDIO</CardTitle>
                <CardDescription>Recursos teóricos y guías ({materials.length} herramientas)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Haz clic para {showMaterial ? 'ocultar' : 'ver'} el material de estudio sobre cada herramienta de calidad.
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setShowVideos(!showVideos)}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Video className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">2. VIDEOS EXPLICATIVOS</CardTitle>
                <CardDescription>Contenido audiovisual ({videos.length} videos)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Haz clic para {showVideos ? 'ocultar' : 'ver'} los videos explicativos sobre cada herramienta de calidad.
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setShowEvaluacion(!showEvaluacion)}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">3. EVALUACIÓN - CASO DE ESTUDIO</CardTitle>
                <CardDescription>Aplica las 6 herramientas a un caso real</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Haz clic para {showEvaluacion ? 'ocultar' : 'iniciar'} la evaluación del caso de estudio.
            </p>
          </CardContent>
        </Card>
      </div>

      {showMaterial && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-primary">Material de Estudio</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {materials.map((material) => (
              <Card key={material.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{material.title}</CardTitle>
                  <CardDescription>{material.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {material.image && (
                      <div className="mb-4">
                        <img 
                          src={material.image} 
                          alt={material.title}
                          className="w-full max-w-md mx-auto rounded-lg"
                        />
                      </div>
                    )}
                    {material.content.map((paragraph, index) => (
                      <p key={index} className="text-sm text-muted-foreground leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                    {material.pdfUrl && (
                      <div className="pt-4">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => window.open(material.pdfUrl, '_blank')}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Descargar Material Completo (PDF)
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-xl">Tabla Comparativa de Herramientas</CardTitle>
              <CardDescription>Comparación de las características principales de cada herramienta</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Herramienta</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Enfoque</TableHead>
                    <TableHead>Naturaleza de datos</TableHead>
                    <TableHead>Principal aporte</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Árbol de Problemas</TableCell>
                    <TableCell>Estructural</TableCell>
                    <TableCell>Análisis causa-efecto global</TableCell>
                    <TableCell>Cualitativa</TableCell>
                    <TableCell>Visualiza estructura completa del problema</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Brainstorming</TableCell>
                    <TableCell>Creativa</TableCell>
                    <TableCell>Generación de ideas</TableCell>
                    <TableCell>Cualitativa</TableCell>
                    <TableCell>Estimula creatividad y participación</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Diagrama de afinidad</TableCell>
                    <TableCell>Organizativa</TableCell>
                    <TableCell>Agrupar ideas relacionadas</TableCell>
                    <TableCell>Cualitativa</TableCell>
                    <TableCell>Estructura información compleja</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Ishikawa</TableCell>
                    <TableCell>Analítica</TableCell>
                    <TableCell>Identificar causas raíz</TableCell>
                    <TableCell>Cualitativa-cuantitativa</TableCell>
                    <TableCell>Facilita el análisis sistemático</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">DOFA</TableCell>
                    <TableCell>Estratégica</TableCell>
                    <TableCell>Diagnóstico interno/externo</TableCell>
                    <TableCell>Cualitativa</TableCell>
                    <TableCell>Soporte a la toma de decisiones</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Pareto</TableCell>
                    <TableCell>Cuantitativa</TableCell>
                    <TableCell>Priorización de causas</TableCell>
                    <TableCell>Cuantitativa</TableCell>
                    <TableCell>Permite concentrar recursos en lo esencial</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {showVideos && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-primary">Videos Explicativos</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {videos.map((video) => (
              <Card key={video.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{video.title}</CardTitle>
                  <CardDescription>{video.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <AspectRatio ratio={16 / 9}>
                    <iframe
                      src={`https://www.youtube.com/embed/${video.id}`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full rounded-md"
                    />
                  </AspectRatio>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {showEvaluacion && !showReport && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-primary">Evaluación del Caso de Estudio</h2>
          <CasoEstudioEvaluacion onComplete={(data) => {
            console.log('Evaluación completada:', data);
            // Reload latest evaluation
            const loadEval = async () => {
              if (!user) return;
              const { data: evalData } = await supabase
                .from('student_evaluations')
                .select('*')
                .eq('user_id', user.id)
                .eq('momento', 'nivelatorio')
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();
              
              if (evalData) {
                setLatestEvaluation(evalData);
              }
            };
            loadEval();
          }} />
        </div>
      )}

      {showReport && evaluationResult && latestEvaluation && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-primary">Reporte de Evaluación</h2>
          <ReporteCasoEstudio
            evaluacionData={{
              problematica: latestEvaluation.problematica,
              dimension: latestEvaluation.dimension,
              arbolProblemas: latestEvaluation.arbol_problemas_data,
              brainstorming: latestEvaluation.brainstorming_data,
              affinity: latestEvaluation.affinity_data,
              ishikawa: latestEvaluation.ishikawa_data,
              dofa: latestEvaluation.dofa_data,
              pareto: latestEvaluation.pareto_data
            }}
            result={evaluationResult}
            onClose={() => {
              setShowReport(false);
              if (onComplete && evaluationResult.passed) {
                onComplete();
              }
            }}
          />
        </div>
      )}

      {onComplete && !showReport && (
        <div className="flex justify-end">
          <Button 
            onClick={() => setShowCompleteDialog(true)} 
            size="lg"
            disabled={!latestEvaluation}
          >
            Marcar como Completado
          </Button>
        </div>
      )}

      {/* Complete Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Confirmar Finalización
            </DialogTitle>
            <DialogDescription>
              Para marcar el momento nivelatorio como completado y generar tu reporte, ingresa el código de acceso.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {!latestEvaluation ? (
              <p className="text-sm text-destructive">
                No se encontró ninguna evaluación iniciada. Por favor, inicia la evaluación antes de marcar como completado.
              </p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Se generará un reporte con tu progreso actual en las herramientas que hayas completado.
                </p>
                <div className="space-y-2">
                  <label htmlFor="complete-code" className="text-sm font-medium">
                    Código de acceso
                  </label>
                  <Input
                    id="complete-code"
                    type="text"
                    placeholder="Ingresa el código"
                    value={completeCode}
                    onChange={(e) => setCompleteCode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleMarkComplete();
                      }
                    }}
                    className="uppercase"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCompleteDialog(false);
              setCompleteCode('');
            }}>
              Cancelar
            </Button>
            <Button 
              onClick={handleMarkComplete}
              disabled={!latestEvaluation}
            >
              Generar Reporte
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
