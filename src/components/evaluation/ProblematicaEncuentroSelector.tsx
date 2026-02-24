import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Globe, RefreshCw, Check, Info } from 'lucide-react';
import { ProblemaContextCard } from './ProblemaContextCard';
import { ProblematicaSelection } from './ProblematicaSelection';
import { ProblemaTranslocalSelection } from './ProblemaTranslocalSelection';
import { TipoSeleccion } from './TipoSeleccion';
import { type ProblematicaNivelatorio } from '@/hooks/useNivelatorioProblematica';
import { type Problematica } from '@/data/problematicas';
import { type ProblemaTranslocal } from '@/data/problemasTranslocales';

interface ProblematicaEncuentroSelectorProps {
  nivelatorioProblematica: ProblematicaNivelatorio | null;
  loadingNivelatorio: boolean;
  currentProblematica: ProblematicaNivelatorio | null;
  onProblematicaSelected: (problematica: ProblematicaNivelatorio) => void;
  momento: string;
}

export const ProblematicaEncuentroSelector = ({
  nivelatorioProblematica,
  loadingNivelatorio,
  currentProblematica,
  onProblematicaSelected,
  momento,
}: ProblematicaEncuentroSelectorProps) => {
  const [isChanging, setIsChanging] = useState(false);
  const [selectionStep, setSelectionStep] = useState<'tipo' | 'dimension' | 'translocal' | null>(null);

  if (loadingNivelatorio) return null;

  // If already has a selected problemática and not changing, show it with option to change
  if (currentProblematica && !isChanging) {
    return (
      <div className="space-y-2">
        <ProblemaContextCard
          tipo={currentProblematica.tipo}
          dimension={currentProblematica.dimension}
          problematica={currentProblematica.problematica}
          caracteristicas={currentProblematica.caracteristicas}
          unidad_regional={currentProblematica.unidad_regional}
          linea_translocal={currentProblematica.linea_translocal}
          fuente={currentProblematica.fuente}
        />
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsChanging(true)}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Cambiar problemática para este momento
          </Button>
        </div>
      </div>
    );
  }

  // Selection flow
  if (isChanging || !currentProblematica) {
    if (selectionStep === 'dimension') {
      return (
        <ProblematicaSelection
          onSelect={(problematica: Problematica, item: string) => {
            onProblematicaSelected({
              tipo: 'dimension',
              dimension: problematica.titulo,
              problematica: item,
            });
            setIsChanging(false);
            setSelectionStep(null);
          }}
        />
      );
    }

    if (selectionStep === 'translocal') {
      return (
        <ProblemaTranslocalSelection
          onSelect={(problema: ProblemaTranslocal) => {
            onProblematicaSelected({
              tipo: 'translocal',
              dimension: `${problema.linea_translocal} - ${problema.fuente}`,
              problematica: problema.problematica,
              caracteristicas: problema.caracteristicas,
              unidad_regional: problema.unidad_regional,
              linea_translocal: problema.linea_translocal,
              fuente: problema.fuente,
            });
            setIsChanging(false);
            setSelectionStep(null);
          }}
          onBack={() => setSelectionStep(null)}
        />
      );
    }

    // Show options: keep nivelatorio, or choose new
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">Selección de Problemática - {momento}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Puedes trabajar con la problemática del nivelatorio o seleccionar una nueva para este momento.
            </AlertDescription>
          </Alert>

          {nivelatorioProblematica && (
            <Card
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => {
                onProblematicaSelected(nivelatorioProblematica);
                setIsChanging(false);
                setSelectionStep(null);
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span className="font-medium">Usar problemática del Nivelatorio</span>
                  <Badge variant="secondary" className="ml-auto">Recomendado</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {nivelatorioProblematica.dimension} — {nivelatorioProblematica.problematica}
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <Card
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => setSelectionStep('dimension')}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Seleccionar por Dimensión</p>
                  <p className="text-xs text-muted-foreground">7 dimensiones del modelo educativo</p>
                </div>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => setSelectionStep('translocal')}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <Globe className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Banco Translocal</p>
                  <p className="text-xs text-muted-foreground">Problemáticas regionales</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {isChanging && (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => {
                setIsChanging(false);
                setSelectionStep(null);
              }}>
                Cancelar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
};
