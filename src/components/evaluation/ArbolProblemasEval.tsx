import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ArbolProblemasEvalProps {
  problematica: string;
  onComplete: (data: any) => void;
}

export const ArbolProblemasEval = ({ problematica, onComplete }: ArbolProblemasEvalProps) => {
  const [problemaCentral, setProblemaCentral] = useState('');
  const [causas, setCausas] = useState<string[]>(['']);
  const [efectos, setEfectos] = useState<string[]>(['']);

  const addCausa = () => {
    setCausas([...causas, '']);
  };

  const removeCausa = (index: number) => {
    if (causas.length > 1) {
      setCausas(causas.filter((_, i) => i !== index));
    }
  };

  const updateCausa = (index: number, value: string) => {
    const newCausas = [...causas];
    newCausas[index] = value;
    setCausas(newCausas);
  };

  const addEfecto = () => {
    setEfectos([...efectos, '']);
  };

  const removeEfecto = (index: number) => {
    if (efectos.length > 1) {
      setEfectos(efectos.filter((_, i) => i !== index));
    }
  };

  const updateEfecto = (index: number, value: string) => {
    const newEfectos = [...efectos];
    newEfectos[index] = value;
    setEfectos(newEfectos);
  };

  const handleComplete = () => {
    const filledCausas = causas.filter(c => c.trim().length > 0);
    const filledEfectos = efectos.filter(e => e.trim().length > 0);

    if (!problemaCentral.trim()) {
      alert('Debes definir el problema central');
      return;
    }

    if (filledCausas.length === 0) {
      alert('Debes agregar al menos una causa');
      return;
    }

    if (filledEfectos.length === 0) {
      alert('Debes agregar al menos un efecto');
      return;
    }

    onComplete({
      problemaCentral: problemaCentral.trim(),
      causas: filledCausas,
      efectos: filledEfectos
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🌳 Árbol de Problemas
        </CardTitle>
        <CardDescription>
          Analiza la problemática identificando el problema central, sus causas (raíces) y sus efectos (ramas)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertDescription>
            <strong>Instrucciones:</strong> El árbol de problemas te ayuda a visualizar la estructura completa del problema. 
            En el centro está el problema principal, abajo las causas que lo originan (raíces), y arriba los efectos o consecuencias (ramas).
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label className="text-base font-semibold">Problemática a analizar:</Label>
          <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
            {problematica}
          </p>
        </div>

        {/* Efectos (Ramas) */}
        <div className="space-y-3 border-t pt-6">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">🌿 Efectos / Consecuencias (Ramas del árbol)</Label>
            <Button type="button" variant="outline" size="sm" onClick={addEfecto}>
              <Plus className="h-4 w-4 mr-1" />
              Agregar efecto
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            ¿Qué consecuencias negativas genera este problema?
          </p>
          <div className="space-y-2">
            {efectos.map((efecto, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1">
                  <Input
                    placeholder={`Efecto ${index + 1}: ej. "Disminución del rendimiento académico"`}
                    value={efecto}
                    onChange={(e) => updateEfecto(index, e.target.value)}
                    className="w-full"
                  />
                </div>
                {efectos.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeEfecto(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Problema Central */}
        <div className="space-y-3 border-y py-6 bg-primary/5 -mx-6 px-6">
          <Label className="text-base font-semibold">🎯 Problema Central (Tronco del árbol)</Label>
          <p className="text-xs text-muted-foreground">
            Define de forma clara y específica el problema principal
          </p>
          <Input
            placeholder="Ej. Bajo rendimiento académico en estudiantes de primer semestre"
            value={problemaCentral}
            onChange={(e) => setProblemaCentral(e.target.value)}
            className="text-base font-medium"
          />
        </div>

        {/* Causas (Raíces) */}
        <div className="space-y-3 border-b pb-6">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">🌱 Causas (Raíces del árbol)</Label>
            <Button type="button" variant="outline" size="sm" onClick={addCausa}>
              <Plus className="h-4 w-4 mr-1" />
              Agregar causa
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            ¿Qué factores originan o contribuyen a este problema?
          </p>
          <div className="space-y-2">
            {causas.map((causa, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1">
                  <Input
                    placeholder={`Causa ${index + 1}: ej. "Falta de hábitos de estudio efectivos"`}
                    value={causa}
                    onChange={(e) => updateCausa(index, e.target.value)}
                    className="w-full"
                  />
                </div>
                {causas.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCausa(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Visualización del árbol */}
        {problemaCentral && (causas.some(c => c.trim()) || efectos.some(e => e.trim())) && (
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h3 className="font-semibold text-center mb-4">Vista previa del Árbol de Problemas</h3>
            
            {/* Efectos */}
            {efectos.filter(e => e.trim()).length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground text-center">EFECTOS</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {efectos.filter(e => e.trim()).map((efecto, idx) => (
                    <div key={idx} className="bg-red-50 border border-red-200 rounded p-2 text-sm text-center">
                      {efecto}
                    </div>
                  ))}
                </div>
                <div className="flex justify-center">
                  <div className="w-0.5 h-8 bg-border"></div>
                </div>
              </div>
            )}

            {/* Problema Central */}
            <div className="bg-primary/10 border-2 border-primary rounded-lg p-4 text-center">
              <p className="font-semibold">{problemaCentral}</p>
            </div>

            {/* Causas */}
            {causas.filter(c => c.trim()).length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-center">
                  <div className="w-0.5 h-8 bg-border"></div>
                </div>
                <p className="text-xs font-semibold text-muted-foreground text-center">CAUSAS</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {causas.filter(c => c.trim()).map((causa, idx) => (
                    <div key={idx} className="bg-blue-50 border border-blue-200 rounded p-2 text-sm text-center">
                      {causa}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <Button 
          onClick={handleComplete} 
          className="w-full" 
          size="lg"
          disabled={!problemaCentral.trim() || causas.filter(c => c.trim()).length === 0 || efectos.filter(e => e.trim()).length === 0}
        >
          <CheckCircle className="mr-2 h-5 w-5" />
          Completar Árbol de Problemas
        </Button>
      </CardContent>
    </Card>
  );
};
