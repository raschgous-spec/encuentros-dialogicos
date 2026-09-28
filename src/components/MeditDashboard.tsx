import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gamepad2, Award, AlertTriangle, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface S { id: string; facultad: string | null; insignia: string | null; puntaje_global: number | null; niveles: any; finished_at: string | null; }

const COMP = [
  { n: '1', label: 'Métodos de investigación' },
  { n: '2', label: 'Fases de investigación' },
  { n: '3', label: 'Solución de problemas' },
];
const INSIGNIAS = ['Estratega de Soluciones', 'Metodólogo', 'Investigador Táctico'];

const celda = (v: number | null) =>
  v === null ? 'bg-muted text-muted-foreground' : v >= 80 ? 'bg-level-avanzado text-level-avanzado-fg' : v >= 55 ? 'bg-level-intermedio text-level-intermedio-fg' : 'bg-level-basico text-level-basico-fg';

export const MeditDashboard = ({ showPlay = true }: { showPlay?: boolean }) => {
  const navigate = useNavigate();
  const [data, setData] = useState<S[]>([]);
  useEffect(() => {
    (supabase as any).from('medit_sesiones').select('id, facultad, insignia, puntaje_global, niveles, finished_at').not('finished_at', 'is', null).limit(5000)
      .then(({ data }: any) => setData(data || []));
  }, []);

  const stats = useMemo(() => {
    const dist: Record<string, number> = {};
    INSIGNIAS.forEach((i) => (dist[i] = 0));
    data.forEach((s) => s.insignia && (dist[s.insignia] = (dist[s.insignia] || 0) + 1));
    const prom = (arr: S[], n: string) => { const v = arr.map((s) => s.niveles?.[n]?.precision).filter((x) => typeof x === 'number'); return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : null; };
    const global = COMP.map((c) => ({ ...c, v: prom(data, c.n) }));
    const brecha = [...global].filter((g) => g.v !== null).sort((a, b) => a.v! - b.v!)[0];
    // Herramienta con más errores
    const err: Record<string, number> = {};
    data.forEach((s) => (s.niveles?.['3']?.detalle || []).forEach((d: any) => { if (!d.correcto) err[d.modulo] = (err[d.modulo] || 0) + 1; }));
    const peorHerr = Object.entries(err).sort((a, b) => b[1] - a[1])[0]?.[0]?.replace('modulo_desarrollo_', '');
    const facs = [...new Set(data.map((s) => s.facultad || 'Sin facultad'))].sort();
    const mapa = facs.map((f) => { const arr = data.filter((s) => (s.facultad || 'Sin facultad') === f); return { f, total: arr.length, vals: COMP.map((c) => prom(arr, c.n)) }; });
    const urgentes = data.filter((s) => (s.puntaje_global ?? 0) < 55).length;
    return { dist, global, brecha, peorHerr, mapa, urgentes };
  }, [data]);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0">
        <CardContent className="p-6 flex flex-col md:flex-row md:items-center gap-4">
          <Gamepad2 className="h-12 w-12 shrink-0" />
          <div className="flex-1">
            <h2 className="text-2xl font-bold">Reto MEDIT: Expedición Investigativa</h2>
            <p className="opacity-90 text-sm">Diagnóstico gamificado de competencias investigativas. Obtén tu insignia y tu ruta para el Momento Nivelatorio.</p>
          </div>
          {showPlay && <Button variant="secondary" size="lg" onClick={() => navigate('/reto-medit')}>Iniciar expedición</Button>}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardDescription className="flex items-center gap-1"><Users className="h-4 w-4" />Evaluados</CardDescription><CardTitle className="text-3xl">{data.length}</CardTitle></CardHeader></Card>
        {INSIGNIAS.map((i) => (
          <Card key={i}><CardHeader className="pb-2"><CardDescription className="flex items-center gap-1"><Award className="h-4 w-4" />{i}</CardDescription>
            <CardTitle className="text-3xl">{stats.dist[i]} <span className="text-sm font-normal text-muted-foreground">{data.length ? Math.round((stats.dist[i] / data.length) * 100) : 0}%</span></CardTitle></CardHeader></Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-warning" />Brecha crítica identificada</CardTitle>
          <CardDescription>
            {stats.brecha ? <>Competencia más débil: <b>{stats.brecha.label}</b> ({stats.brecha.v}% de precisión promedio).</> : 'Aún no hay datos.'}
            {stats.peorHerr && <> Herramienta con más errores: <b className="capitalize">{stats.peorHerr}</b>.</>}
            {' '}{stats.urgentes} gestor(es) requieren nivelación urgente (&lt; 55%).
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader><CardTitle>Mapa de calor por facultad</CardTitle><CardDescription>Precisión promedio por competencia (verde ≥ 80, amarillo ≥ 55, rojo &lt; 55)</CardDescription></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr><th className="text-left p-2">Facultad</th><th className="p-2">N</th>{COMP.map((c) => <th key={c.n} className="p-2">{c.label}</th>)}</tr></thead>
            <tbody>
              {stats.mapa.map((r) => (
                <tr key={r.f}>
                  <td className="p-2 font-medium">{r.f}</td>
                  <td className="p-2 text-center">{r.total}</td>
                  {r.vals.map((v, i) => <td key={i} className="p-1"><div className={cn('rounded-md text-center py-2 font-semibold', celda(v))}>{v ?? '—'}{v !== null && '%'}</div></td>)}
                </tr>
              ))}
              {stats.mapa.length === 0 && <tr><td colSpan={5} className="text-center text-muted-foreground p-6">Sin expediciones finalizadas aún</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};
