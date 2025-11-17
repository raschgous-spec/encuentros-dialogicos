import { useState } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  planMejoramiento: z.array(z.object({
    tema: z.string().trim().min(1, { message: "El tema es requerido" }).max(200),
    descripcionNecesidad: z.string().trim().min(1, { message: "La descripción es requerida" }).max(500),
    estrategia: z.string().trim().min(1, { message: "La estrategia es requerida" }).max(300),
    accionesMejora: z.string().trim().min(1, { message: "Las acciones son requeridas" }).max(500),
    responsables: z.string().trim().min(1, { message: "Los responsables son requeridos" }).max(200),
    fechaInicial: z.string().min(1, { message: "La fecha inicial es requerida" }),
    fechaFinal: z.string().min(1, { message: "La fecha final es requerida" }),
    indicadorCumplimiento: z.string().trim().min(1, { message: "El indicador es requerido" }).max(300),
    observaciones: z.string().trim().max(500).optional(),
  })).min(1, { message: "Debe agregar al menos un ítem al plan de mejoramiento" }),
  // Campos adicionales para el formato del plan
  tituloProyecto: z.string().trim().max(300).optional(),
  propositoGeneral: z.string().trim().max(1000).optional(),
  objetivoGeneral: z.string().trim().max(500).optional(),
  objetivosEspecificos: z.array(z.object({
    objetivo: z.string().trim().min(1, { message: "El objetivo es requerido" }).max(500)
  })).optional(),
  indicadoresLogro: z.array(z.object({
    indicador: z.string().trim().min(1, { message: "El indicador es requerido" }).max(500)
  })).optional(),
  seguimiento: z.string().trim().max(1000).optional(),
});

export const Encuentro1Momento = ({ onComplete, isLocked = false }: Encuentro1MomentoProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('acta');
  const [isSaving, setIsSaving] = useState(false);
  
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
      planMejoramiento: [{ 
        tema: '', 
        descripcionNecesidad: '', 
        estrategia: '', 
        accionesMejora: '', 
        responsables: '', 
        fechaInicial: '', 
        fechaFinal: '', 
        indicadorCumplimiento: '', 
        observaciones: '' 
      }],
      tituloProyecto: '',
      propositoGeneral: '',
      objetivoGeneral: '',
      objetivosEspecificos: [],
      indicadoresLogro: [],
      seguimiento: '',
    },
  });

  const { fields: objetivosFields, append: appendObjetivo, remove: removeObjetivo } = useFieldArray({
    control: actaForm.control,
    name: "objetivosEspecificos",
  });

  const { fields: indicadoresFields, append: appendIndicador, remove: removeIndicador } = useFieldArray({
    control: actaForm.control,
    name: "indicadoresLogro",
  });

  const generatePDF = (data: z.infer<typeof actaFormSchema>) => {
    const doc = new jsPDF();
    let yPos = 15;

    // Header - Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('ACTA DE REUNIÓN', 105, yPos, { align: 'center' });
    yPos += 8;
    doc.setFontSize(14);
    doc.text('MOMENTO 3 - ENCUENTRO 1', 105, yPos, { align: 'center' });
    yPos += 12;

    // Meeting Information Section
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN GENERAL', 20, yPos);
    yPos += 7;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${data.fecha}`, 20, yPos);
    doc.text(`Lugar: ${data.lugar}`, 120, yPos);
    yPos += 5;
    doc.text(`Hora de inicio: ${data.horaInicio}`, 20, yPos);
    doc.text(`Hora de finalización: ${data.horaFin}`, 120, yPos);
    yPos += 5;
    doc.text(`Facultad: ${data.facultad}`, 20, yPos);
    yPos += 5;
    doc.text(`Programa Académico: ${data.programaAcademico}`, 20, yPos);
    yPos += 5;
    doc.text(`Director: ${data.nombreDirector}`, 20, yPos);
    yPos += 5;
    doc.text(`Responsable: ${data.responsable}`, 20, yPos);
    yPos += 10;

    // Secretary Information
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('SECRETARIO', 20, yPos);
    yPos += 7;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nombre: ${data.nombreSecretario}`, 20, yPos);
    yPos += 5;
    doc.text(`Identificación: ${data.identificacionSecretario}`, 20, yPos);
    yPos += 5;
    doc.text(`Facultad/Programa: ${data.facultadProgramaSecretario}`, 20, yPos);
    yPos += 5;
    doc.text(`Correo: ${data.correoSecretario}`, 20, yPos);
    yPos += 10;

    // Participants
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('PARTICIPANTES', 20, yPos);
    yPos += 7;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const participantesLines = doc.splitTextToSize(data.participantes, 170);
    doc.text(participantesLines, 20, yPos);
    yPos += (participantesLines.length * 5) + 5;

    // Objectives
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('OBJETIVOS', 20, yPos);
    yPos += 7;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const objetivosLines = doc.splitTextToSize(data.objetivos, 170);
    doc.text(objetivosLines, 20, yPos);
    yPos += (objetivosLines.length * 5) + 10;

    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    // Agenda
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('AGENDA DEL DÍA', 20, yPos);
    yPos += 5;

    autoTable(doc, {
      startY: yPos,
      head: [['Punto', 'Descripción']],
      body: [
        ['1. Bienvenida', data.agendaBienvenida],
        ['2. Verificación de quórum y nombramiento de secretario', data.agendaSecretario],
        ['3. Informe de gestión', data.agendaInforme],
        ['4. Lectura del orden del día', data.agendaLecturaOrden],
        ['5. Documento del coordinador', data.agendaDocumentoCoordinador],
        ['6. Intervención de estudiantes', data.agendaIntervencionEstudiantes],
      ],
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [66, 139, 202], fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 130 }
      }
    });

    // Get final Y position after table
    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Topics - Institucionales
    if (data.temasInstitucionales && data.temasInstitucionales.length > 0) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('TEMAS INSTITUCIONALES', 20, yPos);
      yPos += 5;

      data.temasInstitucionales.forEach((temaObj, index) => {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${temaObj.tema}`, 20, yPos);
        yPos += 5;

        if (temaObj.participaciones && temaObj.participaciones.length > 0) {
          autoTable(doc, {
            startY: yPos,
            head: [['Estudiante', 'Pregunta/Aporte', 'Respuesta']],
            body: temaObj.participaciones.map(p => [
              p.nombreEstudiante,
              p.preguntaAporte,
              p.respuesta
            ]),
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [66, 139, 202] },
          });
          yPos = (doc as any).lastAutoTable.finalY + 7;
        }

        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
      });
    }

    // Topics - Facultad
    if (data.temasFacultad && data.temasFacultad.length > 0) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('TEMAS DE FACULTAD', 20, yPos);
      yPos += 5;

      data.temasFacultad.forEach((temaObj, index) => {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${temaObj.tema}`, 20, yPos);
        yPos += 5;

        if (temaObj.participaciones && temaObj.participaciones.length > 0) {
          autoTable(doc, {
            startY: yPos,
            head: [['Estudiante', 'Pregunta/Aporte', 'Respuesta']],
            body: temaObj.participaciones.map(p => [
              p.nombreEstudiante,
              p.preguntaAporte,
              p.respuesta
            ]),
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [66, 139, 202] },
          });
          yPos = (doc as any).lastAutoTable.finalY + 7;
        }

        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
      });
    }

    // Topics - Programa
    if (data.temasPrograma && data.temasPrograma.length > 0) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('TEMAS DEL PROGRAMA', 20, yPos);
      yPos += 5;

      data.temasPrograma.forEach((temaObj, index) => {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${temaObj.tema}`, 20, yPos);
        yPos += 5;

        if (temaObj.participaciones && temaObj.participaciones.length > 0) {
          autoTable(doc, {
            startY: yPos,
            head: [['Estudiante', 'Pregunta/Aporte', 'Respuesta']],
            body: temaObj.participaciones.map(p => [
              p.nombreEstudiante,
              p.preguntaAporte,
              p.respuesta
            ]),
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [66, 139, 202] },
          });
          yPos = (doc as any).lastAutoTable.finalY + 7;
        }

        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
      });
    }

    // Proposiciones
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('PROPOSICIONES DE LOS ESTUDIANTES', 20, yPos);
    yPos += 7;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const proposicionesLines = doc.splitTextToSize(data.proposicionesEstudiantes, 170);
    doc.text(proposicionesLines, 20, yPos);
    yPos += (proposicionesLines.length * 5) + 10;

    // Improvement Plan
    if (data.planMejoramiento && data.planMejoramiento.length > 0) {
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('PLAN DE MEJORAMIENTO', 20, yPos);
      yPos += 5;

      autoTable(doc, {
        startY: yPos,
        head: [['No.', 'Tema', 'Descripción', 'Estrategia', 'Acciones', 'Responsables', 'F. Inicial', 'F. Final', 'Indicador', 'Observaciones']],
        body: data.planMejoramiento.map((item, index) => [
          (index + 1).toString(),
          item.tema,
          item.descripcionNecesidad,
          item.estrategia,
          item.accionesMejora,
          item.responsables,
          item.fechaInicial,
          item.fechaFinal,
          item.indicadorCumplimiento,
          item.observaciones || '-'
        ]),
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: [66, 139, 202], fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 10 },
        }
      });
    }

    doc.save(`acta-encuentro1-${data.fecha}.pdf`);
  };

  const onSubmitActa = async (data: z.infer<typeof actaFormSchema>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para guardar el acta",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Save to database
      const { error } = await supabase
        .from('actas_encuentro')
        .upsert({
          estudiante_id: user.id,
          momento: 'encuentro1',
          fecha: data.fecha,
          lugar: data.lugar,
          hora_inicio: data.horaInicio,
          hora_fin: data.horaFin,
          facultad: data.facultad,
          programa_academico: data.programaAcademico,
          nombre_director: data.nombreDirector,
          responsable: data.responsable,
          nombre_secretario: data.nombreSecretario,
          identificacion_secretario: data.identificacionSecretario,
          facultad_programa_secretario: data.facultadProgramaSecretario,
          correo_secretario: data.correoSecretario,
          participantes: data.participantes,
          objetivos: data.objetivos,
          agenda_bienvenida: data.agendaBienvenida,
          agenda_secretario: data.agendaSecretario,
          agenda_informe: data.agendaInforme,
          agenda_lectura_orden: data.agendaLecturaOrden,
          agenda_documento_coordinador: data.agendaDocumentoCoordinador,
          agenda_intervencion_estudiantes: data.agendaIntervencionEstudiantes,
          temas_institucionales: data.temasInstitucionales,
          temas_facultad: data.temasFacultad,
          temas_programa: data.temasPrograma,
          proposiciones_estudiantes: data.proposicionesEstudiantes,
          plan_mejoramiento: data.planMejoramiento,
        });

      if (error) throw error;

      // Generate PDF
      generatePDF(data);

      toast({
        title: "Acta guardada exitosamente",
        description: "El acta se ha guardado en la base de datos y se ha descargado el PDF",
      });

      // Switch to plan tab
      setActiveTab('plan');

    } catch (error) {
      console.error('Error al guardar acta:', error);
      toast({
        title: "Error al guardar",
        description: "Hubo un problema al guardar el acta",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
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

  const { fields: planMejoramientoFields, append: appendPlanMejoramiento, remove: removePlanMejoramiento } = useFieldArray({
    control: actaForm.control,
    name: "planMejoramiento"
  });

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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
                            {planMejoramientoFields.map((item, index) => (
                              <div key={item.id} className="border rounded-lg p-4 space-y-4 bg-card">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium">Ítem {index + 1}</h4>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removePlanMejoramiento(index)}
                                    disabled={planMejoramientoFields.length === 1}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <FormField
                                    control={actaForm.control}
                                    name={`planMejoramiento.${index}.tema`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Tema</FormLabel>
                                        <FormControl>
                                          <Input placeholder="Ingrese el tema" disabled={isLocked} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <FormField
                                    control={actaForm.control}
                                    name={`planMejoramiento.${index}.estrategia`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Estrategia</FormLabel>
                                        <FormControl>
                                          <Input placeholder="Ingrese la estrategia" disabled={isLocked} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>

                                <FormField
                                  control={actaForm.control}
                                  name={`planMejoramiento.${index}.descripcionNecesidad`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Descripción de la Necesidad</FormLabel>
                                      <FormControl>
                                        <Textarea 
                                          placeholder="Describa la necesidad identificada"
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
                                  name={`planMejoramiento.${index}.accionesMejora`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Acciones de Mejora</FormLabel>
                                      <FormControl>
                                        <Textarea 
                                          placeholder="Describa las acciones de mejora"
                                          className="min-h-[80px]"
                                          disabled={isLocked}
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <FormField
                                    control={actaForm.control}
                                    name={`planMejoramiento.${index}.responsables`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Responsables</FormLabel>
                                        <FormControl>
                                          <Input placeholder="Ingrese los responsables" disabled={isLocked} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <FormField
                                    control={actaForm.control}
                                    name={`planMejoramiento.${index}.indicadorCumplimiento`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Indicador de Cumplimiento</FormLabel>
                                        <FormControl>
                                          <Input placeholder="Ingrese el indicador" disabled={isLocked} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <FormField
                                    control={actaForm.control}
                                    name={`planMejoramiento.${index}.fechaInicial`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Fecha Inicial</FormLabel>
                                        <FormControl>
                                          <Input type="date" disabled={isLocked} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <FormField
                                    control={actaForm.control}
                                    name={`planMejoramiento.${index}.fechaFinal`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Fecha Final</FormLabel>
                                        <FormControl>
                                          <Input type="date" disabled={isLocked} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>

                                <FormField
                                  control={actaForm.control}
                                  name={`planMejoramiento.${index}.observaciones`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Observaciones (Opcional)</FormLabel>
                                      <FormControl>
                                        <Textarea 
                                          placeholder="Observaciones adicionales"
                                          className="min-h-[60px]"
                                          disabled={isLocked}
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            ))}

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => appendPlanMejoramiento({ 
                                tema: '', 
                                descripcionNecesidad: '', 
                                estrategia: '', 
                                accionesMejora: '', 
                                responsables: '', 
                                fechaInicial: '', 
                                fechaFinal: '', 
                                indicadorCumplimiento: '', 
                                observaciones: '' 
                              })}
                              className="w-full"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Agregar ítem al plan
                            </Button>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="detalle-plan">
                          <AccordionTrigger className="text-base font-medium">
                            5. DETALLE DEL PLAN DE MEJORAMIENTO
                          </AccordionTrigger>
                          <AccordionContent className="space-y-4 pt-4">
                            <FormField
                              control={actaForm.control}
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
                              control={actaForm.control}
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
                              control={actaForm.control}
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
                                    control={actaForm.control}
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
                                    control={actaForm.control}
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
                              control={actaForm.control}
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
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLocked || isSaving}>
                      {isSaving ? 'Guardando...' : 'Guardar Acta'}
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
                    Visualización del plan de mejoramiento formulado en el acta
                  </p>
                </div>
                
                {actaForm.watch('planMejoramiento').length > 0 && actaForm.watch('planMejoramiento')[0].tema ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-border">
                      <thead>
                        <tr className="bg-muted">
                          <th className="border border-border p-2 text-left text-sm font-medium">No.</th>
                          <th className="border border-border p-2 text-left text-sm font-medium">Tema</th>
                          <th className="border border-border p-2 text-left text-sm font-medium">Descripción de la Necesidad</th>
                          <th className="border border-border p-2 text-left text-sm font-medium">Estrategia</th>
                          <th className="border border-border p-2 text-left text-sm font-medium">Acciones de Mejora</th>
                          <th className="border border-border p-2 text-left text-sm font-medium">Responsables</th>
                          <th className="border border-border p-2 text-left text-sm font-medium">Fecha Inicial</th>
                          <th className="border border-border p-2 text-left text-sm font-medium">Fecha Final</th>
                          <th className="border border-border p-2 text-left text-sm font-medium">Indicador de Cumplimiento</th>
                          <th className="border border-border p-2 text-left text-sm font-medium">Observaciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {actaForm.watch('planMejoramiento').map((item, index) => (
                          <tr key={index} className="hover:bg-muted/50">
                            <td className="border border-border p-2 text-sm">{index + 1}</td>
                            <td className="border border-border p-2 text-sm">{item.tema || '-'}</td>
                            <td className="border border-border p-2 text-sm">{item.descripcionNecesidad || '-'}</td>
                            <td className="border border-border p-2 text-sm">{item.estrategia || '-'}</td>
                            <td className="border border-border p-2 text-sm">{item.accionesMejora || '-'}</td>
                            <td className="border border-border p-2 text-sm">{item.responsables || '-'}</td>
                            <td className="border border-border p-2 text-sm">{item.fechaInicial || '-'}</td>
                            <td className="border border-border p-2 text-sm">{item.fechaFinal || '-'}</td>
                            <td className="border border-border p-2 text-sm">{item.indicadorCumplimiento || '-'}</td>
                            <td className="border border-border p-2 text-sm">{item.observaciones || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <Alert>
                    <AlertDescription>
                      El plan de mejoramiento se mostrará aquí una vez que complete y guarde la sección "4. FORMULACIÓN PLAN DE MEJORAMIENTO" en el acta.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Formato detallado del Plan de Mejoramiento */}
                {actaForm.watch('planMejoramiento').length > 0 && actaForm.watch('planMejoramiento')[0].tema && (
                  <div className="mt-8 space-y-6 rounded-lg border bg-card p-6">
                    <div className="text-center border-b pb-4">
                      <h2 className="text-xl font-bold">MODELO DE PLAN DE MEJORAMIENTO – MOMENTO 1</h2>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="border-b pb-2">
                          <label className="text-sm font-semibold">Título del proyecto:</label>
                          <p className="mt-1 text-sm">{actaForm.watch('tituloProyecto') || actaForm.watch('programaAcademico') || '_____________________'}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="border-b pb-2">
                            <label className="text-sm font-semibold">Duración:</label>
                            <p className="mt-1 text-sm">
                              {actaForm.watch('fecha') && actaForm.watch('horaInicio') && actaForm.watch('horaFin')
                                ? `${actaForm.watch('fecha')} - ${actaForm.watch('horaInicio')} a ${actaForm.watch('horaFin')}`
                                : '__________________'}
                            </p>
                          </div>

                          <div className="border-b pb-2">
                            <label className="text-sm font-semibold">Responsables:</label>
                            <p className="mt-1 text-sm">{actaForm.watch('responsable') || '____________'}</p>
                          </div>
                        </div>

                        <div className="border-b pb-2">
                          <label className="text-sm font-semibold">Participantes:</label>
                          <p className="mt-1 text-sm whitespace-pre-wrap">{actaForm.watch('participantes') || '_______________'}</p>
                        </div>

                        <div className="border-b pb-2">
                          <label className="text-sm font-semibold">Propósito general del momento:</label>
                          <p className="mt-1 text-sm">{actaForm.watch('propositoGeneral') || actaForm.watch('objetivos') || '____________'}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h3 className="text-base font-semibold mb-2">1. Objetivo general</h3>
                          <p className="text-sm pl-4">{actaForm.watch('objetivoGeneral') || actaForm.watch('objetivos') || '___________________'}</p>
                        </div>

                        <div>
                          <h3 className="text-base font-semibold mb-2">2. Objetivos específicos</h3>
                          <ol className="list-decimal list-inside pl-4 space-y-1">
                            {actaForm.watch('objetivosEspecificos') && actaForm.watch('objetivosEspecificos')!.length > 0 ? (
                              actaForm.watch('objetivosEspecificos')!.map((obj, index) => (
                                <li key={index} className="text-sm">{obj.objetivo || '___________'}</li>
                              ))
                            ) : (
                              actaForm.watch('planMejoramiento').map((item, index) => (
                                <li key={index} className="text-sm">{item.accionesMejora || '___________'}</li>
                              ))
                            )}
                          </ol>
                        </div>

                        <div>
                          <h3 className="text-base font-semibold mb-2">3. Actividades sugeridas</h3>
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-border text-sm">
                              <thead>
                                <tr className="bg-muted">
                                  <th className="border border-border p-2 text-left font-medium">Actividad</th>
                                  <th className="border border-border p-2 text-left font-medium">Descripción</th>
                                  <th className="border border-border p-2 text-left font-medium">Responsables</th>
                                  <th className="border border-border p-2 text-left font-medium">Producto esperado</th>
                                  <th className="border border-border p-2 text-left font-medium">Evidencia digital</th>
                                </tr>
                              </thead>
                              <tbody>
                                {actaForm.watch('planMejoramiento').map((item, index) => (
                                  <tr key={index} className="hover:bg-muted/50">
                                    <td className="border border-border p-2">{item.tema || '_______'}</td>
                                    <td className="border border-border p-2">{item.descripcionNecesidad || '______________'}</td>
                                    <td className="border border-border p-2">{item.responsables || '______________'}</td>
                                    <td className="border border-border p-2">{item.estrategia || '______________'}</td>
                                    <td className="border border-border p-2">{item.observaciones || '__________________'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-base font-semibold mb-2">4. Indicadores de logro</h3>
                          <div className="pl-4 space-y-1">
                            {actaForm.watch('indicadoresLogro') && actaForm.watch('indicadoresLogro')!.length > 0 ? (
                              actaForm.watch('indicadoresLogro')!.map((ind, index) => (
                                <p key={index} className="text-sm">• {ind.indicador || '_______________'}</p>
                              ))
                            ) : (
                              actaForm.watch('planMejoramiento').map((item, index) => (
                                <p key={index} className="text-sm">• {item.indicadorCumplimiento || '_______________'}</p>
                              ))
                            )}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-base font-semibold mb-2">5. Seguimiento</h3>
                          {actaForm.watch('seguimiento') ? (
                            <p className="text-sm pl-4">{actaForm.watch('seguimiento')}</p>
                          ) : (
                            <p className="text-sm pl-4">
                              Periodo: {actaForm.watch('planMejoramiento')[0]?.fechaInicial || '__________'} al {actaForm.watch('planMejoramiento')[0]?.fechaFinal || '__________'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
