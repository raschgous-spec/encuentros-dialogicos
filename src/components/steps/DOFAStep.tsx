import { diagnosticConfig } from '@/data/diagnosticConfig';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface DOFAStepProps {
  answers: Record<string, string>;
  onAnswerChange: (statementId: string, value: string) => void;
}

export const DOFAStep = ({ answers, onAnswerChange }: DOFAStepProps) => {
  const { statements, quadrants } = diagnosticConfig.dofa;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary border-b-2 border-primary pb-3 mb-4">
          Sección 4: DOFA
        </h1>
        <h2 className="text-xl text-foreground mb-4">
          Clasifica cada afirmación en el cuadrante DOFA correcto.
        </h2>
      </div>

      <div className="space-y-4">
        {statements.map((statement) => (
          <div
            key={statement.id}
            className="p-4 bg-card border border-border rounded-lg space-y-3"
          >
            <Label htmlFor={statement.id} className="text-card-foreground font-medium">
              {statement.text}
            </Label>
            <Select
              value={answers[statement.id] || ""}
              onValueChange={(value) => onAnswerChange(statement.id, value)}
            >
              <SelectTrigger id={statement.id}>
                <SelectValue placeholder="Selecciona un cuadrante..." />
              </SelectTrigger>
              <SelectContent>
                {quadrants.map((quadrant) => (
                  <SelectItem key={quadrant} value={quadrant}>
                    {quadrant}
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
