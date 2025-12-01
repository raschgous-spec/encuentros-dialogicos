import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { BarChart3, Plus, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface ParetoCause {
  description: string;
  frequency: number;
}

interface ParetoEvalProps {
  problematica: string;
  onComplete: (data: { causes: ParetoCause[] }) => void;
}

export const ParetoEval = ({ problematica, onComplete }: ParetoEvalProps) => {
  const [causes, setCauses] = useState<ParetoCause[]>([]);
  const [currentDescription, setCurrentDescription] = useState('');
  const [currentFrequency, setCurrentFrequency] = useState('');

  const handleAddCause = () => {
    const freq = parseInt(currentFrequency);
    if (currentDescription.trim() && freq > 0 && causes.length < 10) {
      setCauses([...causes, { description: currentDescription.trim(), frequency: freq }]);
      setCurrentDescription('');
      setCurrentFrequency('');
    }
  };

  const handleRemoveCause = (index: number) => {
    setCauses(causes.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (causes.length >= 4) {
      // Sort by frequency descending
      const sortedCauses = [...causes].sort((a, b) => b.frequency - a.frequency);
      onComplete({ causes: sortedCauses });
    }
  };

  const sortedCauses = [...causes].sort((a, b) => b.frequency - a.frequency);
  const totalFrequency = causes.reduce((sum, c) => sum + c.frequency, 0);
  
  // Calculate cumulative percentages
  let cumulative = 0;
  const causesWithPercentage = sortedCauses.map(cause => {
    const percentage = (cause.frequency / totalFrequency) * 100;
    cumulative += percentage;
    return {
      ...cause,
      percentage: percentage.toFixed(1),
      cumulative: cumulative.toFixed(1)
    };
  });

  const isComplete = causes.length >= 4;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <CardTitle>📊 Diagrama de Pareto (Principio 80/20)</CardTitle>
          </div>
          <CardDescription>Identifica y prioriza las causas más frecuentes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              <strong>Problemática:</strong> {problematica}
              <br />
              Identifica al menos 4 causas con su frecuencia de ocurrencia para aplicar el principio de Pareto.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <Input
                placeholder="Descripción de la causa"
                value={currentDescription}
                onChange={(e) => setCurrentDescription(e.target.value)}
                className="col-span-2"
                maxLength={200}
              />
              <Input
                type="number"
                placeholder="Frecuencia"
                value={currentFrequency}
                onChange={(e) => setCurrentFrequency(e.target.value)}
                min="1"
                max="999"
              />
            </div>
            <Button 
              onClick={handleAddCause}
              disabled={!currentDescription.trim() || !currentFrequency || parseInt(currentFrequency) <= 0 || causes.length >= 10}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar Causa ({causes.length}/10)
            </Button>
          </div>

          {causes.length > 0 && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-base">Análisis de Pareto</CardTitle>
                <CardDescription>Causas ordenadas por frecuencia (mayor a menor)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {causesWithPercentage.map((cause, index) => {
                    const isTop80 = parseFloat(cause.cumulative) <= 80;
                    return (
                      <div 
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          isTop80 ? 'bg-primary/10 border-primary' : 'bg-muted/50'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={isTop80 ? 'default' : 'secondary'}>
                              #{index + 1}
                            </Badge>
                            <span className="text-sm font-medium">{cause.description}</span>
                          </div>
                          <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                            <span>Frecuencia: {cause.frequency}</span>
                            <span>Porcentaje: {cause.percentage}%</span>
                            <span className="font-semibold">Acumulado: {cause.cumulative}%</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCause(causes.findIndex(c => c.description === cause.description))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>

                {causes.length >= 4 && (
                  <Alert className="mt-4">
                    <AlertDescription>
                      <strong>Principio 80/20:</strong> Las causas marcadas en azul representan 
                      las más frecuentes y donde deberías concentrar tus esfuerzos inicialmente.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {!isComplete 
            ? `Necesitas ${4 - causes.length} causa(s) más (mínimo 4)` 
            : `✓ Análisis de Pareto completo (${causes.length} causas)`}
        </p>
        <Button onClick={handleSubmit} disabled={!isComplete} size="lg">
          Finalizar Valoración
        </Button>
      </div>
    </div>
  );
};
