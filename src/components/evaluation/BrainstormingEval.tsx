import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Plus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BrainstormingEvalProps {
  problematica: string;
  onComplete: (data: { ideas: string[] }) => void;
}

export const BrainstormingEval = ({ problematica, onComplete }: BrainstormingEvalProps) => {
  const [currentIdea, setCurrentIdea] = useState('');
  const [ideas, setIdeas] = useState<string[]>([]);

  const handleAddIdea = () => {
    if (currentIdea.trim() && ideas.length < 20) {
      setIdeas([...ideas, currentIdea.trim()]);
      setCurrentIdea('');
    }
  };

  const handleRemoveIdea = (index: number) => {
    setIdeas(ideas.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (ideas.length >= 5) {
      onComplete({ ideas });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            <CardTitle>🧠 Brainstorming (Lluvia de Ideas)</CardTitle>
          </div>
          <CardDescription>Genera ideas para abordar la problemática</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              <strong>Problemática seleccionada:</strong> {problematica}
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Genera al menos 5 ideas diferentes para abordar esta problemática. 
              No te censures, todas las ideas son válidas en esta fase.
            </p>
            
            <div className="flex gap-2">
              <Textarea
                placeholder="Escribe tu idea aquí..."
                value={currentIdea}
                onChange={(e) => setCurrentIdea(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddIdea();
                  }
                }}
                className="min-h-[80px]"
                maxLength={500}
              />
            </div>
            
            <Button 
              onClick={handleAddIdea} 
              disabled={!currentIdea.trim() || ideas.length >= 20}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar Idea ({ideas.length}/20)
            </Button>
          </div>

          {ideas.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Ideas generadas:</h4>
              <div className="flex flex-wrap gap-2">
                {ideas.map((idea, index) => (
                  <Badge 
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors px-3 py-2"
                    onClick={() => handleRemoveIdea(index)}
                  >
                    {index + 1}. {idea.substring(0, 50)}{idea.length > 50 ? '...' : ''}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {ideas.length < 5 ? `Necesitas al menos ${5 - ideas.length} idea(s) más` : '✓ Requisito mínimo cumplido'}
        </p>
        <Button onClick={handleSubmit} disabled={ideas.length < 5} size="lg">
          Continuar
        </Button>
      </div>
    </div>
  );
};
