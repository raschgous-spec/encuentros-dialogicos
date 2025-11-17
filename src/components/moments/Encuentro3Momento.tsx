import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Target, Lightbulb, Lock, FileText, ClipboardList } from 'lucide-react';

interface Encuentro3MomentoProps {
  onComplete?: () => void;
  isLocked?: boolean;
}

export const Encuentro3Momento = ({ onComplete, isLocked = false }: Encuentro3MomentoProps) => {
  return (
    <div className="space-y-6">
      {isLocked && (
        <Alert variant="destructive">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Este momento está bloqueado. Debes completar el Momento 4 - Encuentro 2 para poder desarrollar este encuentro.
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
          <CardTitle>MOMENTO 5 - ENCUENTRO 3</CardTitle>
          <CardDescription>Documentación y síntesis del tercer encuentro dialógico</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="acta" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="acta" className="flex items-center gap-2" disabled={isLocked}>
                <FileText className="h-4 w-4" />
                ACTA
              </TabsTrigger>
              <TabsTrigger value="sintesis" className="flex items-center gap-2" disabled={isLocked}>
                <ClipboardList className="h-4 w-4" />
                SÍNTESIS DE APRENDIZAJES
              </TabsTrigger>
            </TabsList>

            <TabsContent value="acta" className="space-y-4">
              <div className="rounded-lg border bg-card p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Acta del Encuentro</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Documenta los aspectos más importantes del tercer encuentro dialógico
                  </p>
                </div>
                
                <form className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Fecha del encuentro</label>
                    <input 
                      type="date" 
                      className="w-full px-3 py-2 border rounded-lg bg-background text-foreground"
                      disabled={isLocked}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium">Hora de inicio</label>
                    <input 
                      type="time" 
                      className="w-full px-3 py-2 border rounded-lg bg-background text-foreground"
                      disabled={isLocked}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium">Hora de finalización</label>
                    <input 
                      type="time" 
                      className="w-full px-3 py-2 border rounded-lg bg-background text-foreground"
                      disabled={isLocked}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium">Participantes (nombres completos, uno por línea)</label>
                    <textarea 
                      className="w-full px-3 py-2 border rounded-lg bg-background text-foreground min-h-[100px]"
                      placeholder="Nombre del participante 1&#10;Nombre del participante 2&#10;Nombre del participante 3"
                      disabled={isLocked}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium">Temas tratados</label>
                    <textarea 
                      className="w-full px-3 py-2 border rounded-lg bg-background text-foreground min-h-[120px]"
                      placeholder="Lista los principales temas y conceptos discutidos durante el encuentro"
                      disabled={isLocked}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium">Acuerdos y compromisos</label>
                    <textarea 
                      className="w-full px-3 py-2 border rounded-lg bg-background text-foreground min-h-[120px]"
                      placeholder="Detalla los acuerdos alcanzados y los compromisos asumidos por los participantes"
                      disabled={isLocked}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium">Observaciones adicionales</label>
                    <textarea 
                      className="w-full px-3 py-2 border rounded-lg bg-background text-foreground min-h-[100px]"
                      placeholder="Espacio para registrar observaciones adicionales relevantes"
                      disabled={isLocked}
                    />
                  </div>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="sintesis" className="space-y-4">
              <div className="rounded-lg border bg-card p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Síntesis de Aprendizajes</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Reflexión sobre los aprendizajes clave del encuentro
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Aprendizajes previos aplicados</h4>
                    <p className="text-sm text-muted-foreground">
                      Síntesis de cómo se aplicaron los conceptos previos
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Resolución de problemas complejos</h4>
                    <p className="text-sm text-muted-foreground">
                      Estrategias utilizadas para resolver problemas complejos
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Evaluación formativa</h4>
                    <p className="text-sm text-muted-foreground">
                      Reflexiones sobre el proceso de aprendizaje
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
