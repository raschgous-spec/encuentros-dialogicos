import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Target, Lightbulb } from 'lucide-react';

interface Encuentro2MomentoProps {
  onComplete?: () => void;
}

export const Encuentro2Momento = ({ onComplete }: Encuentro2MomentoProps) => {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Trabajo Colaborativo</CardTitle>
                <CardDescription>Dinámicas grupales</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Actividades de integración y trabajo en equipo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Objetivos</CardTitle>
                <CardDescription>Metas del encuentro</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Objetivos específicos de aprendizaje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Reflexión</CardTitle>
                <CardDescription>Aprendizajes clave</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Espacio para reflexionar sobre lo aprendido
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle>MOMENTO 4 - ENCUENTRO 2</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Contenido del segundo encuentro dialógico en construcción.
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
            <li>Profundización de conceptos</li>
            <li>Casos de estudio avanzados</li>
            <li>Debates y análisis crítico</li>
            <li>Proyectos colaborativos</li>
          </ul>
          {onComplete && (
            <div className="mt-6">
              <Button onClick={onComplete} className="w-full">
                Marcar como Completado
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
