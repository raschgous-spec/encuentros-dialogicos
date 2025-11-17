import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Users, Target, Lightbulb, Lock, FileText, ClipboardList } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

interface Encuentro1MomentoProps {
  onComplete?: () => void;
  isLocked?: boolean;
}

const actaFormSchema = z.object({
  fecha: z.string().min(1, { message: "La fecha es requerida" }),
  lugar: z.string().trim().min(1, { message: "El lugar es requerido" }).max(200),
  horaInicio: z.string().min(1, { message: "La hora de inicio es requerida" }),
  horaFin: z.string().min(1, { message: "La hora de finalización es requerida" }),
  facultad: z.string().trim().min(1, { message: "La facultad es requerida" }).max(200),
  programaAcademico: z.string().trim().min(1, { message: "El programa académico es requerido" }).max(200),
  nombreDirector: z.string().trim().min(1, { message: "El nombre del director es requerido" }).max(200),
  responsable: z.string().trim().min(1, { message: "El responsable es requerido" }).max(200),
  participantes: z.string().trim().min(1, { message: "Los participantes son requeridos" }).max(2000),
  objetivos: z.string().trim().min(1, { message: "Los objetivos son requeridos" }).max(1000),
  temasTratados: z.string().trim().min(1, { message: "Los temas tratados son requeridos" }).max(2000),
  acuerdos: z.string().trim().min(1, { message: "Los acuerdos son requeridos" }).max(2000),
  compromisos: z.string().trim().min(1, { message: "Los compromisos son requeridos" }).max(2000),
  responsablesCompromisos: z.string().trim().min(1, { message: "Los responsables de compromisos son requeridos" }).max(1000),
  observaciones: z.string().trim().max(2000).optional(),
  proximaReunion: z.string().trim().max(500).optional(),
});

export const Encuentro1Momento = ({ onComplete, isLocked = false }: Encuentro1MomentoProps) => {
  const { toast } = useToast();
  
  const actaForm = useForm<z.infer<typeof actaFormSchema>>({
    resolver: zodResolver(actaFormSchema),
    defaultValues: {
      fecha: '',
      lugar: '',
      horaInicio: '',
      horaFin: '',
      facultad: '',
      programaAcademico: '',
      nombreDirector: '',
      responsable: '',
      participantes: '',
      objetivos: '',
      temasTratados: '',
      acuerdos: '',
      compromisos: '',
      responsablesCompromisos: '',
      observaciones: '',
      proximaReunion: '',
    },
  });

  const onSubmitActa = (data: z.infer<typeof actaFormSchema>) => {
    console.log('Acta guardada:', data);
    toast({
      title: "Acta guardada",
      description: "Los datos del acta han sido guardados correctamente",
    });
  };

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
              <div className="rounded-lg border bg-card p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Acta del Encuentro</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Documenta los aspectos más importantes del primer encuentro dialógico
                  </p>
                </div>
                
                <Form {...actaForm}>
                  <form onSubmit={actaForm.handleSubmit(onSubmitActa)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={actaForm.control}
                        name="fecha"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha del encuentro</FormLabel>
                            <FormControl>
                              <Input type="date" disabled={isLocked} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={actaForm.control}
                        name="lugar"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lugar</FormLabel>
                            <FormControl>
                              <Input placeholder="Ingrese el lugar del encuentro" disabled={isLocked} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={actaForm.control}
                        name="horaInicio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hora de inicio</FormLabel>
                            <FormControl>
                              <Input type="time" disabled={isLocked} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={actaForm.control}
                        name="horaFin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hora de finalización</FormLabel>
                            <FormControl>
                              <Input type="time" disabled={isLocked} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={actaForm.control}
                      name="facultad"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Facultad</FormLabel>
                          <FormControl>
                            <Input placeholder="Nombre de la facultad" disabled={isLocked} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={actaForm.control}
                      name="programaAcademico"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Programa Académico</FormLabel>
                          <FormControl>
                            <Input placeholder="Nombre del programa académico" disabled={isLocked} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={actaForm.control}
                      name="nombreDirector"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del Director del Programa Académico</FormLabel>
                          <FormControl>
                            <Input placeholder="Nombre completo del director" disabled={isLocked} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={actaForm.control}
                      name="responsable"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Responsable del encuentro</FormLabel>
                          <FormControl>
                            <Input placeholder="Nombre del responsable" disabled={isLocked} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={actaForm.control}
                      name="participantes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Participantes (nombres completos, uno por línea)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Nombre del participante 1&#10;Nombre del participante 2&#10;Nombre del participante 3"
                              className="min-h-[100px]"
                              disabled={isLocked}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={actaForm.control}
                      name="objetivos"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Objetivos del encuentro</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describa los objetivos planteados para el encuentro"
                              className="min-h-[100px]"
                              disabled={isLocked}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={actaForm.control}
                      name="temasTratados"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Temas tratados</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Lista los principales temas y conceptos discutidos durante el encuentro"
                              className="min-h-[120px]"
                              disabled={isLocked}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={actaForm.control}
                      name="acuerdos"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Acuerdos</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Detalla los acuerdos alcanzados durante el encuentro"
                              className="min-h-[120px]"
                              disabled={isLocked}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={actaForm.control}
                      name="compromisos"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Compromisos</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Lista los compromisos asumidos por los participantes"
                              className="min-h-[120px]"
                              disabled={isLocked}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={actaForm.control}
                      name="responsablesCompromisos"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Responsables de cada compromiso</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Asigne responsables para cada compromiso"
                              className="min-h-[100px]"
                              disabled={isLocked}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={actaForm.control}
                      name="observaciones"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observaciones adicionales (opcional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Espacio para registrar observaciones adicionales relevantes"
                              className="min-h-[100px]"
                              disabled={isLocked}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={actaForm.control}
                      name="proximaReunion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Próxima reunión (opcional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Fecha, hora y temas para la próxima reunión"
                              className="min-h-[80px]"
                              disabled={isLocked}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" disabled={isLocked}>
                      Guardar Acta
                    </Button>
                  </form>
                </Form>
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
