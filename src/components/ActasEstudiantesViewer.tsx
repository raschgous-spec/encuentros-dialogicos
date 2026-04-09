import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { FileText, Search, User, Download } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ActasEstadisticas } from '@/components/ActasEstadisticas';
import { ActasCumplimiento } from '@/components/ActasCumplimiento';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ActaConEstudiante {
  id: string;
  estudiante_id: string;
  momento: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  lugar: string;
  facultad: string;
  programa_academico: string;
  nombre_director: string;
  responsable: string;
  nombre_secretario: string;
  identificacion_secretario: string;
  facultad_programa_secretario: string;
  correo_secretario: string;
  participantes: string;
  objetivos: string;
  agenda_bienvenida: string;
  agenda_secretario: string;
  agenda_informe: string;
  agenda_lectura_orden: string;
  agenda_documento_coordinador: string;
  agenda_intervencion_estudiantes: string;
  temas_institucionales: any;
  temas_facultad: any;
  temas_programa: any;
  proposiciones_estudiantes: string;
  plan_mejoramiento: any;
  created_at: string;
  updated_at: string;
  // joined
  full_name?: string;
  email?: string;
}

const momentoLabels: Record<string, string> = {
  encuentro1: 'Momento 3 - Encuentro 1',
  encuentro2: 'Momento 4 - Encuentro 2',
  encuentro3: 'Momento 5 - Encuentro 3',
  encuentro4: 'Momento 6 - Encuentro 4',
};

export const ActasEstudiantesViewer = () => {
  const [actas, setActas] = useState<ActaConEstudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMomento, setFilterMomento] = useState<string>('all');
  const [cumplimientoFilter, setCumplimientoFilter] = useState<{ sede: string; facultad: string; programa: string } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchActas();
  }, []);

  const fetchActas = async () => {
    try {
      // Fetch all actas visible to the coordinator
      let allActas: any[] = [];
      let from = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data: batch, error } = await supabase
          .from('actas_encuentro')
          .select('*')
          .range(from, from + pageSize - 1)
          .order('updated_at', { ascending: false });

        if (error) throw error;
        if (batch && batch.length > 0) {
          allActas = [...allActas, ...batch];
          from += pageSize;
          hasMore = batch.length === pageSize;
        } else {
          hasMore = false;
        }
      }

      // Get unique student IDs and fetch profiles
      const studentIds = [...new Set(allActas.map(a => a.estudiante_id))];
      const profiles: Record<string, { full_name: string; email: string }> = {};

      // Fetch profiles in chunks
      for (let i = 0; i < studentIds.length; i += 500) {
        const chunk = studentIds.slice(i, i + 500);
        const { data: profileBatch } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', chunk);

        if (profileBatch) {
          profileBatch.forEach(p => {
            profiles[p.id] = { full_name: p.full_name || p.email, email: p.email };
          });
        }
      }

      const actasConNombres = allActas.map(acta => ({
        ...acta,
        full_name: profiles[acta.estudiante_id]?.full_name || 'Sin nombre',
        email: profiles[acta.estudiante_id]?.email || '',
      }));

      setActas(actasConNombres);
    } catch (error) {
      console.error('Error fetching actas:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las actas de los estudiantes.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredActas = actas.filter(acta => {
    const matchSearch = !searchTerm || 
      acta.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acta.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchMomento = filterMomento === 'all' || acta.momento === filterMomento;
    return matchSearch && matchMomento;
  });

  const exportActaPDF = async (acta: ActaConEstudiante) => {
    const doc = new jsPDF();
    let yPos = 15;

    // Helper to check page break
    const checkPageBreak = (needed: number = 30) => {
      if (yPos > 270 - needed) { doc.addPage(); yPos = 20; }
    };

    // Header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('ACTA DE REUNIÓN', 105, yPos, { align: 'center' });
    yPos += 8;
    doc.setFontSize(12);
    doc.text(momentoLabels[acta.momento] || acta.momento, 105, yPos, { align: 'center' });
    yPos += 12;

    // --- INFORMACIÓN GENERAL ---
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN GENERAL', 20, yPos);
    yPos += 7;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Estudiante: ${acta.full_name || ''}`, 20, yPos);
    yPos += 5;
    doc.text(`Correo: ${acta.email || ''}`, 20, yPos);
    yPos += 5;
    doc.text(`Fecha: ${acta.fecha || ''}`, 20, yPos);
    doc.text(`Lugar: ${acta.lugar || ''}`, 120, yPos);
    yPos += 5;
    doc.text(`Hora de inicio: ${acta.hora_inicio || ''}`, 20, yPos);
    doc.text(`Hora de finalización: ${acta.hora_fin || ''}`, 120, yPos);
    yPos += 5;
    doc.text(`Facultad: ${acta.facultad || ''}`, 20, yPos);
    yPos += 5;
    doc.text(`Programa Académico: ${acta.programa_academico || ''}`, 20, yPos);
    yPos += 5;
    doc.text(`Director: ${acta.nombre_director || ''}`, 20, yPos);
    yPos += 5;
    doc.text(`Responsable: ${acta.responsable || ''}`, 20, yPos);
    yPos += 10;

    // --- SECRETARIO ---
    checkPageBreak();
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('SECRETARIO', 20, yPos);
    yPos += 7;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nombre: ${acta.nombre_secretario || ''}`, 20, yPos);
    yPos += 5;
    doc.text(`Identificación: ${acta.identificacion_secretario || ''}`, 20, yPos);
    yPos += 5;
    doc.text(`Facultad/Programa: ${acta.facultad_programa_secretario || ''}`, 20, yPos);
    yPos += 5;
    doc.text(`Correo: ${acta.correo_secretario || ''}`, 20, yPos);
    yPos += 10;

    // --- PARTICIPANTES ---
    checkPageBreak();
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('PARTICIPANTES', 20, yPos);
    yPos += 7;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    if (acta.participantes) {
      const lines = doc.splitTextToSize(acta.participantes, 170);
      doc.text(lines, 20, yPos);
      yPos += lines.length * 4.5 + 5;
    }

    // --- OBJETIVOS ---
    checkPageBreak();
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('OBJETIVOS', 20, yPos);
    yPos += 7;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    if (acta.objetivos) {
      const lines = doc.splitTextToSize(acta.objetivos, 170);
      doc.text(lines, 20, yPos);
      yPos += lines.length * 4.5 + 5;
    }

    // --- AGENDA DEL DÍA ---
    checkPageBreak(40);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('AGENDA DEL DÍA', 20, yPos);
    yPos += 5;

    autoTable(doc, {
      startY: yPos,
      head: [['Punto', 'Descripción']],
      body: [
        ['1. Bienvenida', acta.agenda_bienvenida || ''],
        ['2. Verificación de quórum y nombramiento de secretario', acta.agenda_secretario || ''],
        ['3. Informe de gestión', acta.agenda_informe || ''],
        ['4. Lectura del orden del día', acta.agenda_lectura_orden || ''],
        ['5. Documento del coordinador', acta.agenda_documento_coordinador || ''],
        ['6. Intervención de estudiantes', acta.agenda_intervencion_estudiantes || ''],
      ],
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [66, 139, 202], fontStyle: 'bold' },
      columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 130 } },
    });
    yPos = (doc as any).lastAutoTable.finalY + 10;

    // --- Helper for temas sections ---
    const renderTemas = (title: string, temas: any[]) => {
      if (!temas || !Array.isArray(temas) || temas.length === 0) return;
      checkPageBreak(30);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(title, 20, yPos);
      yPos += 5;

      temas.forEach((temaObj: any, index: number) => {
        checkPageBreak();
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${temaObj.tema || ''}`, 20, yPos);
        yPos += 5;

        if (temaObj.participaciones && Array.isArray(temaObj.participaciones) && temaObj.participaciones.length > 0) {
          autoTable(doc, {
            startY: yPos,
            head: [['Estudiante', 'Pregunta/Aporte', 'Respuesta']],
            body: temaObj.participaciones.map((p: any) => [
              p.nombreEstudiante || '',
              p.preguntaAporte || '',
              p.respuesta || '',
            ]),
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [66, 139, 202] },
          });
          yPos = (doc as any).lastAutoTable.finalY + 7;
        }
      });
    };

    renderTemas('TEMAS INSTITUCIONALES', acta.temas_institucionales);
    renderTemas('TEMAS DE FACULTAD', acta.temas_facultad);
    renderTemas('TEMAS DEL PROGRAMA', acta.temas_programa);

    // --- PROPOSICIONES ---
    checkPageBreak();
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('PROPOSICIONES DE LOS ESTUDIANTES', 20, yPos);
    yPos += 7;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    if (acta.proposiciones_estudiantes) {
      const lines = doc.splitTextToSize(acta.proposiciones_estudiantes, 170);
      doc.text(lines, 20, yPos);
      yPos += lines.length * 4.5 + 5;
    }

    // --- PLAN DE MEJORAMIENTO (metadata) ---
    const plan = acta.plan_mejoramiento;
    if (plan && typeof plan === 'object') {
      checkPageBreak(40);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('FORMULACIÓN DEL PLAN DE MEJORAMIENTO', 20, yPos);
      yPos += 7;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');

      if (plan.tituloProyecto) {
        doc.setFont('helvetica', 'bold');
        doc.text('Título del Proyecto:', 20, yPos);
        yPos += 5;
        doc.setFont('helvetica', 'normal');
        const tLines = doc.splitTextToSize(plan.tituloProyecto, 170);
        doc.text(tLines, 20, yPos);
        yPos += tLines.length * 4.5 + 3;
      }

      if (plan.propositoGeneral) {
        checkPageBreak();
        doc.setFont('helvetica', 'bold');
        doc.text('Propósito General:', 20, yPos);
        yPos += 5;
        doc.setFont('helvetica', 'normal');
        const pLines = doc.splitTextToSize(plan.propositoGeneral, 170);
        doc.text(pLines, 20, yPos);
        yPos += pLines.length * 4.5 + 3;
      }

      if (plan.objetivoGeneral) {
        checkPageBreak();
        doc.setFont('helvetica', 'bold');
        doc.text('Objetivo General:', 20, yPos);
        yPos += 5;
        doc.setFont('helvetica', 'normal');
        const oLines = doc.splitTextToSize(plan.objetivoGeneral, 170);
        doc.text(oLines, 20, yPos);
        yPos += oLines.length * 4.5 + 3;
      }

      // --- DETALLE DEL PLAN DE MEJORAMIENTO (table) ---
      const items = plan.planMejoramiento || (Array.isArray(plan) ? plan : []);
      if (Array.isArray(items) && items.length > 0) {
        checkPageBreak(30);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('DETALLE DEL PLAN DE MEJORAMIENTO', 20, yPos);
        yPos += 5;

        autoTable(doc, {
          startY: yPos,
          head: [['No.', 'Tema', 'Descripción', 'Estrategia', 'Acciones', 'Responsables', 'F. Inicial', 'F. Final', 'Indicador', 'Observaciones']],
          body: items.map((item: any, index: number) => [
            (index + 1).toString(),
            item.tema || '',
            item.descripcionNecesidad || '',
            item.estrategia || '',
            item.accionesMejora || '',
            item.responsables || '',
            item.fechaInicial || '',
            item.fechaFinal || '',
            item.indicadorCumplimiento || '',
            item.observaciones || '-',
          ]),
          styles: { fontSize: 7, cellPadding: 2 },
          headStyles: { fillColor: [66, 139, 202], fontStyle: 'bold' },
          columnStyles: { 0: { cellWidth: 10 } },
        });
      }
    }

    // --- LISTA DE ASISTENTES (from uploaded Excel) ---
    const { getAttendanceData, getEvidencePhotos } = await import('@/components/moments/ActaAttachments');
    const attendanceData = await getAttendanceData(acta.estudiante_id, acta.momento);
    if (attendanceData && attendanceData.length > 1) {
      doc.addPage();
      let attY = 20;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('LISTA DE ASISTENTES AL ENCUENTRO', 20, attY);
      attY += 7;
      autoTable(doc, {
        startY: attY,
        head: [attendanceData[0].map(String)],
        body: attendanceData.slice(1).map(row => row.map(cell => String(cell ?? ''))),
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [66, 139, 202], fontStyle: 'bold' },
      });
    }

    // --- EVIDENCIAS FOTOGRÁFICAS ---
    const photoUrls = await getEvidencePhotos(acta.estudiante_id, acta.momento);
    if (photoUrls.length > 0) {
      doc.addPage();
      let pY = 20;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('EVIDENCIAS FOTOGRÁFICAS DEL ENCUENTRO', 20, pY);
      pY += 10;
      for (let i = 0; i < photoUrls.length; i++) {
        try {
          const response = await fetch(photoUrls[i]);
          const blob = await response.blob();
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          if (pY > 180) { doc.addPage(); pY = 20; }
          doc.addImage(dataUrl, 'JPEG', 20, pY, 80, 60);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.text(`Evidencia ${i + 1}`, 20, pY + 65);
          pY += 75;
        } catch (err) { console.error('Error adding photo to PDF:', err); }
      }
    }

    // --- FIRMAS DIGITALES ---
    const { addSignaturesToPDF } = await import('@/components/moments/SignaturePad');
    let sigY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 15 : 20;
    await addSignaturesToPDF(doc, acta.estudiante_id, acta.momento, sigY);

    doc.save(`acta-${acta.momento}-${acta.full_name?.replace(/\s/g, '_')}.pdf`);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Actas de Estudiantes</h2>
        {[1, 2, 3].map(i => (
          <Card key={i}><CardContent className="py-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <ActasEstadisticas />

      {/* Cumplimiento */}
      <ActasCumplimiento />

      <div>
        <h2 className="text-2xl font-bold">Actas de Estudiantes</h2>
        <p className="text-muted-foreground">
          {actas.length} actas generadas por tus estudiantes
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant={filterMomento === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilterMomento('all')}>
            Todos
          </Button>
          {Object.entries(momentoLabels).map(([key, label]) => (
            <Button key={key} variant={filterMomento === key ? 'default' : 'outline'} size="sm" onClick={() => setFilterMomento(key)}>
              {label.split(' - ')[1]}
            </Button>
          ))}
        </div>
      </div>

      {filteredActas.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No se encontraron actas</p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[600px]">
          <Accordion type="single" collapsible className="space-y-2">
            {filteredActas.map((acta) => (
              <AccordionItem key={acta.id} value={acta.id} className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div className="text-left">
                        <p className="font-medium">{acta.full_name}</p>
                        <p className="text-xs text-muted-foreground">{acta.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{momentoLabels[acta.momento] || acta.momento}</Badge>
                      <Badge variant="outline">{acta.fecha}</Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="font-medium">Lugar:</span> {acta.lugar || '-'}</div>
                      <div><span className="font-medium">Facultad:</span> {acta.facultad || '-'}</div>
                      <div><span className="font-medium">Programa:</span> {acta.programa_academico || '-'}</div>
                      <div><span className="font-medium">Director:</span> {acta.nombre_director || '-'}</div>
                    </div>
                    {acta.participantes && (
                      <div className="text-sm">
                        <span className="font-medium">Participantes:</span>
                        <p className="mt-1 text-muted-foreground whitespace-pre-wrap">{acta.participantes}</p>
                      </div>
                    )}
                    {acta.objetivos && (
                      <div className="text-sm">
                        <span className="font-medium">Objetivos:</span>
                        <p className="mt-1 text-muted-foreground whitespace-pre-wrap">{acta.objetivos}</p>
                      </div>
                    )}
                    <Button variant="outline" size="sm" onClick={() => exportActaPDF(acta)}>
                      <Download className="h-4 w-4 mr-2" />
                      Descargar PDF
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      )}
    </div>
  );
};
