import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Video, FileText, CheckSquare } from 'lucide-react';

export const NivelatorioMomento = () => {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Material de Estudio</CardTitle>
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
                <CardTitle className="text-lg">Videos Explicativos</CardTitle>
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
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Ejercicios Prácticos</CardTitle>
                <CardDescription>Practica lo aprendido</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Próximamente encontrarás aquí ejercicios para reforzar tu aprendizaje.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CheckSquare className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Evaluaciones</CardTitle>
                <CardDescription>Verifica tu progreso</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Próximamente encontrarás aquí evaluaciones para medir tu avance.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle>Sección en Construcción</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            El contenido del Momento 2 - Nivelatorio está siendo preparado. Pronto tendrás acceso a:
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground list-disc list-inside">
            <li>Material teórico sobre cada herramienta de calidad</li>
            <li>Videos tutoriales paso a paso</li>
            <li>Ejercicios prácticos interactivos</li>
            <li>Evaluaciones de progreso</li>
            <li>Casos prácticos de aplicación</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
