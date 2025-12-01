import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Target, Lightbulb, Lock, ClipboardList, Plus, Trash2, Download } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ProblemaContextCard } from '@/components/evaluation/ProblemaContextCard';
import { useNivelatorioProblematica } from '@/hooks/useNivelatorioProblematica';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Textarea } from '@/components/ui/textarea';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Helper function to add logo to PDF
const addLogoToPDF = (doc: jsPDF, yPosition: number = 10): number => {
  const logo = new Image();
  logo.src = '/logo-udec.png';
  
  try {
    const logoWidth = 60;
    const logoHeight = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const xPosition = (pageWidth - logoWidth) / 2;
    
    doc.addImage(logo, 'PNG', xPosition, yPosition, logoWidth, logoHeight);
    return yPosition + logoHeight + 10;
  } catch (error) {
    console.error('Error adding logo to PDF:', error);
    return yPosition;
  }
};

interface Encuentro4MomentoProps {
  onComplete?: () => void;
  isLocked?: boolean;
}

const planFormSchema = z.object({
  tituloProyecto: z.string().trim().max(300).optional(),
  propositoGeneral: z.string().trim().max(1000).optional(),
  objetivoGeneral: z.string().trim().max(500).optional(),
  objetivosEspecificos: z.array(z.object({
    objetivo: z.string().trim().min(1, { message: "El objetivo es requerido" }).max(500)
  })).optional(),
  planMejoramiento: z.array(z.object({
    tema: z.string().trim().max(200).optional(),
    descripcionNecesidad: z.string().trim().max(500).optional(),
    estrategia: z.string().trim().max(300).optional(),
    accionesMejora: z.string().trim().max(500).optional(),
    responsables: z.string().trim().max(200).optional(),
    fechaInicial: z.string().optional(),
    fechaFinal: z.string().optional(),
    indicadorCumplimiento: z.string().trim().max(300).optional(),
    observaciones: z.string().trim().max(500).optional(),
  })).optional(),
  indicadoresLogro: z.array(z.object({
    indicador: z.string().trim().min(1, { message: "El indicador es requerido" }).max(500)
  })).optional(),
  seguimiento: z.string().trim().max(1000).optional(),
});

export const Encuentro4Momento = ({ onComplete, isLocked = false }: Encuentro4MomentoProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { problematica, loading: loadingProblematica } = useNivelatorioProblematica();
  const [activeTab, setActiveTab] = useState('info');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const planForm = useForm<z.infer<typeof planFormSchema>>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      tituloProyecto: '',
      propositoGeneral: '',
      objetivoGeneral: '',
      objetivosEspecificos: [],
      planMejoramiento: [],
      indicadoresLogro: [],
      seguimiento: '',
    },
  });

  // Load data from previous encuentros
  useEffect(() => {
    const loadPlanData = async () => {
      if (!user) return;

      try {
        // Try to load from encuentro4 first, then fallback to encuentro3
        const { data: currentData } = await supabase
          .from('actas_encuentro')
          .select('plan_mejoramiento')
          .eq('estudiante_id', user.id)
          .eq('momento', 'encuentro4')
          .maybeSingle();

        if (currentData?.plan_mejoramiento) {
          const plan = currentData.plan_mejoramiento as any;
          planForm.reset({
            tituloProyecto: plan.tituloProyecto || '',
            propositoGeneral: plan.propositoGeneral || '',
            objetivoGeneral: plan.objetivoGeneral || '',
            objetivosEspecificos: plan.objetivosEspecificos || [],
            planMejoramiento: Array.isArray(plan) ? plan : (plan.planMejoramiento || []),
            indicadoresLogro: plan.indicadoresLogro || [],
            seguimiento: plan.seguimiento || '',
          });
        } else {
          // Load from previous encuentro (3, 2, or 1)
          const { data: prevData } = await supabase
            .from('actas_encuentro')
            .select('plan_mejoramiento')
            .eq('estudiante_id', user.id)
            .in('momento', ['encuentro3', 'encuentro2', 'encuentro1'])
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (prevData?.plan_mejoramiento) {
            const plan = prevData.plan_mejoramiento as any;
            planForm.reset({
              tituloProyecto: plan.tituloProyecto || '',
              propositoGeneral: plan.propositoGeneral || '',
              objetivoGeneral: plan.objetivoGeneral || '',
              objetivosEspecificos: plan.objetivosEspecificos || [],
              planMejoramiento: Array.isArray(plan) ? plan : (plan.planMejoramiento || []),
              indicadoresLogro: plan.indicadoresLogro || [],
              seguimiento: plan.seguimiento || '',
            });
          }
        }
      } catch (error) {
        console.error('Error loading plan data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlanData();
  }, [user, planForm]);

  const { fields: objetivosFields, append: appendObjetivo, remove: removeObjetivo } = useFieldArray({
    control: planForm.control,
    name: "objetivosEspecificos",
  });

  const { fields: indicadoresFields, append: appendIndicador, remove: removeIndicador } = useFieldArray({
    control: planForm.control,
    name: "indicadoresLogro",
  });

  const generatePDF = (data: z.infer<typeof planFormSchema>) => {
    const doc = new jsPDF();
    let yPos = 10;

    // Add logo at the top
    yPos = addLogoToPDF(doc, yPos);

    // Header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('PLAN DE MEJORAMIENTO DIGITAL', 105, yPos, { align: 'center' });
    yPos += 8;
    doc.setFontSize(14);
    doc.text('MOMENTO 6 - ENCUENTRO 4', 105, yPos, { align: 'center' });
    yPos += 12;

    // Problemática Context
    if (problematica) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('PROBLEMÁTICA SELECCIONADA', 20, yPos);
      yPos += 7;
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      // Show filters for translocal problems
      if (problematica.tipo === 'translocal') {
        if (problematica.unidad_regional) {
          doc.text(`Unidad Regional: ${problematica.unidad_regional}`, 20, yPos);
          yPos += 5;
        }
        if (problematica.facultad) {
          const facultadText = `Facultad: ${problematica.facultad}`;
          const splitFacultad = doc.splitTextToSize(facultadText, 170);
          doc.text(splitFacultad, 20, yPos);
          yPos += splitFacultad.length * 5;
        }
        if (problematica.programa_academico) {
          const programaText = `Programa Académico: ${problematica.programa_academico}`;
          const splitPrograma = doc.splitTextToSize(programaText, 170);
          doc.text(splitPrograma, 20, yPos);
          yPos += splitPrograma.length * 5;
        }
        yPos += 3;
      }
      
      const dimensionText = `Dimensión: ${problematica.dimension}`;
      const splitDimension = doc.splitTextToSize(dimensionText, 170);
      doc.text(splitDimension, 20, yPos);
      yPos += splitDimension.length * 5;
      
      const problemaText = `Problema: ${problematica.problematica}`;
      const splitProblema = doc.splitTextToSize(problemaText, 170);
      doc.text(splitProblema, 20, yPos);
      yPos += splitProblema.length * 5 + 10;
    }

    // Plan Information
    if (data.tituloProyecto) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('TÍTULO DEL PROYECTO', 20, yPos);
      yPos += 7;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const titleText = doc.splitTextToSize(data.tituloProyecto, 170);
      doc.text(titleText, 20, yPos);
      yPos += titleText.length * 5 + 5;
    }

    if (data.propositoGeneral) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('PROPÓSITO GENERAL', 20, yPos);
      yPos += 7;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const propText = doc.splitTextToSize(data.propositoGeneral, 170);
      doc.text(propText, 20, yPos);
      yPos += propText.length * 5 + 5;
    }

    if (data.objetivoGeneral) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('OBJETIVO GENERAL', 20, yPos);
      yPos += 7;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const objText = doc.splitTextToSize(data.objetivoGeneral, 170);
      doc.text(objText, 20, yPos);
      yPos += objText.length * 5 + 5;
    }

    // Objetivos Específicos
    if (data.objetivosEspecificos && data.objetivosEspecificos.length > 0) {
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('OBJETIVOS ESPECÍFICOS', 20, yPos);
      yPos += 7;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      data.objetivosEspecificos.forEach((obj, index) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        const objText = doc.splitTextToSize(`${index + 1}. ${obj.objetivo}`, 170);
        doc.text(objText, 20, yPos);
        yPos += objText.length * 5 + 3;
      });
      yPos += 5;
    }

    // Plan de Mejoramiento Table
    if (data.planMejoramiento && data.planMejoramiento.length > 0) {
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('ACCIONES DE MEJORAMIENTO', 20, yPos);
      yPos += 7;

      autoTable(doc, {
        startY: yPos,
        head: [['Tema', 'Necesidad', 'Estrategia', 'Acciones', 'Responsables', 'Fecha Inicial', 'Fecha Final', 'Indicador']],
        body: data.planMejoramiento.map(item => [
          item.tema || '',
          item.descripcionNecesidad || '',
          item.estrategia || '',
          item.accionesMejora || '',
          item.responsables || '',
          item.fechaInicial || '',
          item.fechaFinal || '',
          item.indicadorCumplimiento || ''
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        margin: { left: 20, right: 20 },
      });
      yPos = (doc as any).lastAutoTable.finalY + 10;
    }

    // Indicadores de Logro
    if (data.indicadoresLogro && data.indicadoresLogro.length > 0) {
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('INDICADORES DE LOGRO', 20, yPos);
      yPos += 7;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      data.indicadoresLogro.forEach((ind, index) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        const indText = doc.splitTextToSize(`${index + 1}. ${ind.indicador}`, 170);
        doc.text(indText, 20, yPos);
        yPos += indText.length * 5 + 3;
      });
      yPos += 5;
    }

    // Seguimiento
    if (data.seguimiento) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('SEGUIMIENTO', 20, yPos);
      yPos += 7;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const segText = doc.splitTextToSize(data.seguimiento, 170);
      doc.text(segText, 20, yPos);
    }

    doc.save(`plan-mejoramiento-encuentro4-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleComplete = () => {
    const formData = planForm.getValues();
    generatePDF(formData);
    if (onComplete) {
      onComplete();
    }
  };

  const onSubmitPlan = async (data: z.infer<typeof planFormSchema>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para guardar",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('actas_encuentro')
        .upsert({
          estudiante_id: user.id,
          momento: 'encuentro4',
          fecha: new Date().toISOString().split('T')[0],
          lugar: '',
          hora_inicio: null,
          hora_fin: null,
          facultad: '',
          programa_academico: '',
          nombre_director: '',
          responsable: '',
          nombre_secretario: '',
          identificacion_secretario: '',
          facultad_programa_secretario: '',
          correo_secretario: '',
          participantes: '',
          objetivos: '',
          agenda_bienvenida: '',
          agenda_secretario: '',
          agenda_informe: '',
          agenda_lectura_orden: '',
          agenda_documento_coordinador: '',
          agenda_intervencion_estudiantes: '',
          temas_institucionales: [],
          temas_facultad: [],
          temas_programa: [],
          proposiciones_estudiantes: '',
          plan_mejoramiento: data as any,
        }, {
          onConflict: 'estudiante_id,momento'
        });

      if (error) throw error;

      toast({
        title: "Plan guardado exitosamente",
        description: "Los cambios se han guardado correctamente",
      });

    } catch (error) {
      console.error('Error al guardar:', error);
      toast({
        title: "Error al guardar",
        description: "Hubo un problema al guardar el plan",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {isLocked && (
        <Alert variant="destructive">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Este momento está bloqueado. Debes completar el Momento 5 - Encuentro 3 para poder desarrollar este encuentro.
          </AlertDescription>
        </Alert>
      )}

      {/* Problemática del Nivelatorio */}
      {!loadingProblematica && problematica && (
        <ProblemaContextCard
          tipo={problematica.tipo}
          dimension={problematica.dimension}
          problematica={problematica.problematica}
          caracteristicas={problematica.caracteristicas}
          unidad_regional={problematica.unidad_regional}
          facultad={problematica.facultad}
          programa_academico={problematica.programa_academico}
        />
      )}

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>MOMENTO 6 - ENCUENTRO 4</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info" disabled={isLocked}>
                Información
              </TabsTrigger>
              <TabsTrigger value="plan" className="flex items-center gap-2" disabled={isLocked}>
                <ClipboardList className="h-4 w-4" />
                PLAN DE MEJORAMIENTO DIGITAL
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4">
              <div className="rounded-lg border bg-card p-6">
                <p className="text-muted-foreground mb-4">
                  Contenido del cuarto encuentro dialógico.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                  <li>Cierre y consolidación de conocimientos</li>
                  <li>Presentación de proyectos finales</li>
                  <li>Autovaloración y covaloración</li>
                  <li>Planificación de acciones futuras</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="plan" className="space-y-4">
              <div className="rounded-lg border bg-card p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Plan de Mejoramiento Digital</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Actualiza y complementa el plan de mejoramiento del proyecto
                    </p>
                  </div>
                  <Button
                    onClick={async () => {
                      if (!user) return;
                      const { generateConsolidatedPlanPDF } = await import('@/utils/pdfExport');
                      await generateConsolidatedPlanPDF(user.id, problematica);
                    }}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Descargar Plan Consolidado
                  </Button>
                </div>

                <Form {...planForm}>
                  <form onSubmit={planForm.handleSubmit(onSubmitPlan)} className="space-y-6">
                    <FormField
                      control={planForm.control}
                      name="tituloProyecto"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título del proyecto</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Título del proyecto de mejoramiento"
                              disabled={isLocked}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={planForm.control}
                      name="propositoGeneral"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Propósito general del momento</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describa el propósito general"
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
                      control={planForm.control}
                      name="objetivoGeneral"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Objetivo general</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Objetivo general del plan"
                              className="min-h-[80px]"
                              disabled={isLocked}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-3">
                      <Label>Objetivos específicos</Label>
                      {objetivosFields.map((item, index) => (
                        <div key={item.id} className="flex gap-2">
                          <FormField
                            control={planForm.control}
                            name={`objetivosEspecificos.${index}.objetivo`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input 
                                    placeholder={`Objetivo específico ${index + 1}`}
                                    disabled={isLocked}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeObjetivo(index)}
                            disabled={isLocked}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendObjetivo({ objetivo: '' })}
                        disabled={isLocked}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar objetivo específico
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <Label>Indicadores de logro</Label>
                      {indicadoresFields.map((item, index) => (
                        <div key={item.id} className="flex gap-2">
                          <FormField
                            control={planForm.control}
                            name={`indicadoresLogro.${index}.indicador`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input 
                                    placeholder={`Indicador de logro ${index + 1}`}
                                    disabled={isLocked}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeIndicador(index)}
                            disabled={isLocked}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendIndicador({ indicador: '' })}
                        disabled={isLocked}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar indicador de logro
                      </Button>
                    </div>

                    <FormField
                      control={planForm.control}
                      name="seguimiento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seguimiento</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Descripción del seguimiento del plan"
                              className="min-h-[80px]"
                              disabled={isLocked}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" disabled={isLocked || isSaving}>
                      {isSaving ? 'Guardando...' : 'Guardar Plan de Mejoramiento'}
                    </Button>
                  </form>
                </Form>
              </div>

              {/* Visualización del plan */}
              {(planForm.watch('tituloProyecto') || planForm.watch('objetivosEspecificos')?.length > 0) && (
                <div className="mt-8 space-y-6 rounded-lg border bg-card p-6">
                  <div className="text-center border-b pb-4">
                    <h2 className="text-xl font-bold">MODELO DE PLAN DE MEJORAMIENTO – MOMENTO 6</h2>
                  </div>

                  <div className="space-y-4">
                    {planForm.watch('tituloProyecto') && (
                      <div className="border-b pb-2">
                        <label className="text-sm font-semibold">Título del proyecto:</label>
                        <p className="mt-1 text-sm">{planForm.watch('tituloProyecto')}</p>
                      </div>
                    )}

                    {planForm.watch('propositoGeneral') && (
                      <div className="border-b pb-2">
                        <label className="text-sm font-semibold">Propósito general del momento:</label>
                        <p className="mt-1 text-sm">{planForm.watch('propositoGeneral')}</p>
                      </div>
                    )}

                    {planForm.watch('objetivoGeneral') && (
                      <div>
                        <h3 className="text-base font-semibold mb-2">1. Objetivo general</h3>
                        <p className="text-sm pl-4">{planForm.watch('objetivoGeneral')}</p>
                      </div>
                    )}

                    {planForm.watch('objetivosEspecificos') && planForm.watch('objetivosEspecificos')!.length > 0 && (
                      <div>
                        <h3 className="text-base font-semibold mb-2">2. Objetivos específicos</h3>
                        <ol className="list-decimal list-inside pl-4 space-y-1">
                          {planForm.watch('objetivosEspecificos')!.map((obj, index) => (
                            <li key={index} className="text-sm">{obj.objetivo}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {planForm.watch('indicadoresLogro') && planForm.watch('indicadoresLogro')!.length > 0 && (
                      <div>
                        <h3 className="text-base font-semibold mb-2">3. Indicadores de logro</h3>
                        <div className="pl-4 space-y-1">
                          {planForm.watch('indicadoresLogro')!.map((ind, index) => (
                            <p key={index} className="text-sm">• {ind.indicador}</p>
                          ))}
                        </div>
                      </div>
                    )}

                    {planForm.watch('seguimiento') && (
                      <div>
                        <h3 className="text-base font-semibold mb-2">4. Seguimiento</h3>
                        <p className="text-sm pl-4">{planForm.watch('seguimiento')}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {onComplete && (
            <div className="mt-6">
              <Button onClick={handleComplete} className="w-full" disabled={isLocked}>
                {isLocked ? 'Momento Bloqueado' : 'Marcar como Completado'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
