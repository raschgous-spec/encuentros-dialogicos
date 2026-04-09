import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, FilterX, Users, FileText, ClipboardCheck, GraduationCap } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface EstadisticasData {
  profiles: Array<{ id: string; email: string; full_name: string | null }>;
  estAutorizados: Array<{ correo: string; sede: string; facultad: string; programa: string; nombre_completo: string }>;
  actas: Array<{ estudiante_id: string; momento: string }>;
  progresos: Array<{ estudiante_id: string; momento: string; completado: boolean | null }>;
  studentEvals: Array<{ user_id: string; momento: string; passed: boolean }>;
}

interface ProgramaStat {
  sede: string;
  programa: string;
  totalAutorizados: number;
  conActas: number;
  hicieronDiagnostico: number;
  hicieronNivelatorio: number;
}

export const ActasEstadisticas = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<EstadisticasData>({ profiles: [], estAutorizados: [], actas: [], progresos: [], studentEvals: [] });
  const [filterSede, setFilterSede] = useState('');
  const [filterPrograma, setFilterPrograma] = useState('');

  const paginate = async (table: string, cols: string) => {
    let all: any[] = [];
    let from = 0;
    const size = 1000;
    let more = true;
    while (more) {
      const { data: batch, error } = await supabase.from(table as any).select(cols).range(from, from + size - 1);
      if (error) throw error;
      if (batch && batch.length > 0) { all = [...all, ...batch]; from += size; more = batch.length === size; }
      else more = false;
    }
    return all;
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [profiles, estAutorizados, actas, progresos, studentEvals] = await Promise.all([
          paginate('profiles', 'id, email, full_name'),
          paginate('estudiantes_autorizados', 'correo, sede, facultad, programa, nombre_completo'),
          paginate('actas_encuentro', 'estudiante_id, momento'),
          paginate('momento_progreso', 'estudiante_id, momento, completado'),
          paginate('student_evaluations', 'user_id, momento, passed'),
        ]);
        setData({ profiles, estAutorizados, actas, progresos, studentEvals });
      } catch (e) {
        console.error('Error loading stats:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const emailToId = useMemo(() => {
    const map = new Map<string, string>();
    data.profiles.forEach(p => map.set(p.email?.toLowerCase(), p.id));
    return map;
  }, [data.profiles]);

  const sedes = useMemo(() => {
    return [...new Set(data.estAutorizados.map(e => e.sede).filter(Boolean))].sort();
  }, [data.estAutorizados]);

  const programas = useMemo(() => {
    let filtered = data.estAutorizados;
    if (filterSede) filtered = filtered.filter(e => e.sede === filterSede);
    return [...new Set(filtered.map(e => e.programa).filter(Boolean))].sort();
  }, [data.estAutorizados, filterSede]);

  const stats = useMemo((): ProgramaStat[] => {
    let filtered = data.estAutorizados;
    if (filterSede) filtered = filtered.filter(e => e.sede === filterSede);
    if (filterPrograma) filtered = filtered.filter(e => e.programa === filterPrograma);

    // Group by sede+programa
    const groups = new Map<string, { sede: string; programa: string; correos: string[] }>();
    filtered.forEach(e => {
      const key = `${e.sede}|||${e.programa}`;
      if (!groups.has(key)) groups.set(key, { sede: e.sede, programa: e.programa, correos: [] });
      groups.get(key)!.correos.push(e.correo?.toLowerCase());
    });

    const actaStudentSet = new Set(data.actas.map(a => a.estudiante_id));

    // Build sets for diagnostico and nivelatorio completion
    const diagCompleted = new Set<string>();
    const nivCompleted = new Set<string>();
    data.progresos.forEach(p => {
      if (p.completado) {
        if (p.momento === 'diagnostico') diagCompleted.add(p.estudiante_id);
        if (p.momento === 'nivelatorio') nivCompleted.add(p.estudiante_id);
      }
    });
    data.studentEvals.forEach(e => {
      if (e.passed) {
        if (e.momento === 'diagnostico') diagCompleted.add(e.user_id);
        if (e.momento === 'nivelatorio') nivCompleted.add(e.user_id);
      }
    });

    const result: ProgramaStat[] = [];
    groups.forEach(({ sede, programa, correos }) => {
      const ids = correos.map(c => emailToId.get(c)).filter(Boolean) as string[];
      const idSet = new Set(ids);
      result.push({
        sede,
        programa,
        totalAutorizados: correos.length,
        conActas: ids.filter(id => actaStudentSet.has(id)).length,
        hicieronDiagnostico: ids.filter(id => diagCompleted.has(id)).length,
        hicieronNivelatorio: ids.filter(id => nivCompleted.has(id)).length,
      });
    });

    return result.sort((a, b) => a.sede.localeCompare(b.sede) || a.programa.localeCompare(b.programa));
  }, [data, filterSede, filterPrograma, emailToId]);

  const totals = useMemo(() => ({
    autorizados: stats.reduce((s, r) => s + r.totalAutorizados, 0),
    conActas: stats.reduce((s, r) => s + r.conActas, 0),
    diagnostico: stats.reduce((s, r) => s + r.hicieronDiagnostico, 0),
    nivelatorio: stats.reduce((s, r) => s + r.hicieronNivelatorio, 0),
  }), [stats]);

  const hasFilters = filterSede || filterPrograma;

  const handleExportPDF = () => {
    const doc = new jsPDF('landscape');
    const pw = doc.internal.pageSize.getWidth();
    let y = 15;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RECUENTO ESTADÍSTICO DE ACTAS Y MOMENTOS', pw / 2, y, { align: 'center' });
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const filterText = hasFilters ? `${filterSede || 'Todas las sedes'}${filterPrograma ? ' > ' + filterPrograma : ''}` : 'Sin filtros';
    doc.text(`Filtro: ${filterText} | Fecha: ${new Date().toLocaleDateString('es-CO')}`, pw / 2, y, { align: 'center' });
    y += 10;

    doc.text(`Total Autorizados: ${totals.autorizados} | Con Actas: ${totals.conActas} | Diagnóstico: ${totals.diagnostico} | Nivelatorio: ${totals.nivelatorio}`, 14, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      head: [['Sede', 'Programa', 'Autorizados', 'Con Actas', 'Diagnóstico', 'Nivelatorio']],
      body: stats.map(s => [s.sede, s.programa, s.totalAutorizados.toString(), s.conActas.toString(), s.hicieronDiagnostico.toString(), s.hicieronNivelatorio.toString()]),
      foot: [['TOTAL', '', totals.autorizados.toString(), totals.conActas.toString(), totals.diagnostico.toString(), totals.nivelatorio.toString()]],
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
      footStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0], fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 3 },
    });

    doc.save(`estadisticas_actas_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}</div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Recuento Estadístico</h3>
        <p className="text-sm text-muted-foreground">Asistentes por programa y sede, diagnósticos y nivelatorios completados</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Sede</Label>
              <Select value={filterSede || '_all'} onValueChange={v => { setFilterSede(v === '_all' ? '' : v); setFilterPrograma(''); }}>
                <SelectTrigger className="w-[220px]"><SelectValue placeholder="Todas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">Todas</SelectItem>
                  {sedes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Programa</Label>
              <Select value={filterPrograma || '_all'} onValueChange={v => setFilterPrograma(v === '_all' ? '' : v)}>
                <SelectTrigger className="w-[260px]"><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">Todos</SelectItem>
                  {programas.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={() => { setFilterSede(''); setFilterPrograma(''); }}>
                <FilterX className="h-4 w-4 mr-1" /> Limpiar
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleExportPDF} className="ml-auto">
              <Download className="h-4 w-4 mr-1" /> Exportar PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Autorizados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{totals.autorizados}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con Actas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{totals.conActas}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diagnóstico</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{totals.diagnostico}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nivelatorio</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{totals.nivelatorio}</div></CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detalle por Programa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-3 font-medium">Sede</th>
                  <th className="text-left py-3 px-3 font-medium">Programa</th>
                  <th className="text-center py-3 px-3 font-medium">Autorizados</th>
                  <th className="text-center py-3 px-3 font-medium">Con Actas</th>
                  <th className="text-center py-3 px-3 font-medium">Diagnóstico</th>
                  <th className="text-center py-3 px-3 font-medium">Nivelatorio</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((row, i) => (
                  <tr key={`${row.sede}-${row.programa}`} className={i % 2 === 0 ? 'bg-muted/50' : ''}>
                    <td className="py-2 px-3">{row.sede}</td>
                    <td className="py-2 px-3">{row.programa}</td>
                    <td className="text-center py-2 px-3">
                      <Badge variant="secondary">{row.totalAutorizados}</Badge>
                    </td>
                    <td className="text-center py-2 px-3">
                      <Badge variant={row.conActas > 0 ? 'default' : 'outline'}>{row.conActas}</Badge>
                    </td>
                    <td className="text-center py-2 px-3">
                      <span className="inline-flex items-center justify-center rounded-full bg-green-100 text-green-800 px-2 py-1 text-xs font-medium">
                        {row.hicieronDiagnostico}
                      </span>
                    </td>
                    <td className="text-center py-2 px-3">
                      <span className="inline-flex items-center justify-center rounded-full bg-blue-100 text-blue-800 px-2 py-1 text-xs font-medium">
                        {row.hicieronNivelatorio}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 font-bold">
                  <td className="py-3 px-3" colSpan={2}>TOTAL</td>
                  <td className="text-center py-3 px-3">{totals.autorizados}</td>
                  <td className="text-center py-3 px-3">{totals.conActas}</td>
                  <td className="text-center py-3 px-3">{totals.diagnostico}</td>
                  <td className="text-center py-3 px-3">{totals.nivelatorio}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
