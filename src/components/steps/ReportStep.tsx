import { EvaluationResult, Level } from '@/types/diagnostic';
import { Award, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportStepProps {
  results: EvaluationResult[];
  averageScore: number;
  overallLevel: Level;
  suggestion: string;
}

const levelLabels: Record<Level, string> = {
  avanzado: 'Avanzado',
  intermedio: 'Intermedio',
  basico: 'Básico',
  inicial: 'Inicial',
};

export const ReportStep = ({ results, averageScore, overallLevel, suggestion }: ReportStepProps) => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-success/10 rounded-full mb-4">
          <Award className="text-success" size={32} />
        </div>
        <h1 className="text-3xl font-bold text-success border-b-2 border-success pb-3 mb-6 inline-block">
          🧮 Perfil Automático de Resultados
        </h1>
      </div>

      <div className="bg-card border border-border rounded-lg p-8 text-center space-y-4">
        <p className="text-lg text-card-foreground">Tu nivel general de dominio es:</p>
        <div
          className={cn(
            'text-2xl font-bold py-4 px-6 rounded-lg inline-block',
            `bg-level-${overallLevel} text-level-${overallLevel}-foreground`
          )}
        >
          {levelLabels[overallLevel]} ({averageScore.toFixed(0)}%)
        </div>
        <div className="flex items-start gap-3 text-left bg-accent/50 p-4 rounded-lg mt-6">
          <TrendingUp className="text-primary mt-1 flex-shrink-0" size={20} />
          <p className="text-accent-foreground">
            <strong>Sugerencia:</strong> {suggestion}
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted">
                <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground border-b border-border">
                  Herramienta
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground border-b border-border">
                  Nivel de Logro
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground border-b border-border">
                  Puntaje
                </th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={index} className="hover:bg-accent/30 transition-colors">
                  <td className="px-6 py-4 border-b border-border text-card-foreground">
                    {result.name}
                  </td>
                  <td className="px-6 py-4 border-b border-border">
                    <span
                      className={cn(
                        'inline-block px-3 py-1 rounded-md text-sm font-medium',
                        `bg-level-${result.level} text-level-${result.level}-foreground`
                      )}
                    >
                      {levelLabels[result.level]}
                    </span>
                  </td>
                  <td className="px-6 py-4 border-b border-border text-card-foreground font-semibold">
                    {result.score.toFixed(0)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
