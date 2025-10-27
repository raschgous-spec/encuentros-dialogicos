import { diagnosticConfig } from '@/data/diagnosticConfig';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface IshikawaStepProps {
  answers: Record<string, string>;
  onAnswerChange: (causeId: string, value: string) => void;
}

export const IshikawaStep = ({ answers, onAnswerChange }: IshikawaStepProps) => {
  const { causes, categories } = diagnosticConfig.ishikawa;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary border-b-2 border-primary pb-3 mb-4">
          Sección 3: Diagrama de Ishikawa
        </h1>
        <h2 className="text-xl text-foreground mb-4">
          Clasifica cada causa raíz en la "espina" principal del diagrama que le corresponde.
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
