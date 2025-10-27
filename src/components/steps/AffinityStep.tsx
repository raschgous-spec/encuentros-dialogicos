import { diagnosticConfig } from '@/data/diagnosticConfig';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface AffinityStepProps {
  answers: Record<string, string>;
  onAnswerChange: (itemId: string, value: string) => void;
}

export const AffinityStep = ({ answers, onAnswerChange }: AffinityStepProps) => {
  const { items, categories } = diagnosticConfig.affinity;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary border-b-2 border-primary pb-3 mb-4">
          Sección 2: Diagrama de Afinidad
        </h1>
        <h2 className="text-xl text-foreground mb-4">
          Clasifica cada afirmación en el grupo que corresponda.
        </h2>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-4 bg-card border border-border rounded-lg space-y-3"
          >
            <Label htmlFor={item.id} className="text-card-foreground font-medium">
              {item.text}
            </Label>
            <Select
              value={answers[item.id] || ""}
              onValueChange={(value) => onAnswerChange(item.id, value)}
            >
              <SelectTrigger id={item.id}>
                <SelectValue placeholder="Selecciona una categoría..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </div>
  );
};
