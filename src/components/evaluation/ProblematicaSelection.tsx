import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { problematicas, Problematica } from '@/data/problematicas';
import { ChevronRight, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import modeloEducativo from '@/assets/modelo-educativo.jpg';

interface ProblematicaSelectionProps {
  onSelect: (problematica: Problematica, item: string) => void;
}

export const ProblematicaSelection = ({ onSelect }: ProblematicaSelectionProps) => {
  const [selectedDimension, setSelectedDimension] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<string>('');

  const handleContinue = () => {
    const problematica = problematicas.find(p => p.id === selectedDimension);
    if (problematica && selectedItem) {
      onSelect(problematica, selectedItem);
    }
  };

  const currentProblematica = problematicas.find(p => p.id === selectedDimension);

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Selecciona una dimensión y una problemática específica que trabajarás durante toda la evaluación.
          Aplicarás las 6 herramientas de calidad a esta problemática.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Paso 1: Selecciona una Dimensión</CardTitle>
          <CardDescription>Elige el área problemática de tu interés</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex justify-center">
            <img 
              src={modeloEducativo} 
              alt="Modelo Educativo Digital Transmoderno - Universidad de Cundinamarca"
              className="w-full max-w-3xl rounded-lg shadow-md"
            />
          </div>
          <RadioGroup value={selectedDimension} onValueChange={(value) => {
            setSelectedDimension(value);
            setSelectedItem('');
          }}>
            <div className="grid gap-3">
              {problematicas.map((problematica) => (
                <div key={problematica.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={problematica.id} id={problematica.id} />
                  <Label htmlFor={problematica.id} className="cursor-pointer flex-1">
                    {problematica.categoria}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {currentProblematica && (
        <Card>
          <CardHeader>
            <CardTitle>Paso 2: Selecciona una Problemática Específica</CardTitle>
            <CardDescription>De la dimensión: {currentProblematica.titulo}</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedItem} onValueChange={setSelectedItem}>
              <div className="grid gap-3">
                {currentProblematica.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={item} id={`item-${index}`} />
                    <Label htmlFor={`item-${index}`} className="cursor-pointer flex-1 leading-relaxed">
                      {item}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button 
          onClick={handleContinue} 
          disabled={!selectedDimension || !selectedItem}
          size="lg"
        >
          Continuar a la Evaluación
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
