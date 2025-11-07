import { useState, useEffect } from 'react';
import { Problematica } from '@/data/problematicas';
import { ProblematicaSelection } from './ProblematicaSelection';
import { BrainstormingEval } from './BrainstormingEval';
import { AffinityEval } from './AffinityEval';
import { IshikawaEval } from './IshikawaEval';
import { DOFAEval } from './DOFAEval';
import { ParetoEval } from './ParetoEval';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { calculateCaseStudyScore } from '@/utils/evaluation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface EvaluacionData {
  problematica?: string;
  dimension?: string;
  brainstorming?: any;
  affinity?: any;
  ishikawa?: any;
  dofa?: any;
  pareto?: any;
}

interface CasoEstudioEvaluacionProps {
  onComplete?: (data: EvaluacionData) => void;
}

// Shuffle array function
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

type ToolComponent = 'brainstorming' | 'affinity' | 'ishikawa' | 'dofa' | 'pareto';

const toolsConfig: Record<ToolComponent, { name: string; icon: string }> = {
  brainstorming: { name: 'Brainstorming', icon: '🧠' },
  affinity: { name: 'Diagrama de Afinidad', icon: '🧩' },
  ishikawa: { name: 'Diagrama de Ishikawa', icon: '🪶' },
  dofa: { name: 'Matriz DOFA', icon: '🧭' },
  pareto: { name: 'Diagrama de Pareto', icon: '📊' }
};

export const CasoEstudioEvaluacion = ({ onComplete }: CasoEstudioEvaluacionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<'selection' | 'evaluation' | 'complete'>('selection');
  const [selectedProblematica, setSelectedProblematica] = useState<Problematica | null>(null);
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [currentToolIndex, setCurrentToolIndex] = useState(0);
  const [toolsOrder, setToolsOrder] = useState<ToolComponent[]>([]);
  const [evaluacionData, setEvaluacionData] = useState<EvaluacionData>({});
  const [evaluationResult, setEvaluationResult] = useState<{
    automaticScore: number;
    maxScore: number;
    passed: boolean;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Randomize tools order when component mounts
    const tools: ToolComponent[] = ['brainstorming', 'affinity', 'ishikawa', 'dofa', 'pareto'];
    setToolsOrder(shuffleArray(tools));
  }, []);

  const handleProblematicaSelect = (problematica: Problematica, item: string) => {
    setSelectedProblematica(problematica);
    setSelectedItem(item);
    setEvaluacionData({
      problematica: item,
      dimension: problematica.categoria
    });
    setStep('evaluation');
  };

  const handleToolComplete = async (toolName: ToolComponent, data: any) => {
    const updatedData = {
      ...evaluacionData,
      [toolName]: data
    };
    setEvaluacionData(updatedData);

    if (currentToolIndex < toolsOrder.length - 1) {
      setCurrentToolIndex(currentToolIndex + 1);
    } else {
      // All tools completed, calculate score and save
      await saveEvaluation(updatedData);
    }
  };

  const saveEvaluation = async (finalData: EvaluacionData) => {
    if (!user) return;
    
    setSaving(true);
    
    try {
      // Calculate automatic score
      const result = calculateCaseStudyScore(finalData);
      setEvaluationResult(result);
      
      // Save to database
      const { error } = await supabase
        .from('student_evaluations')
        .insert({
          user_id: user.id,
          momento: 'nivelatorio',
          dimension: finalData.dimension || '',
          problematica: finalData.problematica || '',
          brainstorming_data: finalData.brainstorming,
          affinity_data: finalData.affinity,
          ishikawa_data: finalData.ishikawa,
          dofa_data: finalData.dofa,
          pareto_data: finalData.pareto,
          automatic_score: result.automaticScore,
          max_score: result.maxScore,
          passed: result.passed
        });

      if (error) throw error;

      toast({
        title: result.passed ? "¡Evaluación Aprobada!" : "Evaluación Completada",
        description: result.passed 
          ? `Has obtenido ${result.automaticScore}/${result.maxScore} puntos. Has desbloqueado el Momento 3.`
          : `Has obtenido ${result.automaticScore}/${result.maxScore} puntos. Necesitas al menos 60 puntos para continuar.`,
        variant: result.passed ? "default" : "destructive"
      });

      setStep('complete');
      
      // Only call onComplete if passed
      if (result.passed) {
        onComplete?.(finalData);
      }
    } catch (error) {
      console.error('Error saving evaluation:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la evaluación. Por favor intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const currentTool = toolsOrder[currentToolIndex];
  const progress = ((currentToolIndex + 1) / toolsOrder.length) * 100;

  if (step === 'selection') {
    return <ProblematicaSelection onSelect={handleProblematicaSelect} />;
  }

  if (step === 'complete') {
    if (!evaluationResult) return null;
    
    const passed = evaluationResult.passed;
    
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-4">
          {passed ? (
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
          ) : (
            <XCircle className="h-16 w-16 text-destructive mx-auto" />
          )}
          <h2 className="text-2xl font-bold">
            {passed ? '¡Evaluación Aprobada!' : 'Evaluación Completada'}
          </h2>
          <div className="space-y-2">
            <p className="text-3xl font-bold">
              {evaluationResult.automaticScore}/{evaluationResult.maxScore}
            </p>
            <p className="text-muted-foreground">
              {passed 
                ? 'Has completado exitosamente el análisis de la problemática usando las 5 herramientas de calidad.'
                : 'Has completado el análisis, pero necesitas al menos 60 puntos para aprobar y desbloquear el Momento 3.'}
            </p>
          </div>
          {passed ? (
            <>
              <p className="text-sm text-success font-medium">
                ✓ Has desbloqueado el Momento 3 - Encuentro 1
              </p>
              <p className="text-xs text-muted-foreground">
                Tu evaluación será revisada por el coordinador para la calificación final.
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Puedes intentar nuevamente para mejorar tu calificación.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  if (saving) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-lg">Guardando evaluación...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Progreso de la Evaluación</h3>
              <span className="text-sm text-muted-foreground">
                {currentToolIndex + 1} de {toolsOrder.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex flex-wrap gap-2">
              {toolsOrder.map((tool, index) => {
                const isCompleted = index < currentToolIndex;
                const isCurrent = index === currentToolIndex;
                const config = toolsConfig[tool];
                
                return (
                  <Badge 
                    key={tool}
                    variant={isCompleted ? 'default' : isCurrent ? 'secondary' : 'outline'}
                  >
                    {isCompleted && '✓ '}
                    {config.icon} {config.name}
                  </Badge>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {currentTool === 'brainstorming' && (
        <BrainstormingEval
          problematica={selectedItem}
          onComplete={(data) => handleToolComplete('brainstorming', data)}
        />
      )}

      {currentTool === 'affinity' && evaluacionData.brainstorming && (
        <AffinityEval
          problematica={selectedItem}
          ideas={evaluacionData.brainstorming.ideas}
          onComplete={(data) => handleToolComplete('affinity', data)}
        />
      )}

      {currentTool === 'ishikawa' && (
        <IshikawaEval
          problematica={selectedItem}
          onComplete={(data) => handleToolComplete('ishikawa', data)}
        />
      )}

      {currentTool === 'dofa' && (
        <DOFAEval
          problematica={selectedItem}
          onComplete={(data) => handleToolComplete('dofa', data)}
        />
      )}

      {currentTool === 'pareto' && (
        <ParetoEval
          problematica={selectedItem}
          onComplete={(data) => handleToolComplete('pareto', data)}
        />
      )}
    </div>
  );
};
