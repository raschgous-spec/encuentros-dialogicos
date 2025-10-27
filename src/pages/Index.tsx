import { useState } from 'react';
import { Button } from '@/components/ui/button';
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

const Index = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [studentResults, setStudentResults] = useState<StudentResults>({
    brainstorming: [],
    affinity: {},
    ishikawa: {},
    dofa: {},
    pareto: {},
  });
  const [reportData, setReportData] = useState<ReturnType<typeof calculateOverallResults> | null>(null);

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

  const handleNext = () => {
    if (currentStep === 5) {
      const results = calculateOverallResults(studentResults);
      setReportData(results);
      setCurrentStep(6);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const getButtonText = (): string => {
    if (currentStep === 0) return 'Empezar';
    if (currentStep === 5) return 'Ver Reporte Final';
    return `Siguiente (Sección ${currentStep + 1} de 5)`;
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
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
  );
};

export default Index;
