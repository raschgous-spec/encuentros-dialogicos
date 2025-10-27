import { diagnosticConfig } from '@/data/diagnosticConfig';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface BrainstormingStepProps {
  selectedOptions: string[];
  onOptionToggle: (optionId: string) => void;
}

export const BrainstormingStep = ({ selectedOptions, onOptionToggle }: BrainstormingStepProps) => {
  const { options, max_selections } = diagnosticConfig.brainstorming;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary border-b-2 border-primary pb-3 mb-4">
          Sección 1: Brainstorming
        </h1>
        <h2 className="text-xl text-foreground mb-4">
          Selecciona las <strong className="text-primary">{max_selections}</strong> ideas que 
          consideres más pertinentes para reducir el impacto ambiental sin afectar la productividad.
        </h2>
        <p className="text-sm text-muted-foreground">
          Seleccionadas: {selectedOptions.length} de {max_selections}
        </p>
      </div>

      <div className="space-y-3">
        {options.map((option) => (
          <div
            key={option.id}
            className="flex items-center space-x-3 p-4 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors"
          >
            <Checkbox
              id={option.id}
              checked={selectedOptions.includes(option.id)}
              onCheckedChange={() => onOptionToggle(option.id)}
              disabled={!selectedOptions.includes(option.id) && selectedOptions.length >= max_selections}
            />
            <Label
              htmlFor={option.id}
              className="flex-1 cursor-pointer text-card-foreground"
            >
              {option.text}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};
