import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Target, Lightbulb, Lock, FileText, ClipboardList } from 'lucide-react';

interface Encuentro1MomentoProps {
  onComplete?: () => void;
  isLocked?: boolean;
}

export const Encuentro1Momento = ({ onComplete, isLocked = false }: Encuentro1MomentoProps) => {
  return (
    <div className="space-y-6">
      {isLocked && (
        <Alert variant="destructive">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Este momento está bloqueado. Debes completar el Momento 2 - Nivelatorio con una calificación aprobatoria (≥60) para poder desarrollar este encuentro.
          </AlertDescription>
        </Alert>
      )}

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
          <CardTitle>MOMENTO 3 - ENCUENTRO 1</CardTitle>
          <CardDescription>Documentación y planificación del encuentro dialógico</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="acta" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="acta" className="flex items-center gap-2" disabled={isLocked}>
                <FileText className="h-4 w-4" />
                ACTA
              </TabsTrigger>
              <TabsTrigger value="plan" className="flex items-center gap-2" disabled={isLocked}>
                <ClipboardList className="h-4 w-4" />
                PLAN DE MEJORAMIENTO DIGITAL
              </TabsTrigger>
            </TabsList>

            <TabsContent value="acta" className="space-y-4">
              <div className="rounded-lg border bg-card p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Acta del Encuentro</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Documenta los aspectos más importantes del primer encuentro dialógico
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Fecha y participantes</h4>
                    <p className="text-sm text-muted-foreground">
                      Registra la fecha, hora y lista de participantes del encuentro
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Temas tratados</h4>
                    <p className="text-sm text-muted-foreground">
                      Lista los principales temas y conceptos discutidos durante el encuentro
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Acuerdos y compromisos</h4>
                    <p className="text-sm text-muted-foreground">
                      Detalla los acuerdos alcanzados y los compromisos asumidos por los participantes
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Observaciones</h4>
                    <p className="text-sm text-muted-foreground">
                      Espacio para registrar observaciones adicionales relevantes
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="plan" className="space-y-4">
              <div className="rounded-lg border bg-card p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Plan de Mejoramiento Digital</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Desarrolla un plan estratégico para implementar mejoras digitales
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Diagnóstico de la situación actual</h4>
                    <p className="text-sm text-muted-foreground">
                      Identifica el estado actual de las competencias y recursos digitales
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Objetivos de mejoramiento</h4>
                    <p className="text-sm text-muted-foreground">
                      Define objetivos específicos, medibles y alcanzables para la transformación digital
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Estrategias y actividades</h4>
                    <p className="text-sm text-muted-foreground">
                      Describe las estrategias y actividades específicas para alcanzar los objetivos
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Recursos necesarios</h4>
                    <p className="text-sm text-muted-foreground">
                      Lista los recursos tecnológicos, humanos y financieros requeridos
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Cronograma de implementación</h4>
                    <p className="text-sm text-muted-foreground">
                      Establece un cronograma con fechas y responsables para cada actividad
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Indicadores de seguimiento</h4>
                    <p className="text-sm text-muted-foreground">
                      Define indicadores para medir el progreso y éxito del plan
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {onComplete && (
            <div className="mt-6">
              <Button onClick={onComplete} className="w-full" disabled={isLocked}>
                {isLocked ? 'Momento Bloqueado' : 'Marcar como Completado'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
