import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Users, Target, Lightbulb, Lock, FileText, ClipboardList, Plus, Trash2 } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ParticipacionesTable } from './ParticipacionesTable';

interface Encuentro3MomentoProps {
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
  nombreSecretario: z.string().trim().min(1, { message: "El nombre del secretario es requerido" }).max(200),
  identificacionSecretario: z.string().trim().min(1, { message: "El número de identificación es requerido" }).max(50),
  facultadProgramaSecretario: z.string().trim().min(1, { message: "La facultad y programa son requeridos" }).max(300),
  correoSecretario: z.string().trim().min(1, { message: "El correo institucional es requerido" }).email({ message: "Ingrese un correo válido" }).max(200),
  participantes: z.string().trim().min(1, { message: "Los participantes son requeridos" }).max(2000),
  objetivos: z.string().trim().min(1, { message: "Los objetivos son requeridos" }).max(1000),
  // Agenda del día
  agendaBienvenida: z.string().trim().min(1, { message: "Este campo es requerido" }).max(500),
  agendaSecretario: z.string().trim().min(1, { message: "Este campo es requerido" }).max(500),
  agendaInforme: z.string().trim().min(1, { message: "Este campo es requerido" }).max(1000),
  agendaLecturaOrden: z.string().trim().min(1, { message: "Este campo es requerido" }).max(500),
  agendaDocumentoCoordinador: z.string().trim().min(1, { message: "Este campo es requerido" }).max(1000),
  agendaIntervencionEstudiantes: z.string().trim().min(1, { message: "Este campo es requerido" }).max(1000),
  // Contenido
  temasInstitucionales: z.array(z.object({
    tema: z.string().trim().min(1, { message: "El tema es requerido" }).max(200),
    participaciones: z.array(z.object({
      nombreEstudiante: z.string().trim().min(1, { message: "El nombre es requerido" }).max(200),
      preguntaAporte: z.string().trim().min(1, { message: "La pregunta o aporte es requerido" }).max(500),
      respuesta: z.string().trim().min(1, { message: "La respuesta es requerida" }).max(500)
    })).optional()
  })).min(1, { message: "Debe agregar al menos un tema institucional" }),
  temasFacultad: z.array(z.object({
    tema: z.string().trim().min(1, { message: "El tema es requerido" }).max(200),
    participaciones: z.array(z.object({
      nombreEstudiante: z.string().trim().min(1, { message: "El nombre es requerido" }).max(200),
      preguntaAporte: z.string().trim().min(1, { message: "La pregunta o aporte es requerido" }).max(500),
      respuesta: z.string().trim().min(1, { message: "La respuesta es requerida" }).max(500)
    })).optional()
  })).min(1, { message: "Debe agregar al menos un tema de facultad" }),
  temasPrograma: z.array(z.object({
    tema: z.string().trim().min(1, { message: "El tema es requerido" }).max(200),
    participaciones: z.array(z.object({
      nombreEstudiante: z.string().trim().min(1, { message: "El nombre es requerido" }).max(200),
      preguntaAporte: z.string().trim().min(1, { message: "La pregunta o aporte es requerido" }).max(500),
      respuesta: z.string().trim().min(1, { message: "La respuesta es requerida" }).max(500)
    })).optional()
  })).min(1, { message: "Debe agregar al menos un tema del programa" }),
  // Proposiciones y plan
  proposicionesEstudiantes: z.string().trim().min(1, { message: "Este campo es requerido" }).max(2000),
  planMejoramiento: z.string().trim().min(1, { message: "Este campo es requerido" }).max(2000),
  temasTratados: z.string().trim().min(1, { message: "Los temas tratados son requeridos" }).max(2000),
  acuerdos: z.string().trim().min(1, { message: "Los acuerdos son requeridos" }).max(2000),
  compromisos: z.string().trim().min(1, { message: "Los compromisos son requeridos" }).max(2000),
  responsablesCompromisos: z.string().trim().min(1, { message: "Los responsables de compromisos son requeridos" }).max(1000),
  observaciones: z.string().trim().max(2000).optional(),
  proximaReunion: z.string().trim().max(500).optional(),
});

export const Encuentro3Momento = ({ onComplete, isLocked = false }: Encuentro3MomentoProps) => {
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
      nombreSecretario: '',
      identificacionSecretario: '',
      facultadProgramaSecretario: '',
      correoSecretario: '',
      participantes: '',
      objetivos: '',
      agendaBienvenida: '',
      agendaSecretario: '',
      agendaInforme: '',
      agendaLecturaOrden: '',
      agendaDocumentoCoordinador: '',
      agendaIntervencionEstudiantes: '',
      temasInstitucionales: [{ tema: '', participaciones: [] }],
      temasFacultad: [{ tema: '', participaciones: [] }],
      temasPrograma: [{ tema: '', participaciones: [] }],
      proposicionesEstudiantes: '',
      planMejoramiento: '',
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

  const { fields: temasInstitucionalesFields, append: appendTemaInstitucional, remove: removeTemaInstitucional } = useFieldArray({
    control: actaForm.control,
    name: "temasInstitucionales"
  });

  const { fields: temasFacultadFields, append: appendTemaFacultad, remove: removeTemaFacultad } = useFieldArray({
    control: actaForm.control,
    name: "temasFacultad"
  });

  const { fields: temasProgramaFields, append: appendTemaPrograma, remove: removeTemaPrograma } = useFieldArray({
    control: actaForm.control,
    name: "temasPrograma"
  });

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
                      name="nombreSecretario"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del estudiante designado como secretario</FormLabel>
                          <FormControl>
                            <Input placeholder="Nombre completo del secretario" disabled={isLocked} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={actaForm.control}
                      name="identificacionSecretario"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>N° de identificación</FormLabel>
                          <FormControl>
                            <Input placeholder="Número de identificación" disabled={isLocked} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={actaForm.control}
                      name="facultadProgramaSecretario"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Facultad y programa al que pertenece</FormLabel>
                          <FormControl>
                            <Input placeholder="Facultad y programa académico" disabled={isLocked} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={actaForm.control}
                      name="correoSecretario"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Correo institucional</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="correo@institucion.edu.co" disabled={isLocked} {...field} />
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

                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg">Desarrollo del Encuentro</h4>
                      
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="agenda">
                          <AccordionTrigger className="text-base font-medium">
                            1. AGENDA DEL DÍA
                          </AccordionTrigger>
                          <AccordionContent className="space-y-4 pt-4">
                            <FormField
                              control={actaForm.control}
                              name="agendaBienvenida"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>1.1. Bienvenida y saludo a los asistentes</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Describa la bienvenida y saludo inicial"
                                      className="min-h-[80px]"
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
                              name="agendaSecretario"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>1.2. Designación del secretario</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Describa el proceso de designación del secretario"
                                      className="min-h-[80px]"
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
                              name="agendaInforme"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>1.3. Informe de resultados</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Mencione las fortalezas, mejoras y cumplimientos que ha hecho la Institución"
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
                              name="agendaLecturaOrden"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>1.4. Lectura y aprobación del orden del día</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Describa la lectura y aprobación del orden del día"
                                      className="min-h-[80px]"
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
                              name="agendaDocumentoCoordinador"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>1.5. Lectura del documento expuesto por el coordinador</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Describa el contenido del documento expuesto"
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
                              name="agendaIntervencionEstudiantes"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>1.6. Intervención de los estudiantes</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Registre las intervenciones de los estudiantes"
                                      className="min-h-[100px]"
                                      disabled={isLocked}
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="contenido">
                          <AccordionTrigger className="text-base font-medium">
                            2. CONTENIDO
                          </AccordionTrigger>
                          <AccordionContent className="space-y-6 pt-4">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <FormLabel>2.1. Temas institucionales</FormLabel>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => appendTemaInstitucional({ tema: '', participaciones: [] })}
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Agregar tema
                                </Button>
                              </div>
                              {temasInstitucionalesFields.map((field, index) => (
                                <div key={field.id} className="space-y-3 p-4 border rounded-lg">
                                  <div className="flex gap-2">
                                    <FormField
                                      control={actaForm.control}
                                      name={`temasInstitucionales.${index}.tema`}
                                      render={({ field }) => (
                                        <FormItem className="flex-1">
                                          <FormControl>
                                            <Input
                                              placeholder={`Tema institucional ${index + 1}`}
                                              disabled={isLocked}
                                              {...field}
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    {temasInstitucionalesFields.length > 1 && (
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => removeTemaInstitucional(index)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                  
                                  <ParticipacionesTable
                                    control={actaForm.control}
                                    baseName={`temasInstitucionales.${index}.participaciones`}
                                    isLocked={isLocked}
                                  />
                                </div>
                              ))}
                            </div>

                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <FormLabel>2.2. Temas de facultad</FormLabel>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => appendTemaFacultad({ tema: '', participaciones: [] })}
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Agregar tema
                                </Button>
                              </div>
                              {temasFacultadFields.map((field, index) => (
                                <div key={field.id} className="space-y-3 p-4 border rounded-lg">
                                  <div className="flex gap-2">
                                    <FormField
                                      control={actaForm.control}
                                      name={`temasFacultad.${index}.tema`}
                                      render={({ field }) => (
                                        <FormItem className="flex-1">
                                          <FormControl>
                                            <Input
                                              placeholder={`Tema de facultad ${index + 1}`}
                                              disabled={isLocked}
                                              {...field}
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    {temasFacultadFields.length > 1 && (
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => removeTemaFacultad(index)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                  
                                  <ParticipacionesTable
                                    control={actaForm.control}
                                    baseName={`temasFacultad.${index}.participaciones`}
                                    isLocked={isLocked}
                                  />
                                </div>
                              ))}
                            </div>

                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <FormLabel>2.3. Temas específicos del programa académico</FormLabel>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => appendTemaPrograma({ tema: '', participaciones: [] })}
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Agregar tema
                                </Button>
                              </div>
                              {temasProgramaFields.map((field, index) => (
                                <div key={field.id} className="space-y-3 p-4 border rounded-lg">
                                  <div className="flex gap-2">
                                    <FormField
                                      control={actaForm.control}
                                      name={`temasPrograma.${index}.tema`}
                                      render={({ field }) => (
                                        <FormItem className="flex-1">
                                          <FormControl>
                                            <Input
                                              placeholder={`Tema del programa ${index + 1}`}
                                              disabled={isLocked}
                                              {...field}
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    {temasProgramaFields.length > 1 && (
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => removeTemaPrograma(index)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                  
                                  <ParticipacionesTable
                                    control={actaForm.control}
                                    baseName={`temasPrograma.${index}.participaciones`}
                                    isLocked={isLocked}
                                  />
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="proposiciones">
                          <AccordionTrigger className="text-base font-medium">
                            3. PROPOSICIONES DE LOS ESTUDIANTES
                          </AccordionTrigger>
                          <AccordionContent className="space-y-4 pt-4">
                            <FormField
                              control={actaForm.control}
                              name="proposicionesEstudiantes"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Proposiciones presentadas</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Registre todas las proposiciones presentadas por los estudiantes"
                                      className="min-h-[150px]"
                                      disabled={isLocked}
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="plan-mejoramiento">
                          <AccordionTrigger className="text-base font-medium">
                            4. FORMULACIÓN PLAN DE MEJORAMIENTO
                          </AccordionTrigger>
                          <AccordionContent className="space-y-4 pt-4">
                            <FormField
                              control={actaForm.control}
                              name="planMejoramiento"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Plan de mejoramiento formulado</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Describa el plan de mejoramiento formulado durante el encuentro"
                                      className="min-h-[150px]"
                                      disabled={isLocked}
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>

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
