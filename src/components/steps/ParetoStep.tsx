import { diagnosticConfig } from '@/data/diagnosticConfig';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface ParetoStepProps {
  answers: Record<string, string>;
  onAnswerChange: (causeId: string, value: string) => void;
}

export const ParetoStep = ({ answers, onAnswerChange }: ParetoStepProps) => {
  const { causes, ranks } = diagnosticConfig.pareto;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary border-b-2 border-primary pb-3 mb-4">
          Sección 5: Pareto
        </h1>
        <h2 className="text-xl text-foreground mb-4">
          Jerarquiza las causas según su impacto (asigna <strong className="text-primary">1°</strong> a 
          la de mayor impacto, <strong className="text-primary">2°</strong> a la siguiente, etc.).
        </h2>
      </div>

      <div className="space-y-4">
        {causes.map((cause) => (
          <div
            key={cause.id}
            className="p-4 bg-card border border-border rounded-lg space-y-3"
          >
            <Label htmlFor={cause.id} className="text-card-foreground font-medium">
              {cause.text}
            </Label>
            <Select
              value={answers[cause.id] || ""}
              onValueChange={(value) => onAnswerChange(cause.id, value)}
            >
              <SelectTrigger id={cause.id}>
                <SelectValue placeholder="Selecciona el ranking..." />
              </SelectTrigger>
              <SelectContent>
                {ranks.map((rank) => (
                  <SelectItem key={rank} value={rank}>
                    {rank}
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
