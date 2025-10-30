import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
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

const Index = () => {
  const { user, loading, profile } = useAuth();
  const navigate = useNavigate();
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

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Start tracking time when step changes
  useEffect(() => {
    const stepNames = ['intro', 'brainstorming', 'affinity', 'ishikawa', 'dofa', 'pareto', 'report'];
    if (currentStep < stepNames.length) {
      startTracking(stepNames[currentStep]);
    }
  }, [currentStep]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Cargando...</p>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

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

  const isStepValid = (): boolean => {
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
    if (currentStep === 5) {
      stopTracking();
      const results = calculateOverallResults(studentResults);
      setReportData(results);
      setCurrentStep(6);
      
      // Guardar evaluación en la base de datos
      await saveEvaluacion(results);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const saveEvaluacion = async (results: ReturnType<typeof calculateOverallResults>) => {
    try {
      setIsSaving(true);
      
      if (!user || !profile) {
        console.error('No user or profile found');
        return;
      }

      const { error } = await supabase.from('evaluaciones').insert({
        estudiante_id: user.id,
        curso_id: (profile as any).curso_id || null,
        puntaje_brainstorming: results.results[0].score,
        puntaje_affinity: results.results[1].score,
        puntaje_ishikawa: results.results[2].score,
        puntaje_dofa: results.results[3].score,
        puntaje_pareto: results.results[4].score,
        puntaje_promedio: results.averageScore,
        nivel: results.overallLevel,
        respuestas_completas: studentResults as any,
        tiempos_respuesta: stepTimes as any
      });

      if (error) {
        console.error('Error saving evaluation:', error);
        throw error;
      }

      toast({
        title: 'Evaluación guardada',
        description: 'Tu evaluación ha sido registrada exitosamente',
      });
    } catch (error) {
      console.error('Error in saveEvaluacion:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la evaluación',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getButtonText = (): string => {
    if (currentStep === 0) return 'Empezar';
    if (currentStep === 5) return 'Ver Reporte Final';
    return `Siguiente (Sección ${currentStep + 1} de 5)`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            {currentStep === 0 && <IntroStep />}
            {currentStep === 1 && (
              <BrainstormingStep
                selectedOptions={studentResults.brainstorming}
                onOptionToggle={handleBrainstormingToggle}
              />
            )}
            {currentStep === 2 && (
              <AffinityStep answers={studentResults.affinity} onAnswerChange={handleAffinityChange} />
            )}
            {currentStep === 3 && (
              <IshikawaStep answers={studentResults.ishikawa} onAnswerChange={handleIshikawaChange} />
            )}
            {currentStep === 4 && (
              <DOFAStep answers={studentResults.dofa} onAnswerChange={handleDofaChange} />
            )}
            {currentStep === 5 && (
              <ParetoStep answers={studentResults.pareto} onAnswerChange={handleParetoChange} />
            )}
            {currentStep === 6 && reportData && (
              <ReportStep
                results={reportData.results}
                averageScore={reportData.averageScore}
                overallLevel={reportData.overallLevel}
                suggestion={reportData.suggestion}
              />
            )}
          </div>

          {currentStep < 6 && (
            <div className="bg-muted px-8 py-5 border-t border-border text-right">
              <Button onClick={handleNext} disabled={!isStepValid()} size="lg">
                {getButtonText()}
              </Button>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default Index;
