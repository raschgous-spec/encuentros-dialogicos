import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { HierarchicalFilters, FilterValues } from '@/components/filters/HierarchicalFilters';
import { CheckCircle2, AlertTriangle, XCircle, ArrowLeft, User, ChevronDown } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface CumplimientoRow {
  sede: string;
  facultad: string;
  programa: string;
  totalAutorizados: number;
  conEncuentro1: number;
  conEncuentro2: number;
  conEncuentro3: number;
  conEncuentro4: number;
  cumplimientoTotal: number;
}

interface ActaDetail {
  id: string;
  estudiante_id: string;
  momento: string;
  fecha: string;
  lugar: string;
  facultad: string;
  programa_academico: string;
  created_at: string;
}

interface StudentDetail {
  correo: string;
  nombre_completo: string;
  profileId: string | null;
  actas: ActaDetail[];
  momentosCompletados: string[];
}

const MOMENTOS = ['encuentro1', 'encuentro2', 'encuentro3', 'encuentro4'] as const;
const MOMENTO_LABELS: Record<string, string> = {
  encuentro1: 'Encuentro 1',
  encuentro2: 'Encuentro 2',
  encuentro3: 'Encuentro 3',
  encuentro4: 'Encuentro 4',
};

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

export const ActasCumplimiento = ({ onFilterChange }: { onFilterChange?: (filter: { sede: string; facultad: string; programa: string } | null) => void }) => {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Array<{ id: string; email: string; full_name: string | null }>>([]);
  const [estAutorizados, setEstAutorizados] = useState<Array<{ correo: string; sede: string; facultad: string; programa: string; nombre_completo: string }>>([]);
  const [actas, setActas] = useState<ActaDetail[]>([]);
  const [filters, setFilters] = useState<FilterValues>({ sede: '', facultad: '', programa: '' });
  const [expandedLevel, setExpandedLevel] = useState<'sede' | 'facultad' | 'programa'>('sede');
  const [selectedPrograma, setSelectedPrograma] = useState<{ sede: string; facultad: string; programa: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [p, ea, ac] = await Promise.all([
          paginate('profiles', 'id, email, full_name'),
          paginate('estudiantes_autorizados', 'correo, sede, facultad, programa, nombre_completo'),
          paginate('actas_encuentro', 'id, estudiante_id, momento, fecha, lugar, facultad, programa_academico, created_at'),
        ]);
        setProfiles(p);
        setEstAutorizados(ea);
        setActas(ac);
      } catch (e) {
        console.error('Error loading cumplimiento data:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const emailToId = useMemo(() => {
    const map = new Map<string, string>();
    profiles.forEach(p => map.set(p.email?.toLowerCase(), p.id));
    return map;
  }, [profiles]);




  const studentActaMomentos = useMemo(() => {
    const map = new Map<string, Set<string>>();
    actas.forEach(a => {
      if (!map.has(a.estudiante_id)) map.set(a.estudiante_id, new Set());
      map.get(a.estudiante_id)!.add(a.momento);
    });
    return map;
  }, [actas]);

  const stats = useMemo((): CumplimientoRow[] => {
    let filtered = estAutorizados;
    if (filters.sede) filtered = filtered.filter(e => e.sede === filters.sede);
    if (filters.facultad) filtered = filtered.filter(e => e.facultad === filters.facultad);
    if (filters.programa) filtered = filtered.filter(e => e.programa === filters.programa);

    const groups = new Map<string, { sede: string; facultad: string; programa: string; correos: string[] }>();
    filtered.forEach(e => {
      const key = `${e.sede}|||${e.facultad}|||${e.programa}`;
      if (!groups.has(key)) groups.set(key, { sede: e.sede, facultad: e.facultad, programa: e.programa, correos: [] });
      groups.get(key)!.correos.push(e.correo?.toLowerCase());
    });

    const result: CumplimientoRow[] = [];
    groups.forEach(({ sede, facultad, programa, correos }) => {
      const ids = correos.map(c => emailToId.get(c)).filter(Boolean) as string[];
      const total = correos.length;
      const conEncuentro1 = ids.filter(id => studentActaMomentos.get(id)?.has('encuentro1')).length;
      const conEncuentro2 = ids.filter(id => studentActaMomentos.get(id)?.has('encuentro2')).length;
      const conEncuentro3 = ids.filter(id => studentActaMomentos.get(id)?.has('encuentro3')).length;
      const conEncuentro4 = ids.filter(id => studentActaMomentos.get(id)?.has('encuentro4')).length;
      const conTodos = ids.filter(id => {
        const s = studentActaMomentos.get(id);
        return s && MOMENTOS.every(m => s.has(m));
      }).length;
      result.push({ sede, facultad, programa, totalAutorizados: total, conEncuentro1, conEncuentro2, conEncuentro3, conEncuentro4, cumplimientoTotal: total > 0 ? Math.round((conTodos / total) * 100) : 0 });
    });
    return result.sort((a, b) => a.sede.localeCompare(b.sede) || a.facultad.localeCompare(b.facultad) || a.programa.localeCompare(b.programa));
  }, [estAutorizados, filters, emailToId, studentActaMomentos]);

  const sedeStats = useMemo(() => {
    const map = new Map<string, CumplimientoRow>();
    stats.forEach(s => {
      const existing = map.get(s.sede);
      if (!existing) { map.set(s.sede, { ...s }); return; }
      existing.totalAutorizados += s.totalAutorizados;
      existing.conEncuentro1 += s.conEncuentro1;
      existing.conEncuentro2 += s.conEncuentro2;
      existing.conEncuentro3 += s.conEncuentro3;
      existing.conEncuentro4 += s.conEncuentro4;
    });
    map.forEach((v, k) => {
      const allComplete = stats.filter(s => s.sede === k).reduce((sum, s) => sum + (s.totalAutorizados > 0 ? Math.round(s.cumplimientoTotal * s.totalAutorizados / 100) : 0), 0);
      v.cumplimientoTotal = v.totalAutorizados > 0 ? Math.round((allComplete / v.totalAutorizados) * 100) : 0;
    });
    return Array.from(map.values()).sort((a, b) => a.sede.localeCompare(b.sede));
  }, [stats]);

  const facultadStats = useMemo(() => {
    const map = new Map<string, CumplimientoRow>();
    stats.forEach(s => {
      const key = `${s.sede}|||${s.facultad}`;
      const existing = map.get(key);
      if (!existing) { map.set(key, { ...s }); return; }
      existing.totalAutorizados += s.totalAutorizados;
      existing.conEncuentro1 += s.conEncuentro1;
      existing.conEncuentro2 += s.conEncuentro2;
      existing.conEncuentro3 += s.conEncuentro3;
      existing.conEncuentro4 += s.conEncuentro4;
    });
    map.forEach((v, k) => {
      const relatedPrograms = stats.filter(s => `${s.sede}|||${s.facultad}` === k);
      const allComplete = relatedPrograms.reduce((sum, s) => sum + (s.totalAutorizados > 0 ? Math.round(s.cumplimientoTotal * s.totalAutorizados / 100) : 0), 0);
      v.cumplimientoTotal = v.totalAutorizados > 0 ? Math.round((allComplete / v.totalAutorizados) * 100) : 0;
    });
    return Array.from(map.values()).sort((a, b) => a.sede.localeCompare(b.sede) || a.facultad.localeCompare(b.facultad));
  }, [stats]);

  const totals = useMemo(() => ({
    autorizados: stats.reduce((s, r) => s + r.totalAutorizados, 0),
    enc1: stats.reduce((s, r) => s + r.conEncuentro1, 0),
    enc2: stats.reduce((s, r) => s + r.conEncuentro2, 0),
    enc3: stats.reduce((s, r) => s + r.conEncuentro3, 0),
    enc4: stats.reduce((s, r) => s + r.conEncuentro4, 0),
  }), [stats]);

  const globalCumplimiento = totals.autorizados > 0
    ? Math.round((stats.reduce((sum, s) => sum + Math.round(s.cumplimientoTotal * s.totalAutorizados / 100), 0) / totals.autorizados) * 100)
    : 0;

  // Drill-down: students for selected programa
  const programaStudents = useMemo((): StudentDetail[] => {
    if (!selectedPrograma) return [];
    const programaEstudiantes = estAutorizados.filter(e =>
      e.sede === selectedPrograma.sede && e.facultad === selectedPrograma.facultad && e.programa === selectedPrograma.programa
    );

    return programaEstudiantes.map(est => {
      const profileId = emailToId.get(est.correo?.toLowerCase()) || null;
      const studentActas = profileId ? actas.filter(a => a.estudiante_id === profileId) : [];
      const momentosCompletados = profileId ? Array.from(studentActaMomentos.get(profileId) || []) : [];
      return {
        correo: est.correo,
        nombre_completo: est.nombre_completo,
        profileId,
        actas: studentActas,
        momentosCompletados,
      };
    }).sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo));
  }, [selectedPrograma, estAutorizados, emailToId, actas, studentActaMomentos]);

  const getCumplimientoBadge = (pct: number) => {
    if (pct >= 75) return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle2 className="h-3 w-3 mr-1" />{pct}%</Badge>;
    if (pct >= 40) return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><AlertTriangle className="h-3 w-3 mr-1" />{pct}%</Badge>;
    return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="h-3 w-3 mr-1" />{pct}%</Badge>;
  };

  const pctBar = (count: number, total: number) => {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
      <div className="flex items-center gap-2">
        <Progress value={pct} className="h-2 flex-1" />
        <span className="text-xs text-muted-foreground w-16 text-right">{count}/{total}</span>
      </div>
    );
  };

  const displayData = expandedLevel === 'sede' ? sedeStats : expandedLevel === 'facultad' ? facultadStats : stats;

  const handleRowClick = (row: CumplimientoRow) => {
    if (expandedLevel === 'sede') {
      setFilters({ sede: row.sede, facultad: '', programa: '' });
      setExpandedLevel('facultad');
    } else if (expandedLevel === 'facultad') {
      setFilters({ sede: row.sede, facultad: row.facultad, programa: '' });
      setExpandedLevel('programa');
    } else {
      // programa level → show students detail
      setSelectedPrograma({ sede: row.sede, facultad: row.facultad, programa: row.programa });
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF('landscape');
    const pw = doc.internal.pageSize.getWidth();
    let y = 15;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('CUMPLIMIENTO DE ACTAS POR ENCUENTRO', pw / 2, y, { align: 'center' });
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const filterText = (filters.sede || filters.facultad || filters.programa)
      ? `${filters.sede || 'Todas'}${filters.facultad ? ' > ' + filters.facultad : ''}${filters.programa ? ' > ' + filters.programa : ''}`
      : 'Sin filtros';
    doc.text(`Filtro: ${filterText} | Vista: ${expandedLevel} | Fecha: ${new Date().toLocaleDateString('es-CO')}`, pw / 2, y, { align: 'center' });
    y += 10;
    const headers = expandedLevel === 'programa'
      ? ['Sede', 'Facultad', 'Programa', 'Autoriz.', 'Enc.1', 'Enc.2', 'Enc.3', 'Enc.4', 'Cumpl.']
      : expandedLevel === 'facultad'
        ? ['Sede', 'Facultad', 'Autoriz.', 'Enc.1', 'Enc.2', 'Enc.3', 'Enc.4', 'Cumpl.']
        : ['Sede', 'Autoriz.', 'Enc.1', 'Enc.2', 'Enc.3', 'Enc.4', 'Cumpl.'];
    const body = displayData.map(r => {
      const base = [r.totalAutorizados.toString(), r.conEncuentro1.toString(), r.conEncuentro2.toString(), r.conEncuentro3.toString(), r.conEncuentro4.toString(), `${r.cumplimientoTotal}%`];
      if (expandedLevel === 'programa') return [r.sede, r.facultad, r.programa, ...base];
      if (expandedLevel === 'facultad') return [r.sede, r.facultad, ...base];
      return [r.sede, ...base];
    });
    autoTable(doc, { startY: y, head: [headers], body, theme: 'grid', headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' }, styles: { fontSize: 7, cellPadding: 2 } });
    doc.save(`cumplimiento_actas_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-5">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-24" />)}</div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  // Detail view for a selected programa
  if (selectedPrograma) {
    const conActas = programaStudents.filter(s => s.actas.length > 0).length;
    const sinActas = programaStudents.filter(s => s.actas.length === 0).length;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setSelectedPrograma(null)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Volver
          </Button>
          <div>
            <h3 className="text-lg font-semibold">Actas: {selectedPrograma.programa}</h3>
            <p className="text-sm text-muted-foreground">{selectedPrograma.sede} &gt; {selectedPrograma.facultad}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Total Estudiantes</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{programaStudents.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Con Actas</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-green-600">{conActas}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Sin Actas</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-red-600">{sinActas}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Cumplimiento</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{programaStudents.length > 0 ? Math.round((conActas / programaStudents.length) * 100) : 0}%</div>
              <Progress value={programaStudents.length > 0 ? (conActas / programaStudents.length) * 100 : 0} className="h-2 mt-1" />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Estudiantes y sus Actas</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium">Estudiante</th>
                    <th className="text-left py-3 px-2 font-medium">Correo</th>
                    {MOMENTOS.map(m => (
                      <th key={m} className="text-center py-3 px-2 font-medium">{MOMENTO_LABELS[m]}</th>
                    ))}
                    <th className="text-center py-3 px-2 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {programaStudents.map((student, i) => (
                    <tr key={student.correo} className={i % 2 === 0 ? 'bg-muted/50' : ''}>
                      <td className="py-2 px-2 text-xs font-medium flex items-center gap-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        {student.nombre_completo}
                      </td>
                      <td className="py-2 px-2 text-xs text-muted-foreground">{student.correo}</td>
                      {MOMENTOS.map(m => {
                        const tiene = student.momentosCompletados.includes(m);
                        const acta = student.actas.find(a => a.momento === m);
                        return (
                          <td key={m} className="text-center py-2 px-2">
                            {tiene ? (
                              <div className="flex flex-col items-center gap-0.5">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                {acta && <span className="text-[10px] text-muted-foreground">{new Date(acta.fecha).toLocaleDateString('es-CO')}</span>}
                              </div>
                            ) : (
                              <XCircle className="h-4 w-4 text-red-400 mx-auto" />
                            )}
                          </td>
                        );
                      })}
                      <td className="text-center py-2 px-2">
                        <Badge variant={student.actas.length === 4 ? 'default' : student.actas.length > 0 ? 'secondary' : 'outline'}>
                          {student.actas.length}/4
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {programaStudents.length === 0 && <p className="text-center text-muted-foreground py-8">No hay estudiantes autorizados para este programa</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Cumplimiento de Actas por Encuentro</h3>
        <p className="text-sm text-muted-foreground">Haz clic en una fila para desglosar el contenido hasta ver las actas individuales</p>
      </div>

      <Card>
        <CardContent className="pt-4">
          <HierarchicalFilters
            data={estAutorizados}
            filters={filters}
            onFilterChange={(f) => { setFilters(f); setSelectedPrograma(null); }}
            onExportPDF={handleExportPDF}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Autorizados</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{totals.autorizados}</div></CardContent>
        </Card>
        {MOMENTOS.map((m, i) => (
          <Card key={m}>
            <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">{MOMENTO_LABELS[m]}</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{[totals.enc1, totals.enc2, totals.enc3, totals.enc4][i]}</div>
              {pctBar([totals.enc1, totals.enc2, totals.enc3, totals.enc4][i], totals.autorizados)}
            </CardContent>
          </Card>
        ))}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Cumplimiento</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalCumplimiento}%</div>
            <Progress value={globalCumplimiento} className="h-2 mt-1" />
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        {(['sede', 'facultad', 'programa'] as const).map(level => (
          <Button key={level} variant={expandedLevel === level ? 'default' : 'outline'} size="sm" onClick={() => setExpandedLevel(level)}>
            {level === 'sede' ? 'Por Sede' : level === 'facultad' ? 'Por Facultad' : 'Por Programa'}
          </Button>
        ))}
      </div>

      <Collapsible>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardTitle className="text-base flex items-center justify-between">
                <span>
                  Detalle de Cumplimiento - {expandedLevel === 'sede' ? 'Por Sede' : expandedLevel === 'facultad' ? 'Por Facultad' : 'Por Programa'}
                  <span className="text-xs font-normal text-muted-foreground ml-2">(clic en una fila para desglosar)</span>
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-medium">Sede</th>
                      {(expandedLevel === 'facultad' || expandedLevel === 'programa') && <th className="text-left py-3 px-2 font-medium">Facultad</th>}
                      {expandedLevel === 'programa' && <th className="text-left py-3 px-2 font-medium">Programa</th>}
                      <th className="text-center py-3 px-2 font-medium">Autoriz.</th>
                      <th className="text-center py-3 px-2 font-medium">Enc. 1</th>
                      <th className="text-center py-3 px-2 font-medium">Enc. 2</th>
                      <th className="text-center py-3 px-2 font-medium">Enc. 3</th>
                      <th className="text-center py-3 px-2 font-medium">Enc. 4</th>
                      <th className="text-center py-3 px-2 font-medium">Cumpl.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayData.map((row, i) => (
                      <tr
                        key={`${row.sede}-${row.facultad}-${row.programa}-${i}`}
                        className={`cursor-pointer hover:bg-accent/50 transition-colors ${i % 2 === 0 ? 'bg-muted/50' : ''}`}
                        onClick={() => handleRowClick(row)}
                      >
                        <td className="py-2 px-2 text-xs font-medium text-primary underline-offset-2 hover:underline">{row.sede}</td>
                        {(expandedLevel === 'facultad' || expandedLevel === 'programa') && <td className="py-2 px-2 text-xs">{row.facultad}</td>}
                        {expandedLevel === 'programa' && <td className="py-2 px-2 text-xs">{row.programa}</td>}
                        <td className="text-center py-2 px-2"><Badge variant="secondary">{row.totalAutorizados}</Badge></td>
                        <td className="text-center py-2 px-2">{pctBar(row.conEncuentro1, row.totalAutorizados)}</td>
                        <td className="text-center py-2 px-2">{pctBar(row.conEncuentro2, row.totalAutorizados)}</td>
                        <td className="text-center py-2 px-2">{pctBar(row.conEncuentro3, row.totalAutorizados)}</td>
                        <td className="text-center py-2 px-2">{pctBar(row.conEncuentro4, row.totalAutorizados)}</td>
                        <td className="text-center py-2 px-2">{getCumplimientoBadge(row.cumplimientoTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {displayData.length === 0 && <p className="text-center text-muted-foreground py-8">No hay datos para los filtros seleccionados</p>}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
};
