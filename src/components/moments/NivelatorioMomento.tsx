import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Video, FileCheck } from 'lucide-react';

interface NivelatorioMomentoProps {
  onComplete?: () => void;
}

export const NivelatorioMomento = ({ onComplete }: NivelatorioMomentoProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary border-b-2 border-primary pb-3 mb-6">
          MOMENTO 2 - NIVELATORIO
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">1. MATERIAL DE ESTUDIO</CardTitle>
                <CardDescription>Recursos teóricos y guías</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Próximamente encontrarás aquí material de lectura sobre las herramientas de calidad.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Video className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">2. VIDEOS EXPLICATIVOS</CardTitle>
                <CardDescription>Contenido audiovisual</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Próximamente encontrarás aquí videos explicativos sobre cada herramienta.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">3. EVALUACIÓN - CASO DE ESTUDIO</CardTitle>
                <CardDescription>Verifica tu progreso</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Próximamente encontrarás aquí la evaluación del caso de estudio.
            </p>
          </CardContent>
        </Card>
      </div>

      {onComplete && (
        <div className="flex justify-end">
          <Button onClick={onComplete} size="lg">
            Marcar como Completado
          </Button>
        </div>
      )}
    </div>
  );
};
