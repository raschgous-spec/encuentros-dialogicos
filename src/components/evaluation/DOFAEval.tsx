import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { Compass, Plus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface DOFAMatrix {
  debilidades: string[];
  oportunidades: string[];
  fortalezas: string[];
  amenazas: string[];
}

interface DOFAEvalProps {
  problematica: string;
  onComplete: (data: { matrix: DOFAMatrix }) => void;
}

const quadrants = [
  { key: 'fortalezas', label: 'Fortalezas', description: 'Factores internos positivos', icon: '💪', color: 'bg-green-500/10' },
  { key: 'debilidades', label: 'Debilidades', description: 'Factores internos negativos', icon: '⚠️', color: 'bg-red-500/10' },
  { key: 'oportunidades', label: 'Oportunidades', description: 'Factores externos positivos', icon: '🎯', color: 'bg-blue-500/10' },
  { key: 'amenazas', label: 'Amenazas', description: 'Factores externos negativos', icon: '⚡', color: 'bg-orange-500/10' }
];

export const DOFAEval = ({ problematica, onComplete }: DOFAEvalProps) => {
  const [matrix, setMatrix] = useState<DOFAMatrix>({
    debilidades: [],
    oportunidades: [],
    fortalezas: [],
    amenazas: []
  });
  const [currentQuadrant, setCurrentQuadrant] = useState<keyof DOFAMatrix>('fortalezas');
  const [currentItem, setCurrentItem] = useState('');

  const handleAddItem = () => {
    if (currentItem.trim() && matrix[currentQuadrant].length < 5) {
      setMatrix({
        ...matrix,
        [currentQuadrant]: [...matrix[currentQuadrant], currentItem.trim()]
      });
      setCurrentItem('');
    }
  };

  const handleRemoveItem = (quadrant: keyof DOFAMatrix, index: number) => {
    setMatrix({
      ...matrix,
      [quadrant]: matrix[quadrant].filter((_, i) => i !== index)
    });
  };

  const handleSubmit = () => {
    const hasAllQuadrants = Object.values(matrix).every(arr => arr.length >= 2);
    if (hasAllQuadrants) {
      onComplete(matrix);
    }
  };

  const isComplete = Object.values(matrix).every(arr => arr.length >= 2);
  const totalItems = Object.values(matrix).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-primary" />
            <CardTitle>🧭 Matriz DOFA / FODA</CardTitle>
          </div>
          <CardDescription>Análisis estratégico de la problemática</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              <strong>Problemática:</strong> {problematica}
              <br />
              Completa cada cuadrante con al menos 2 elementos (máximo 5 por cuadrante).
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 gap-2">
            {quadrants.map((quad) => (
              <Button
                key={quad.key}
                variant={currentQuadrant === quad.key ? 'default' : 'outline'}
                onClick={() => setCurrentQuadrant(quad.key as keyof DOFAMatrix)}
                className="justify-start h-auto py-3"
              >
                <div className="text-left">
                  <div className="font-semibold">{quad.icon} {quad.label}</div>
                  <div className="text-xs opacity-70">
                    {matrix[quad.key as keyof DOFAMatrix].length}/5
                  </div>
                </div>
              </Button>
            ))}
          </div>

          <Card className={`border-2 border-primary ${quadrants.find(q => q.key === currentQuadrant)?.color}`}>
            <CardHeader>
              <CardTitle className="text-base">
                {quadrants.find(q => q.key === currentQuadrant)?.icon}{' '}
                {quadrants.find(q => q.key === currentQuadrant)?.label}
              </CardTitle>
              <CardDescription>
                {quadrants.find(q => q.key === currentQuadrant)?.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Textarea
                  placeholder={`Identifica ${quadrants.find(q => q.key === currentQuadrant)?.label.toLowerCase()}...`}
                  value={currentItem}
                  onChange={(e) => setCurrentItem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddItem();
                    }
                  }}
                  className="min-h-[60px]"
                  maxLength={300}
                />
              </div>
              <Button 
                onClick={handleAddItem}
                disabled={!currentItem.trim() || matrix[currentQuadrant].length >= 5}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar ({matrix[currentQuadrant].length}/5)
              </Button>

              {matrix[currentQuadrant].length > 0 && (
                <div className="space-y-2 mt-3">
                  {matrix[currentQuadrant].map((item, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground w-full justify-between p-3"
                      onClick={() => handleRemoveItem(currentQuadrant, index)}
                    >
                      <span className="text-left">{item}</span>
                      <span className="text-xs">✕</span>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            {quadrants.map((quad) => {
              const items = matrix[quad.key as keyof DOFAMatrix];
              const isQuadrantComplete = items.length >= 2;
              return (
                <Card key={quad.key} className={quad.color}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{quad.icon} {quad.label}</span>
                      {isQuadrantComplete ? <span className="text-xs">✓</span> : <span className="text-xs text-muted-foreground">{items.length}/2</span>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      {items.length === 0 ? 'Sin elementos' : `${items.length} elemento(s)`}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {!isComplete 
            ? 'Completa todos los cuadrantes con al menos 2 elementos cada uno' 
            : `✓ Matriz DOFA completa (${totalItems} elementos)`}
        </p>
        <Button onClick={handleSubmit} disabled={!isComplete} size="lg">
          Continuar
        </Button>
      </div>
    </div>
  );
};
