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

  const exportActaPDF = (acta: ActaConEstudiante) => {
    const doc = new jsPDF();
    let yPos = 15;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('ACTA DE ENCUENTRO', 105, yPos, { align: 'center' });
    yPos += 8;
    doc.setFontSize(12);
    doc.text(momentoLabels[acta.momento] || acta.momento, 105, yPos, { align: 'center' });
    yPos += 12;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Estudiante:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(acta.full_name || '', 55, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Correo:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(acta.email || '', 55, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Fecha:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(acta.fecha || '', 55, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Lugar:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(acta.lugar || '', 55, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Facultad:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(acta.facultad || '', 55, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Programa:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(acta.programa_academico || '', 55, yPos);
    yPos += 10;

    if (acta.participantes) {
      doc.setFont('helvetica', 'bold');
      doc.text('Participantes:', 20, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(acta.participantes, 170);
      doc.text(lines, 20, yPos);
      yPos += lines.length * 5 + 5;
    }

    if (acta.objetivos) {
      if (yPos > 250) { doc.addPage(); yPos = 20; }
      doc.setFont('helvetica', 'bold');
      doc.text('Objetivos:', 20, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(acta.objetivos, 170);
      doc.text(lines, 20, yPos);
      yPos += lines.length * 5 + 5;
    }

    if (acta.proposiciones_estudiantes) {
      if (yPos > 250) { doc.addPage(); yPos = 20; }
      doc.setFont('helvetica', 'bold');
      doc.text('Proposiciones:', 20, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(acta.proposiciones_estudiantes, 170);
      doc.text(lines, 20, yPos);
      yPos += lines.length * 5 + 5;
    }

    // Plan de mejoramiento
    if (acta.plan_mejoramiento && Array.isArray(acta.plan_mejoramiento) && acta.plan_mejoramiento.length > 0) {
      if (yPos > 230) { doc.addPage(); yPos = 20; }
      doc.setFont('helvetica', 'bold');
      doc.text('Plan de Mejoramiento:', 20, yPos);
      yPos += 6;

      autoTable(doc, {
        startY: yPos,
        head: [['Tema', 'Necesidad', 'Estrategia', 'Acciones', 'Responsables']],
        body: acta.plan_mejoramiento.map((item: any) => [
          item.tema || '',
          item.descripcionNecesidad || '',
          item.estrategia || '',
          item.accionesMejora || '',
          item.responsables || '',
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        margin: { left: 20, right: 20 },
      });
    }

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
