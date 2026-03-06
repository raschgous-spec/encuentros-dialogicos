import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { FileText, Clock, TrendingUp, User, Calendar, ChevronRight, Search, Filter, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addLogoToPDF } from '@/utils/pdfExport';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DiagnosticoEval {
  id: string;
  estudiante_id: string;
  fecha: string;
  puntaje_brainstorming: number | null;
  puntaje_affinity: number | null;
  puntaje_ishikawa: number | null;
  puntaje_dofa: number | null;
  puntaje_pareto: number | null;
  puntaje_promedio: number | null;
  nivel: string | null;
  tiempos_respuesta: any;
  full_name: string | null;
  email: string;
  sede?: string;
  facultad?: string;
  programa?: string;
  nombre_coordinador?: string;
  correo_coordinador?: string;
}

interface NivelatorioEval {
  id: string;
  user_id: string;
  momento: string;
  dimension: string;
  problematica: string;
  automatic_score: number;
  max_score: number;
  passed: boolean;
  coordinator_reviewed: boolean;
  coordinator_score: number | null;
  coordinator_comments: string | null;
  completed_at: string;
  full_name: string | null;
  email: string;
  brainstorming_data: any;
  affinity_data: any;
  ishikawa_data: any;
  dofa_data: any;
  pareto_data: any;
  arbol_problemas_data: any;
  sede?: string;
  facultad?: string;
  programa?: string;
  nombre_coordinador?: string;
  correo_coordinador?: string;
}

export const ValoracionesAdminManager = () => {
  const [diagnosticos, setDiagnosticos] = useState<DiagnosticoEval[]>([]);
  const [nivelatorios, setNivelatorios] = useState<NivelatorioEval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDiagnostico, setSelectedDiagnostico] = useState<DiagnosticoEval | null>(null);
  const [selectedNivelatorio, setSelectedNivelatorio] = useState<NivelatorioEval | null>(null);
  const [approvalFilter, setApprovalFilter] = useState<'all' | 'passed' | 'failed'>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchAll();
  }, []);

  const paginateQuery = async (table: string, selectCols: string, filters?: { column: string; value: string }[]) => {
    let allData: any[] = [];
    let from = 0;
    const pageSize = 1000;
    let hasMore = true;
    while (hasMore) {
      let query = supabase.from(table as any).select(selectCols).range(from, from + pageSize - 1);
      if (filters) {
        for (const f of filters) {
          query = query.eq(f.column, f.value);
        }
      }
      const { data: batch, error } = await query;
      if (error) throw error;
      if (batch && batch.length > 0) {
        allData = [...allData, ...batch];
        from += pageSize;
        hasMore = batch.length === pageSize;
      } else {
        hasMore = false;
      }
    }
    return allData;
  };

  const paginateProfiles = async (ids: string[]) => {
    if (ids.length === 0) return [];
    let allProfiles: any[] = [];
    const chunkSize = 500;
    for (let i = 0; i < ids.length; i += chunkSize) {
      const chunk = ids.slice(i, i + chunkSize);
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', chunk);
      if (data) allProfiles = [...allProfiles, ...data];
    }
    return allProfiles;
  };

  const fetchAll = async () => {
    try {
      setIsLoading(true);

      // Fetch estudiantes_autorizados for sede/facultad/programa/coordinador info
      const estAutData = await paginateQuery('estudiantes_autorizados', 'correo, sede, facultad, programa, nombre_coordinador, correo_coordinador');
      const estAutMap = new Map<string, any>();
      estAutData.forEach((ea: any) => {
        estAutMap.set(ea.correo?.toLowerCase(), ea);
      });

      // Fetch all diagnosticos with pagination
      const diagData = await paginateQuery('evaluaciones', '*');
      diagData.sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

      // Fetch profiles for diagnosticos
      const estudianteIds = [...new Set(diagData.map((d: any) => d.estudiante_id))];
      const profilesData = await paginateProfiles(estudianteIds);
      const profilesMap = new Map(profilesData.map((p: any) => [p.id, p]));

      const diagWithNames: DiagnosticoEval[] = diagData.map((d: any) => {
        const profile = profilesMap.get(d.estudiante_id);
        const email = profile?.email || '';
        const estAut = estAutMap.get(email.toLowerCase());
        return {
          ...d,
          full_name: profile?.full_name || null,
          email,
          sede: estAut?.sede || '',
          facultad: estAut?.facultad || '',
          programa: estAut?.programa || '',
          nombre_coordinador: estAut?.nombre_coordinador || '',
          correo_coordinador: estAut?.correo_coordinador || '',
        };
      });

      setDiagnosticos(diagWithNames);

      // Fetch all nivelatorios with pagination
      const nivData = await paginateQuery('student_evaluations', '*', [{ column: 'momento', value: 'nivelatorio' }]);
      nivData.sort((a: any, b: any) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());

      const nivUserIds = [...new Set(nivData.map((n: any) => n.user_id))];
      const nivProfilesData = await paginateProfiles(nivUserIds);
      const nivProfilesMap = new Map(nivProfilesData.map((p: any) => [p.id, p]));

      const nivWithNames: NivelatorioEval[] = nivData.map((n: any) => {
        const profile = nivProfilesMap.get(n.user_id);
        const email = profile?.email || '';
        const estAut = estAutMap.get(email.toLowerCase());
        return {
          ...n,
          full_name: profile?.full_name || null,
          email,
          sede: estAut?.sede || '',
          facultad: estAut?.facultad || '',
          programa: estAut?.programa || '',
          nombre_coordinador: estAut?.nombre_coordinador || '',
          correo_coordinador: estAut?.correo_coordinador || '',
        };
      });

      setNivelatorios(nivWithNames);
    } catch (error) {
      console.error('Error fetching valoraciones:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las valoraciones',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getNivelColor = (nivel: string | null) => {
    switch (nivel?.toLowerCase()) {
      case 'excelente': return 'bg-green-500';
      case 'avanzado': return 'bg-green-500';
      case 'intermedio': return 'bg-blue-500';
      case 'bueno': return 'bg-blue-500';
      case 'basico': return 'bg-yellow-500';
      case 'regular': return 'bg-yellow-500';
      case 'inicial': return 'bg-orange-500';
      case 'insuficiente': return 'bg-red-500';
      default: return 'bg-muted-foreground';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getTotalTime = (tiempos: any): number => {
    if (!tiempos) return 0;
    return Object.values(tiempos).reduce<number>((sum, time) => sum + (Number(time) || 0), 0);
  };

  const filterBySearch = (name: string | null, email: string) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (name?.toLowerCase().includes(term) || email.toLowerCase().includes(term));
  };

  const filteredDiagnosticos = diagnosticos.filter(d => filterBySearch(d.full_name, d.email));
  const filteredNivelatorios = nivelatorios.filter(n => {
    if (!filterBySearch(n.full_name, n.email)) return false;
    if (approvalFilter === 'passed') return n.passed;
    if (approvalFilter === 'failed') return !n.passed;
    return true;
  });

  const aprobadosCount = nivelatorios.filter(n => filterBySearch(n.full_name, n.email) && n.passed).length;
  const noAprobadosCount = nivelatorios.filter(n => filterBySearch(n.full_name, n.email) && !n.passed).length;

  const generateDiagnosticoExportPDF = () => {
    const items = filteredDiagnosticos;
    if (items.length === 0) return;

    const doc = new jsPDF({ orientation: 'landscape' });
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 10;

    yPosition = addLogoToPDF(doc, yPosition);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE DIAGNÓSTICOS - DESAGREGADO', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total: ${items.length} registro(s) | Fecha: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    const tableData = items.map((d, i) => [
      String(i + 1),
      (d.full_name || 'Sin nombre').substring(0, 25),
      d.sede || '-',
      d.facultad || '-',
      (d.programa || '-').substring(0, 20),
      (d.nombre_coordinador || '-').substring(0, 20),
      d.puntaje_brainstorming?.toFixed(0) ?? '-',
      d.puntaje_affinity?.toFixed(0) ?? '-',
      d.puntaje_ishikawa?.toFixed(0) ?? '-',
      d.puntaje_dofa?.toFixed(0) ?? '-',
      d.puntaje_pareto?.toFixed(0) ?? '-',
      d.puntaje_promedio?.toFixed(1) ?? '-',
      d.nivel || '-',
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['#', 'Nombre', 'Sede', 'Facultad', 'Programa', 'Coordinador', 'Brain.', 'Afin.', 'Ishik.', 'DOFA', 'Pareto', 'Prom.', 'Nivel']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold', fontSize: 7 },
      styles: { fontSize: 6, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 8 },
        6: { halign: 'center' as const }, 7: { halign: 'center' as const }, 8: { halign: 'center' as const },
        9: { halign: 'center' as const }, 10: { halign: 'center' as const }, 11: { halign: 'center' as const },
      },
    });

    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.text(`Página ${i} de ${pageCount} | ENCUENTROS DIALÓGICOS - Universidad de Cundinamarca`, pageWidth / 2, doc.internal.pageSize.getHeight() - 8, { align: 'center' });
    }

    doc.save(`diagnosticos_desagregado_${new Date().toISOString().split('T')[0]}.pdf`);
    toast({ title: 'PDF generado', description: 'Reporte de diagnósticos desagregado descargado' });
  };

  const generateNivelatorioExportPDF = () => {
    const items = filteredNivelatorios;
    if (items.length === 0) return;

    const doc = new jsPDF({ orientation: 'landscape' });
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 10;

    yPosition = addLogoToPDF(doc, yPosition);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE NIVELATORIOS - DESAGREGADO', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total: ${items.length} registro(s) | Fecha: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    const tableData = items.map((n, i) => [
      String(i + 1),
      (n.full_name || 'Sin nombre').substring(0, 22),
      n.sede || '-',
      n.facultad || '-',
      (n.programa || '-').substring(0, 18),
      (n.nombre_coordinador || '-').substring(0, 18),
      n.dimension?.substring(0, 12) || '-',
      n.brainstorming_data ? '✓' : '✗',
      n.affinity_data ? '✓' : '✗',
      n.arbol_problemas_data ? '✓' : '✗',
      n.ishikawa_data ? '✓' : '✗',
      n.dofa_data ? '✓' : '✗',
      n.pareto_data ? '✓' : '✗',
      `${n.automatic_score}/${n.max_score}`,
      n.passed ? 'Sí' : 'No',
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['#', 'Nombre', 'Sede', 'Facultad', 'Programa', 'Coordinador', 'Dimensión', 'Brain.', 'Afin.', 'Árbol', 'Ishik.', 'DOFA', 'Pareto', 'Puntaje', 'Aprob.']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold', fontSize: 6.5 },
      styles: { fontSize: 6, cellPadding: 1.5 },
      columnStyles: {
        0: { cellWidth: 7 },
        7: { halign: 'center' as const }, 8: { halign: 'center' as const }, 9: { halign: 'center' as const },
        10: { halign: 'center' as const }, 11: { halign: 'center' as const }, 12: { halign: 'center' as const },
        13: { halign: 'center' as const }, 14: { halign: 'center' as const },
      },
    });

    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.text(`Página ${i} de ${pageCount} | ENCUENTROS DIALÓGICOS - Universidad de Cundinamarca`, pageWidth / 2, doc.internal.pageSize.getHeight() - 8, { align: 'center' });
    }

    doc.save(`nivelatorios_desagregado_${new Date().toISOString().split('T')[0]}.pdf`);
    toast({ title: 'PDF generado', description: 'Reporte de nivelatorios desagregado descargado' });
  };

  const generateNivelatorioPDF = (group: 'passed' | 'failed') => {
    const items = nivelatorios.filter(n => {
      if (!filterBySearch(n.full_name, n.email)) return false;
      return group === 'passed' ? n.passed : !n.passed;
    });

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 10;

    yPosition = addLogoToPDF(doc, yPosition);

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    const title = group === 'passed' ? 'ESTUDIANTES APROBADOS - NIVELATORIO' : 'ESTUDIANTES NO APROBADOS - NIVELATORIO';
    doc.text(title, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total: ${items.length} estudiante(s) | Fecha de generación: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 12;

    const tableData = items.map((n, i) => [
      String(i + 1),
      n.full_name || 'Sin nombre',
      n.email,
      n.dimension,
      `${n.automatic_score}/${n.max_score}`,
      new Date(n.completed_at).toLocaleDateString(),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['#', 'Nombre', 'Correo', 'Dimensión', 'Puntaje', 'Fecha']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: group === 'passed' ? [34, 197, 94] : [239, 68, 68], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 40 },
        2: { cellWidth: 50 },
        3: { cellWidth: 35 },
        4: { cellWidth: 20, halign: 'center' },
        5: { cellWidth: 25, halign: 'center' },
      },
    });

    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Página ${i} de ${pageCount} | ENCUENTROS DIALÓGICOS - Universidad de Cundinamarca`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    const fileName = group === 'passed' ? 'nivelatorio_aprobados' : 'nivelatorio_no_aprobados';
    doc.save(`${fileName}_${new Date().toISOString().split('T')[0]}.pdf`);
    toast({ title: 'PDF generado', description: `Se descargó el listado de ${group === 'passed' ? 'aprobados' : 'no aprobados'}` });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Valoraciones de Usuarios</h2>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Valoraciones de Usuarios</h2>
        <p className="text-muted-foreground">
          {diagnosticos.length} diagnóstico(s) y {nivelatorios.length} nivelatorio(s) completado(s)
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o correo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Contadores por nivel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Diagnósticos por Nivel</CardTitle>
            <CardDescription>Distribución de niveles alcanzados</CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const counts = { avanzado: 0, intermedio: 0, basico: 0, inicial: 0, sin_nivel: 0 };
              filteredDiagnosticos.forEach(d => {
                const n = d.nivel?.toLowerCase();
                if (n === 'avanzado') counts.avanzado++;
                else if (n === 'intermedio') counts.intermedio++;
                else if (n === 'basico' || n === 'básico') counts.basico++;
                else if (n === 'inicial') counts.inicial++;
                else counts.sin_nivel++;
              });
              return (
                <div className="flex flex-wrap gap-3">
                  <Badge variant="outline" className="gap-1 border-green-500 text-green-700"><span className="font-bold">{counts.avanzado}</span> Avanzado</Badge>
                  <Badge variant="outline" className="gap-1 border-blue-500 text-blue-700"><span className="font-bold">{counts.intermedio}</span> Intermedio</Badge>
                  <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-700"><span className="font-bold">{counts.basico}</span> Básico</Badge>
                  <Badge variant="outline" className="gap-1 border-orange-500 text-orange-700"><span className="font-bold">{counts.inicial}</span> Inicial</Badge>
                  {counts.sin_nivel > 0 && <Badge variant="outline" className="gap-1"><span className="font-bold">{counts.sin_nivel}</span> Sin nivel</Badge>}
                </div>
              );
            })()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Nivelatorios por Nivel</CardTitle>
            <CardDescription>Distribución según puntaje obtenido</CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const counts = { avanzado: 0, intermedio: 0, basico: 0 };
              filteredNivelatorios.forEach(n => {
                const pct = n.max_score > 0 ? (n.automatic_score / n.max_score) * 100 : 0;
                if (pct >= 85) counts.avanzado++;
                else if (pct >= 60) counts.intermedio++;
                else counts.basico++;
              });
              return (
                <div className="flex flex-wrap gap-3">
                  <Badge variant="outline" className="gap-1 border-green-500 text-green-700"><span className="font-bold">{counts.avanzado}</span> Avanzado</Badge>
                  <Badge variant="outline" className="gap-1 border-blue-500 text-blue-700"><span className="font-bold">{counts.intermedio}</span> Intermedio</Badge>
                  <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-700"><span className="font-bold">{counts.basico}</span> Básico</Badge>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="diagnosticos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="diagnosticos">
            Diagnósticos ({filteredDiagnosticos.length})
          </TabsTrigger>
          <TabsTrigger value="nivelatorios">
            Nivelatorios ({filteredNivelatorios.length})
          </TabsTrigger>
        </TabsList>

        {/* DIAGNÓSTICOS */}
        <TabsContent value="diagnosticos" className="space-y-3">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={generateDiagnosticoExportPDF} disabled={filteredDiagnosticos.length === 0}>
              <Download className="h-4 w-4 mr-1" />
              Exportar PDF Desagregado
            </Button>
          </div>
          {filteredDiagnosticos.map((evaluacion) => (
            <Card key={evaluacion.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">
                          {evaluacion.full_name || evaluacion.email}
                        </p>
                        <p className="text-xs text-muted-foreground">{evaluacion.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(evaluacion.fecha).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(getTotalTime(evaluacion.tiempos_respuesta))}
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Promedio: {evaluacion.puntaje_promedio?.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getNivelColor(evaluacion.nivel)}>
                      {evaluacion.nivel || 'Sin nivel'}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedDiagnostico(evaluacion)}>
                      Ver detalles
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredDiagnosticos.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No se encontraron diagnósticos.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* NIVELATORIOS */}
        <TabsContent value="nivelatorios" className="space-y-3">
          {/* Filter & Download Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filtrar:</span>
            </div>
            <Button
              variant={approvalFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setApprovalFilter('all')}
            >
              Todos ({aprobadosCount + noAprobadosCount})
            </Button>
            <Button
              variant={approvalFilter === 'passed' ? 'default' : 'outline'}
              size="sm"
              className={approvalFilter === 'passed' ? 'bg-green-600 hover:bg-green-700' : ''}
              onClick={() => setApprovalFilter('passed')}
            >
              Aprobados ({aprobadosCount})
            </Button>
            <Button
              variant={approvalFilter === 'failed' ? 'default' : 'outline'}
              size="sm"
              className={approvalFilter === 'failed' ? 'bg-red-600 hover:bg-red-700' : ''}
              onClick={() => setApprovalFilter('failed')}
            >
              No aprobados ({noAprobadosCount})
            </Button>
            <div className="ml-auto flex gap-2">
              <Button variant="outline" size="sm" onClick={() => generateNivelatorioPDF('passed')} disabled={aprobadosCount === 0}>
                <Download className="h-4 w-4 mr-1" />
                PDF Aprobados
              </Button>
              <Button variant="outline" size="sm" onClick={() => generateNivelatorioPDF('failed')} disabled={noAprobadosCount === 0}>
                <Download className="h-4 w-4 mr-1" />
                PDF No aprobados
              </Button>
              <Button variant="outline" size="sm" onClick={generateNivelatorioExportPDF} disabled={filteredNivelatorios.length === 0}>
                <Download className="h-4 w-4 mr-1" />
                PDF Desagregado
              </Button>
            </div>
          </div>
          {filteredNivelatorios.map((evaluacion) => (
            <Card key={evaluacion.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">
                          {evaluacion.full_name || evaluacion.email}
                        </p>
                        <p className="text-xs text-muted-foreground">{evaluacion.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(evaluacion.completed_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Puntaje: {evaluacion.automatic_score}/{evaluacion.max_score}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {evaluacion.dimension}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      Problemática: {evaluacion.problematica}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={evaluacion.passed ? 'bg-green-500' : 'bg-red-500'}>
                      {evaluacion.passed ? 'Aprobado' : 'No aprobado'}
                    </Badge>
                    {evaluacion.coordinator_reviewed && (
                      <Badge variant="outline">Revisado</Badge>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => setSelectedNivelatorio(evaluacion)}>
                      Ver detalles
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredNivelatorios.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No se encontraron nivelatorios.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal Diagnóstico */}
      <Dialog open={!!selectedDiagnostico} onOpenChange={() => setSelectedDiagnostico(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de Diagnóstico</DialogTitle>
            <DialogDescription>
              {selectedDiagnostico?.full_name || selectedDiagnostico?.email}
            </DialogDescription>
          </DialogHeader>
          {selectedDiagnostico && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estudiante</p>
                  <p className="text-sm">{selectedDiagnostico.full_name}</p>
                  <p className="text-xs text-muted-foreground">{selectedDiagnostico.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha</p>
                  <p className="text-sm">{new Date(selectedDiagnostico.fecha).toLocaleString()}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Puntajes por Herramienta</h4>
                <div className="space-y-2">
                  {[
                    { label: 'Brainstorming', value: selectedDiagnostico.puntaje_brainstorming },
                    { label: 'Diagrama de Afinidad', value: selectedDiagnostico.puntaje_affinity },
                    { label: 'Ishikawa', value: selectedDiagnostico.puntaje_ishikawa },
                    { label: 'DOFA', value: selectedDiagnostico.puntaje_dofa },
                    { label: 'Pareto', value: selectedDiagnostico.puntaje_pareto },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="text-sm">{label}</span>
                      <Badge variant="outline">{value?.toFixed(1) ?? 'N/A'}%</Badge>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t flex justify-between items-center">
                <span className="font-semibold">Promedio Final</span>
                <div className="flex items-center gap-2">
                  <Badge className={getNivelColor(selectedDiagnostico.nivel)}>
                    {selectedDiagnostico.nivel || 'Sin nivel'}
                  </Badge>
                  <span className="text-lg font-bold">{selectedDiagnostico.puntaje_promedio?.toFixed(1)}%</span>
                </div>
              </div>
              {selectedDiagnostico.tiempos_respuesta && (
                <div>
                  <h4 className="font-semibold mb-3">Tiempos por Paso</h4>
                  <div className="space-y-2">
                    {Object.entries(selectedDiagnostico.tiempos_respuesta).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex justify-between items-center text-sm">
                        <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="text-muted-foreground">{formatTime(Number(value) || 0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Nivelatorio */}
      <Dialog open={!!selectedNivelatorio} onOpenChange={() => setSelectedNivelatorio(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de Nivelatorio</DialogTitle>
            <DialogDescription>
              {selectedNivelatorio?.full_name || selectedNivelatorio?.email}
            </DialogDescription>
          </DialogHeader>
          {selectedNivelatorio && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estudiante</p>
                  <p className="text-sm">{selectedNivelatorio.full_name}</p>
                  <p className="text-xs text-muted-foreground">{selectedNivelatorio.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha</p>
                  <p className="text-sm">{new Date(selectedNivelatorio.completed_at).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Dimensión</p>
                <p className="text-sm font-semibold">{selectedNivelatorio.dimension}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Problemática</p>
                <p className="text-sm">{selectedNivelatorio.problematica}</p>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold">Resultado</span>
                  <div className="flex items-center gap-2">
                    <Badge className={selectedNivelatorio.passed ? 'bg-green-500' : 'bg-red-500'}>
                      {selectedNivelatorio.passed ? 'Aprobado' : 'No aprobado'}
                    </Badge>
                    <span className="text-lg font-bold">
                      {selectedNivelatorio.automatic_score}/{selectedNivelatorio.max_score}
                    </span>
                  </div>
                </div>
              </div>

              {selectedNivelatorio.coordinator_reviewed && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">Revisión del Coordinador</p>
                  <p className="text-sm">Puntaje: {selectedNivelatorio.coordinator_score ?? 'N/A'}</p>
                  {selectedNivelatorio.coordinator_comments && (
                    <p className="text-sm text-muted-foreground mt-1">{selectedNivelatorio.coordinator_comments}</p>
                  )}
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-3">Datos por Herramienta</h4>
                <div className="space-y-2">
                  {[
                    { label: 'Brainstorming', data: selectedNivelatorio.brainstorming_data },
                    { label: 'Afinidad', data: selectedNivelatorio.affinity_data },
                    { label: 'Árbol de Problemas', data: selectedNivelatorio.arbol_problemas_data },
                    { label: 'Ishikawa', data: selectedNivelatorio.ishikawa_data },
                    { label: 'DOFA', data: selectedNivelatorio.dofa_data },
                    { label: 'Pareto', data: selectedNivelatorio.pareto_data },
                  ].map(({ label, data }) => (
                    <div key={label} className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="text-sm">{label}</span>
                      <Badge variant={data ? 'outline' : 'secondary'}>
                        {data ? 'Completado' : 'Sin datos'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
