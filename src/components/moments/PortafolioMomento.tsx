import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, FileText, CheckCircle2, Circle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateCaseStudyPDF, generateConsolidatedPlanPDF, addLogoToPDF } from '@/utils/pdfExport';
import { Separator } from '@/components/ui/separator';
import { calculateCaseStudyScore } from '@/utils/evaluation';

interface DiagnosticoResult {
  id: string;
  puntaje_promedio: number;
  nivel: string;
  fecha: string;
  respuestas_completas: any;
}

interface NivelatorioResult {
  id: string;
  automatic_score: number;
  passed: boolean;
  completed_at: string;
  dimension: string;
  problematica: string;
  coordinator_reviewed: boolean;
  coordinator_score: number | null;
  coordinator_comments: string | null;
}

interface ActaResult {
  id: string;
  momento: string;
  fecha: string;
  lugar: string;
  facultad: string;
  programa_academico: string;
}

interface ProgressStatus {
  diagnostico: boolean;
  nivelatorio: boolean;
  encuentro1: boolean;
  encuentro2: boolean;
  encuentro3: boolean;
  encuentro4: boolean;
}

export const PortafolioMomento = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [diagnostico, setDiagnostico] = useState<DiagnosticoResult | null>(null);
  const [nivelatorio, setNivelatorio] = useState<NivelatorioResult | null>(null);
  const [actas, setActas] = useState<ActaResult[]>([]);
  const [progress, setProgress] = useState<ProgressStatus>({
    diagnostico: false,
    nivelatorio: false,
    encuentro1: false,
    encuentro2: false,
    encuentro3: false,
    encuentro4: false,
  });

  useEffect(() => {
    if (!user) return;

    const fetchPortfolioData = async () => {
      try {
        setLoading(true);

        // Fetch diagnostico results
        const { data: diagData } = await supabase
          .from('evaluaciones')
          .select('id, puntaje_promedio, nivel, fecha, respuestas_completas')
          .eq('estudiante_id', user.id)
          .order('fecha', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (diagData) {
          setDiagnostico(diagData);
        }

        // Fetch nivelatorio results
        const { data: nivData } = await supabase
          .from('student_evaluations')
          .select('id, automatic_score, passed, completed_at, dimension, problematica, coordinator_reviewed, coordinator_score, coordinator_comments')
          .eq('user_id', user.id)
          .eq('momento', 'nivelatorio')
          .order('completed_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (nivData) {
          setNivelatorio(nivData);
        }

        // Fetch all actas
        const { data: actasData } = await supabase
          .from('actas_encuentro')
          .select('id, momento, fecha, lugar, facultad, programa_academico')
          .eq('estudiante_id', user.id)
          .order('momento', { ascending: true });

        if (actasData) {
          setActas(actasData);
        }

        // Fetch progress status
        const { data: progressData } = await supabase
          .from('momento_progreso')
          .select('momento, completado')
          .eq('estudiante_id', user.id);

        if (progressData) {
          const progressMap: ProgressStatus = {
            diagnostico: false,
            nivelatorio: false,
            encuentro1: false,
            encuentro2: false,
            encuentro3: false,
            encuentro4: false,
          };

          progressData.forEach((item) => {
            if (item.completado) {
              progressMap[item.momento as keyof ProgressStatus] = true;
            }
          });

          setProgress(progressMap);
        }
      } catch (error) {
        console.error('Error fetching portfolio data:', error);
        toast({
          title: 'Error',
          description: 'No se pudo cargar la información del portafolio',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, [user, toast]);

  const calculateCompletionPercentage = () => {
    const completed = Object.values(progress).filter(Boolean).length;
    const total = Object.keys(progress).length;
    return Math.round((completed / total) * 100);
  };

  const handleDownloadNivelatorio = async () => {
    if (!nivelatorio || !user) return;

    try {
      const { data: evalData } = await supabase
        .from('student_evaluations')
        .select('*')
        .eq('id', nivelatorio.id)
        .single();

      if (evalData) {
        // Build the evaluacionData object
        const evaluacionData = {
          problematica: evalData.problematica,
          dimension: evalData.dimension,
          arbolProblemas: evalData.arbol_problemas_data,
          brainstorming: evalData.brainstorming_data,
          affinity: evalData.affinity_data,
          ishikawa: evalData.ishikawa_data,
          dofa: evalData.dofa_data,
          pareto: evalData.pareto_data,
        };

        // Calculate the result
        const caseResult = calculateCaseStudyScore(evaluacionData);
        const result = {
          automaticScore: caseResult.automaticScore,
          maxScore: caseResult.maxScore,
          passed: caseResult.passed,
          breakdown: caseResult.breakdown,
        };

        // Create simple feedback
        const feedback: Record<string, string> = {};
        Object.entries(caseResult.breakdown).forEach(([tool, score]) => {
          feedback[tool] = `Puntaje obtenido: ${score}/20`;
        });

        generateCaseStudyPDF(evaluacionData, result, feedback);
        toast({
          title: 'PDF generado',
          description: 'La valoración del nivelatorio se ha descargado correctamente',
        });
      }
    } catch (error) {
      console.error('Error downloading nivelatorio:', error);
      toast({
        title: 'Error',
        description: 'No se pudo descargar la valoración',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadActa = async (momento: string) => {
    if (!user) return;

    try {
      const { data: actaData } = await supabase
        .from('actas_encuentro')
        .select('*')
        .eq('estudiante_id', user.id)
        .eq('momento', momento)
        .single();

      if (!actaData) {
        toast({
          title: 'Error',
          description: 'No se encontró el acta',
          variant: 'destructive',
        });
        return;
      }

      // Import dynamically to get the PDF generation function from the moment component
      const jsPDF = (await import('jspdf')).default;
      await import('jspdf-autotable');
      const { addLogoToPDF } = await import('@/utils/pdfExport');

      const doc = new jsPDF();
      let yPos = await addLogoToPDF(doc, 20);
      
      doc.setFontSize(16);
      doc.text('ACTA DE ENCUENTRO DIALÓGICO', doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
      yPos += 15;

      doc.setFontSize(12);
      doc.text(`Momento: ${momento.toUpperCase()}`, 20, yPos);
      yPos += 10;
      doc.text(`Fecha: ${actaData.fecha}`, 20, yPos);
      yPos += 10;
      doc.text(`Lugar: ${actaData.lugar}`, 20, yPos);
      yPos += 10;
      doc.text(`Facultad: ${actaData.facultad}`, 20, yPos);
      yPos += 10;
      doc.text(`Programa: ${actaData.programa_academico}`, 20, yPos);

      doc.save(`acta_${momento}_${new Date().toISOString().split('T')[0]}.pdf`);

      toast({
        title: 'PDF generado',
        description: 'El acta se ha descargado correctamente',
      });
    } catch (error) {
      console.error('Error downloading acta:', error);
      toast({
        title: 'Error',
        description: 'No se pudo descargar el acta',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadPlanMejoramiento = async () => {
    if (!user || !nivelatorio) return;

    try {
      // Build problematica object
      const problematicaData = {
        problematica: nivelatorio.problematica,
        dimension: nivelatorio.dimension,
        tipo: nivelatorio.dimension.includes(' - ') ? 'translocal' : 'dimension',
        unidad_regional: undefined,
        facultad: undefined,
        programa_academico: undefined,
      };

      await generateConsolidatedPlanPDF(user.id, problematicaData);
      toast({
        title: 'PDF generado',
        description: 'El plan de mejoramiento consolidado se ha descargado correctamente',
      });
    } catch (error) {
      console.error('Error downloading plan:', error);
      toast({
        title: 'Error',
        description: 'No se pudo descargar el plan de mejoramiento',
        variant: 'destructive',
      });
    }
  };

  const momentoLabels: Record<string, string> = {
    diagnostico: 'Momento 1 - Diagnóstico',
    nivelatorio: 'Momento 2 - Nivelatorio',
    encuentro1: 'Momento 3 - Encuentro 1',
    encuentro2: 'Momento 4 - Encuentro 2',
    encuentro3: 'Momento 5 - Encuentro 3',
    encuentro4: 'Momento 6 - Encuentro 4',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">Cargando portafolio...</p>
      </div>
    );
  }

  const completionPercentage = calculateCompletionPercentage();

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Avance General</CardTitle>
          <CardDescription>Tu progreso en los encuentros dialógicos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progreso completado</span>
              <span className="font-bold">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(progress).map(([momento, completed]) => (
              <div key={momento} className="flex items-center gap-2">
                {completed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
                <span className="text-sm">{momentoLabels[momento]}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Diagnostico Results */}
      {diagnostico && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Valoración Diagnóstico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Puntaje Promedio</p>
                <p className="text-2xl font-bold">{diagnostico.puntaje_promedio?.toFixed(1) || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nivel</p>
                <Badge variant="secondary" className="text-sm">{diagnostico.nivel || 'N/A'}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fecha</p>
                <p className="text-sm">{new Date(diagnostico.fecha).toLocaleDateString('es-CO')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nivelatorio Results */}
      {nivelatorio && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Valoración Nivelatorio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Puntaje Automático</p>
                <p className="text-2xl font-bold">{nivelatorio.automatic_score}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <Badge variant={nivelatorio.passed ? 'default' : 'destructive'}>
                  {nivelatorio.passed ? 'Aprobado' : 'No Aprobado'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fecha</p>
                <p className="text-sm">{new Date(nivelatorio.completed_at).toLocaleDateString('es-CO')}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Dimensión</p>
              <p className="text-sm font-medium">{nivelatorio.dimension}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Problemática</p>
              <p className="text-sm font-medium">{nivelatorio.problematica}</p>
            </div>
            
            {nivelatorio.coordinator_reviewed && (
              <>
                <Separator />
                <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold">Retroalimentación del Coordinador</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Puntaje del Coordinador</p>
                      <p className="text-2xl font-bold">{nivelatorio.coordinator_score || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Estado de Revisión</p>
                      <Badge variant="secondary">Revisado</Badge>
                    </div>
                  </div>
                  {nivelatorio.coordinator_comments && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Comentarios</p>
                      <p className="text-sm">{nivelatorio.coordinator_comments}</p>
                    </div>
                  )}
                </div>
              </>
            )}
            
            <Button onClick={handleDownloadNivelatorio} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Descargar Valoración Nivelatorio
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Actas */}
      {actas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Actas de Encuentro
            </CardTitle>
            <CardDescription>
              Actas generadas en los encuentros dialógicos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {actas.map((acta) => (
                <div
                  key={acta.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{momentoLabels[acta.momento]}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(acta.fecha).toLocaleDateString('es-CO')} - {acta.lugar}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleDownloadActa(acta.momento)}
                    variant="ghost"
                    size="sm"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan de Mejoramiento */}
      {(progress.encuentro1 || progress.encuentro2 || progress.encuentro3 || progress.encuentro4) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Plan de Mejoramiento Digital
            </CardTitle>
            <CardDescription>
              Consolidado del plan de mejoramiento desarrollado en los encuentros
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleDownloadPlanMejoramiento} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Descargar Plan de Mejoramiento Consolidado
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!diagnostico && !nivelatorio && actas.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Aún no has completado ningún momento. Comienza con el Diagnóstico para ver tu progreso aquí.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
