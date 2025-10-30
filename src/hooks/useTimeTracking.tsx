import { useState, useEffect, useRef } from 'react';

interface TimeTrackingState {
  [stepKey: string]: number; // tiempo en segundos
}

export const useTimeTracking = () => {
  const [stepTimes, setStepTimes] = useState<TimeTrackingState>({});
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const startTracking = (stepKey: string) => {
    // Guardar tiempo del paso anterior si existe
    if (currentStep && startTimeRef.current) {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setStepTimes(prev => ({
        ...prev,
        [currentStep]: (prev[currentStep] || 0) + elapsed
      }));
    }

    // Iniciar tracking del nuevo paso
    setCurrentStep(stepKey);
    startTimeRef.current = Date.now();
  };

  const stopTracking = () => {
    if (currentStep && startTimeRef.current) {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setStepTimes(prev => ({
        ...prev,
        [currentStep]: (prev[currentStep] || 0) + elapsed
      }));
      setCurrentStep(null);
      startTimeRef.current = null;
    }
  };

  const resetTracking = () => {
    setStepTimes({});
    setCurrentStep(null);
    startTimeRef.current = null;
  };

  return {
    stepTimes,
    startTracking,
    stopTracking,
    resetTracking
  };
};
