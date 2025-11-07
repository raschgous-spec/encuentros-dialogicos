import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { Fish, Plus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface IshikawaCauses {
  metodos: string[];
  manoObra: string[];
  materiales: string[];
  maquinaria: string[];
  medicion: string[];
  medioAmbiente: string[];
}

interface IshikawaEvalProps {
  problematica: string;
  onComplete: (data: { causes: IshikawaCauses }) => void;
}

const categories = [
  { key: 'metodos', label: 'Métodos', icon: '📋' },
  { key: 'manoObra', label: 'Mano de Obra', icon: '👥' },
  { key: 'materiales', label: 'Materiales', icon: '📦' },
  { key: 'maquinaria', label: 'Maquinaria', icon: '⚙️' },
  { key: 'medicion', label: 'Medición', icon: '📊' },
  { key: 'medioAmbiente', label: 'Medio Ambiente', icon: '🌍' }
];

export const IshikawaEval = ({ problematica, onComplete }: IshikawaEvalProps) => {
  const [causes, setCauses] = useState<IshikawaCauses>({
    metodos: [],
    manoObra: [],
    materiales: [],
    maquinaria: [],
    medicion: [],
    medioAmbiente: []
  });
  const [currentCategory, setCurrentCategory] = useState<keyof IshikawaCauses>('metodos');
  const [currentCause, setCurrentCause] = useState('');

  const handleAddCause = () => {
    if (currentCause.trim() && causes[currentCategory].length < 5) {
      setCauses({
        ...causes,
        [currentCategory]: [...causes[currentCategory], currentCause.trim()]
      });
      setCurrentCause('');
    }
  };

  const handleRemoveCause = (category: keyof IshikawaCauses, index: number) => {
    setCauses({
      ...causes,
      [category]: causes[category].filter((_, i) => i !== index)
    });
  };

  const handleSubmit = () => {
    const totalCauses = Object.values(causes).reduce((sum, arr) => sum + arr.length, 0);
    if (totalCauses >= 6) {
      onComplete({ causes });
    }
  };

  const totalCauses = Object.values(causes).reduce((sum, arr) => sum + arr.length, 0);
  const isComplete = totalCauses >= 6;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Fish className="h-5 w-5 text-primary" />
            <CardTitle>🪶 Diagrama de Ishikawa (Espina de Pescado)</CardTitle>
          </div>
          <CardDescription>Identifica las causas del problema en las 6M</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              <strong>Problema a analizar:</strong> {problematica}
              <br />
              Identifica al menos 6 causas distribuidas en las categorías (6M).
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {categories.map((cat) => (
              <Button
                key={cat.key}
                variant={currentCategory === cat.key ? 'default' : 'outline'}
                onClick={() => setCurrentCategory(cat.key as keyof IshikawaCauses)}
                className="justify-start"
              >
                {cat.icon} {cat.label} ({causes[cat.key as keyof IshikawaCauses].length})
              </Button>
            ))}
          </div>

          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle className="text-base">
                {categories.find(c => c.key === currentCategory)?.icon}{' '}
                {categories.find(c => c.key === currentCategory)?.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Textarea
                  placeholder={`Identifica una causa relacionada con ${categories.find(c => c.key === currentCategory)?.label}...`}
                  value={currentCause}
                  onChange={(e) => setCurrentCause(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddCause();
                    }
                  }}
                  className="min-h-[60px]"
                  maxLength={300}
                />
              </div>
              <Button 
                onClick={handleAddCause}
                disabled={!currentCause.trim() || causes[currentCategory].length >= 5}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar Causa ({causes[currentCategory].length}/5)
              </Button>

              {causes[currentCategory].length > 0 && (
                <div className="space-y-2 mt-3">
                  {causes[currentCategory].map((cause, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground w-full justify-between p-3"
                      onClick={() => handleRemoveCause(currentCategory, index)}
                    >
                      <span className="text-left">{cause}</span>
                      <span className="text-xs">✕</span>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-muted/50 rounded-lg">
            {categories.map((cat) => (
              <div key={cat.key} className="space-y-1">
                <p className="text-xs font-semibold">{cat.icon} {cat.label}</p>
                <p className="text-xs text-muted-foreground">
                  {causes[cat.key as keyof IshikawaCauses].length} causa(s)
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {!isComplete 
            ? `Necesitas ${6 - totalCauses} causa(s) más (Total: ${totalCauses}/6 mínimo)` 
            : `✓ Diagrama completo (${totalCauses} causas identificadas)`}
        </p>
        <Button onClick={handleSubmit} disabled={!isComplete} size="lg">
          Continuar
        </Button>
      </div>
    </div>
  );
};
