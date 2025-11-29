import { useState, useEffect } from 'react';
import { Problematica } from '@/data/problematicas';
import { ProblemaTranslocal } from '@/data/problemasTranslocales';
import { TipoSeleccion } from './TipoSeleccion';
import { ProblematicaSelection } from './ProblematicaSelection';
import { ProblemaTranslocalSelection } from './ProblemaTranslocalSelection';
import { ProblemaContextCard } from './ProblemaContextCard';
import { ArbolProblemasEval } from './ArbolProblemasEval';
import { BrainstormingEval } from './BrainstormingEval';
import { AffinityEval } from './AffinityEval';
import { IshikawaEval } from './IshikawaEval';
import { DOFAEval } from './DOFAEval';
import { ParetoEval } from './ParetoEval';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { calculateCaseStudyScore } from '@/utils/evaluation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ReporteCasoEstudio } from './ReporteCasoEstudio';

interface EvaluacionData {
  problematica?: string;
  dimension?: string;
  caracteristicas?: string;
  arbolProblemas?: any;
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

type ToolComponent = 'arbolProblemas' | 'brainstorming' | 'affinity' | 'ishikawa' | 'dofa' | 'pareto';

const toolsConfig: Record<ToolComponent, { name: string; icon: string }> = {
  arbolProblemas: { name: 'Árbol de Problemas', icon: '🌳' },
  brainstorming: { name: 'Brainstorming', icon: '🧠' },
  affinity: { name: 'Diagrama de Afinidad', icon: '🧩' },
  ishikawa: { name: 'Diagrama de Ishikawa', icon: '🪶' },
  dofa: { name: 'Matriz DOFA', icon: '🧭' },
  pareto: { name: 'Diagrama de Pareto', icon: '📊' }
};

export const CasoEstudioEvaluacion = ({ onComplete }: CasoEstudioEvaluacionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<'tipo' | 'selection' | 'translocal' | 'evaluation' | 'complete'>('tipo');
  const [tipoSeleccion, setTipoSeleccion] = useState<'dimension' | 'translocal' | null>(null);
  const [selectedProblematica, setSelectedProblematica] = useState<Problematica | null>(null);
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [currentToolIndex, setCurrentToolIndex] = useState(0);
  const [toolsOrder, setToolsOrder] = useState<ToolComponent[]>([]);
  const [evaluacionData, setEvaluacionData] = useState<EvaluacionData>({});
  const [evaluationResult, setEvaluationResult] = useState<{
    automaticScore: number;
    maxScore: number;
    passed: boolean;
    breakdown: Record<string, number>;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Randomize tools order when component mounts (arbolProblemas always first)
    const tools: ToolComponent[] = ['brainstorming', 'affinity', 'ishikawa', 'dofa', 'pareto'];
    setToolsOrder(['arbolProblemas', ...shuffleArray(tools)]);
  }, []);

  const handleTipoSelect = (tipo: 'dimension' | 'translocal') => {
    setTipoSeleccion(tipo);
    if (tipo === 'dimension') {
      setStep('selection');
    } else {
      setStep('translocal');
    }
  };

  const handleProblematicaSelect = (problematica: Problematica, item: string) => {
    setSelectedProblematica(problematica);
    setSelectedItem(item);
    setEvaluacionData({
      problematica: item,
      dimension: problematica.categoria
    });
    setStep('evaluation');
  };

  const handleTranslocalSelect = (problema: ProblemaTranslocal) => {
    setSelectedItem(problema.problematica);
    setEvaluacionData({
      problematica: problema.problematica,
      dimension: `${problema.unidad_regional} - ${problema.programa_academico}`,
      caracteristicas: problema.caracteristicas
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
          arbol_problemas_data: finalData.arbolProblemas,
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
          : `Has obtenido ${result.automaticScore}/${result.maxScore} puntos. Necesitas al menos 72 puntos para continuar.`,
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

  if (step === 'tipo') {
    return <TipoSeleccion onSelect={handleTipoSelect} />;
  }

  if (step === 'selection') {
    return <ProblematicaSelection onSelect={handleProblematicaSelect} />;
  }

  if (step === 'translocal') {
    return (
      <ProblemaTranslocalSelection 
        onSelect={handleTranslocalSelect}
        onBack={() => setStep('tipo')}
      />
    );
  }

  if (step === 'complete') {
    if (!evaluationResult) return null;
    
    return (
      <ReporteCasoEstudio
        evaluacionData={evaluacionData}
        result={evaluationResult}
        onClose={() => {
          // Optionally navigate back or refresh
          setStep('tipo');
          setEvaluacionData({});
          setCurrentToolIndex(0);
          setEvaluationResult(null);
        }}
      />
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
      <ProblemaContextCard
        tipo={tipoSeleccion || 'dimension'}
        dimension={evaluacionData.dimension || ''}
        problematica={evaluacionData.problematica || ''}
        caracteristicas={evaluacionData.caracteristicas}
      />

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

      {currentTool === 'arbolProblemas' && (
        <ArbolProblemasEval
          problematica={selectedItem}
          onComplete={(data) => handleToolComplete('arbolProblemas', data)}
        />
      )}

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
