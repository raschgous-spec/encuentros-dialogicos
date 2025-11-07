import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { StudentResults } from '@/types/diagnostic';
import { calculateOverallResults } from '@/utils/evaluation';
import { IntroStep } from '@/components/steps/IntroStep';
import { BrainstormingStep } from '@/components/steps/BrainstormingStep';
import { AffinityStep } from '@/components/steps/AffinityStep';
import { IshikawaStep } from '@/components/steps/IshikawaStep';
import { DOFAStep } from '@/components/steps/DOFAStep';
import { ParetoStep } from '@/components/steps/ParetoStep';
import { ReportStep } from '@/components/steps/ReportStep';
import { diagnosticConfig } from '@/data/diagnosticConfig';
import { useTimeTracking } from '@/hooks/useTimeTracking';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DiagnosticoMomentoProps {
  onComplete?: () => void;
}

export const DiagnosticoMomento = ({ onComplete }: DiagnosticoMomentoProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [studentResults, setStudentResults] = useState<StudentResults>({
    brainstorming: [],
    affinity: {},
    ishikawa: {},
    dofa: {},
    pareto: {},
  });
  const [reportData, setReportData] = useState<ReturnType<typeof calculateOverallResults> | null>(null);
  const { stepTimes, startTracking, stopTracking } = useTimeTracking();
  const [isSaving, setIsSaving] = useState(false);

  // Start tracking time when step changes
  useEffect(() => {
    const stepNames = ['intro', 'brainstorming', 'affinity', 'ishikawa', 'dofa', 'pareto', 'report'];
    if (currentStep < stepNames.length) {
      startTracking(stepNames[currentStep]);
    }
  }, [currentStep]);

  const handleBrainstormingToggle = (optionId: string) => {
    setStudentResults((prev) => {
      const current = prev.brainstorming;
      if (current.includes(optionId)) {
        return { ...prev, brainstorming: current.filter((id) => id !== optionId) };
      } else {
        if (current.length >= diagnosticConfig.brainstorming.max_selections) {
          return prev;
        }
        return { ...prev, brainstorming: [...current, optionId] };
      }
    });
  };

  const handleAffinityChange = (itemId: string, value: string) => {
    setStudentResults((prev) => ({
      ...prev,
      affinity: { ...prev.affinity, [itemId]: value },
    }));
  };

  const handleIshikawaChange = (causeId: string, value: string) => {
    setStudentResults((prev) => ({
      ...prev,
      ishikawa: { ...prev.ishikawa, [causeId]: value },
    }));
  };

  const handleDofaChange = (statementId: string, value: string) => {
    setStudentResults((prev) => ({
      ...prev,
      dofa: { ...prev.dofa, [statementId]: value },
    }));
  };

  const handleParetoChange = (causeId: string, value: string) => {
    setStudentResults((prev) => ({
      ...prev,
      pareto: { ...prev.pareto, [causeId]: value },
    }));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return true;
      case 1:
        return studentResults.brainstorming.length === diagnosticConfig.brainstorming.max_selections;
      case 2:
        return diagnosticConfig.affinity.items.every((item) => studentResults.affinity[item.id]);
      case 3:
        return diagnosticConfig.ishikawa.causes.every((cause) => studentResults.ishikawa[cause.id]);
      case 4:
        return diagnosticConfig.dofa.statements.every((statement) => studentResults.dofa[statement.id]);
      case 5:
        return diagnosticConfig.pareto.causes.every((cause) => studentResults.pareto[cause.id]);
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (currentStep < 5) {
      stopTracking();
      setCurrentStep((prev) => prev + 1);
    } else if (currentStep === 5) {
      stopTracking();
      const results = calculateOverallResults(studentResults);
      setReportData(results);
      setCurrentStep(6);
      await saveEvaluacion(results);
    }
  };

  const saveEvaluacion = async (results: ReturnType<typeof calculateOverallResults>) => {
    if (!user || !profile) return;

    setIsSaving(true);
    try {
      const { error } = await supabase.from('evaluaciones').insert({
        estudiante_id: user.id,
        curso_id: profile.curso_id,
        fecha: new Date().toISOString(),
        puntaje_brainstorming: results.results[0].score,
        puntaje_affinity: results.results[1].score,
        puntaje_ishikawa: results.results[2].score,
        puntaje_dofa: results.results[3].score,
        puntaje_pareto: results.results[4].score,
        puntaje_promedio: results.averageScore,
        nivel: results.overallLevel,
        respuestas_completas: studentResults as any,
        tiempos_respuesta: stepTimes,
      });

      if (error) throw error;

      toast({
        title: 'Evaluación guardada',
        description: 'Tu diagnóstico ha sido registrado exitosamente.',
      });

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error saving evaluation:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la evaluación. Por favor, intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getButtonText = () => {
    if (currentStep < 5) {
      return 'Siguiente';
    } else if (currentStep === 5) {
      return isSaving ? 'Guardando...' : 'Finalizar y Ver Reporte';
    } else {
      return 'Completado';
    }
  };

  return (
    <div className="space-y-6">
      {currentStep === 0 && <IntroStep />}
      {currentStep === 1 && (
        <BrainstormingStep
          selectedOptions={studentResults.brainstorming}
          onOptionToggle={handleBrainstormingToggle}
        />
      )}
      {currentStep === 2 && <AffinityStep answers={studentResults.affinity} onAnswerChange={handleAffinityChange} />}
      {currentStep === 3 && <IshikawaStep answers={studentResults.ishikawa} onAnswerChange={handleIshikawaChange} />}
      {currentStep === 4 && <DOFAStep answers={studentResults.dofa} onAnswerChange={handleDofaChange} />}
      {currentStep === 5 && <ParetoStep answers={studentResults.pareto} onAnswerChange={handleParetoChange} />}
      {currentStep === 6 && reportData && (
        <ReportStep
          results={reportData.results}
          averageScore={reportData.averageScore}
          overallLevel={reportData.overallLevel}
          suggestion={reportData.suggestion}
        />
      )}

      {currentStep < 6 && (
        <div className="flex justify-end pt-6">
          <Button onClick={handleNext} disabled={!isStepValid() || isSaving} size="lg">
            {getButtonText()}
          </Button>
        </div>
      )}
    </div>
  );
};
