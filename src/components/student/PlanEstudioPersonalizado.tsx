import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BookOpenCheck, Clock, Loader2, RefreshCw, Sparkles, Square } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { readStudyPlanStream } from './studyPlanStream';
import type { StudyContext, StudyPlan } from './studyPlanTypes';

export function PlanEstudioPersonalizado() {
  const [difficulties, setDifficulties] = useState('');
  const [minutes, setMinutes] = useState('30');
  const [context, setContext] = useState<StudyContext | null>(null);
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [blocked, setBlocked] = useState('');
  const [saved, setSaved] = useState(false);
  const controller = useRef<AbortController | null>(null);

  const load = async () => {
    setLoading(true); setLoadError('');
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('student-study-plan', { body: { action: 'load' } });
      if (invokeError || data?.error) throw new Error(data?.error || 'No se pudieron cargar tus resultados y planes.');
      setContext(data.context); setPlans(data.plans); setBlocked(data.blocked || '');
      const latest = data.plans[0] as StudyPlan | undefined;
      if (latest) { setSelectedId(latest.id); setDifficulties(latest.difficulties); setMinutes(String(latest.minutes_per_day)); }
    } catch (e) { setLoadError(e instanceof Error ? e.message : 'No se pudieron cargar tus planes.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); return () => controller.current?.abort(); }, []);

  const generate = async () => {
    if (generating || difficulties.trim().length < 10) return;
    setError(''); setDraft(''); setSaved(false); setGenerating(true);
    const abort = new AbortController(); controller.current = abort;
    let finished = false;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Tu sesión expiró. Ingresa nuevamente.');
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/student-study-plan`, {
        method: 'POST', signal: abort.signal,
        headers: { Authorization: `Bearer ${session.access_token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate', difficulties: difficulties.trim(), minutes: Number(minutes) }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'No se pudo generar el plan de estudio.');
      }
      if (!response.body) throw new Error('No se recibió el plan de estudio.');
      await readStudyPlanStream(response.body, (event, payload) => {
        const data = payload as { text?: string; error?: string; plan?: StudyPlan };
        if (event === 'delta' && data.text) setDraft(previous => previous + data.text);
        if (event === 'context') setContext(payload as StudyContext);
        if (event === 'error') throw new Error(data.error || 'Se interrumpió el plan de estudio.');
        if (event === 'done' && data.plan) {
          const plan = data.plan;
          finished = true; setSaved(true); setPlans(previous => [plan, ...previous].slice(0, 10)); setSelectedId(plan.id);
        }
      });
      if (!finished) throw new Error('La generación terminó antes de guardar el plan.');
    } catch (e) {
      if (abort.signal.aborted) setError('Generación detenida. Tu descripción se conserva.');
      else setError(e instanceof Error ? e.message : 'No se pudo generar el plan de estudio.');
    } finally { setGenerating(false); controller.current = null; }
  };
  const selected = plans.find(plan => plan.id === selectedId);
  const text = draft || selected?.plan || '';
  const shownContext = !draft && selected ? selected.results_snapshot : context;

  return (
    <section className="space-y-6" aria-labelledby="study-plan-title">
      <header className="border-b pb-5">
        <div className="mb-2 flex items-center gap-2 text-primary"><BookOpenCheck className="h-6 w-6" /><h2 id="study-plan-title" className="text-2xl font-bold">Mi plan de estudio</h2></div>
        <Badge variant="secondary">Lovable AI · Apoyo personalizado</Badge>
      </header>
      {loading ? <p className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Cargando tus resultados y planes...</p> : loadError ? (
        <div role="alert" className="space-y-3 text-destructive"><p>{loadError}</p><Button variant="outline" onClick={load}><RefreshCw className="mr-2 h-4 w-4" />Volver a cargar</Button></div>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
            <div className="min-w-0 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="study-difficulties">¿Qué temas todavía te cuestan?</Label>
                <Textarea id="study-difficulties" value={difficulties} onChange={e => setDifficulties(e.target.value)} maxLength={2000} disabled={generating} className="min-h-36" placeholder="Por ejemplo: me cuesta distinguir las causas de los efectos en Ishikawa y priorizar problemas con Pareto." />
                <p className="text-xs text-muted-foreground">Describe tus dudas sin incluir nombres, documentos ni otros datos personales. {difficulties.length}/2000</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="study-minutes">Tiempo disponible por día</Label>
                <Select value={minutes} onValueChange={setMinutes} disabled={generating}>
                  <SelectTrigger id="study-minutes"><SelectValue /></SelectTrigger>
                  <SelectContent>{[15, 30, 45, 60].map(value => <SelectItem key={value} value={String(value)}>{value} minutos</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {blocked && <p role="alert" className="text-sm text-destructive">{blocked}</p>}
              <div className="flex flex-wrap gap-2">
                <Button onClick={generate} disabled={generating || difficulties.trim().length < 10 || !!blocked} className="max-w-full whitespace-normal">
                  {generating ? <Loader2 className="mr-2 h-4 w-4 shrink-0 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4 shrink-0" />}{generating ? 'Preparando tu plan...' : 'Generar plan de estudio'}
                </Button>
                {generating && <Button variant="outline" onClick={() => controller.current?.abort()}><Square className="mr-2 h-4 w-4" />Detener</Button>}
              </div>
              <p className="text-xs text-muted-foreground">El plan no cambia tus notas ni el avance de los momentos. La generación utiliza créditos de Lovable AI de la plataforma.</p>
              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
              <div className="space-y-3 border-t pt-4">
                <h3 className="font-semibold">Resultados disponibles</h3>
                {context?.diagnostico ? <><p className="text-sm">Diagnóstico: {context.diagnostico.promedio?.toFixed(1) ?? 'Sin puntaje'}/100</p><ul className="space-y-1 text-sm text-muted-foreground">{context.diagnostico.herramientas.map(item => <li key={item.tema} className="flex justify-between gap-2"><span>{item.tema}</span><span>{item.puntaje.toFixed(1)}/{item.maximo}</span></li>)}</ul></> : <p className="text-sm text-muted-foreground">No tienes un diagnóstico registrado.</p>}
                {context?.nivelatorio ? <p className="text-sm">Nivelatorio: {context.nivelatorio.puntaje}/{context.nivelatorio.maximo}</p> : <p className="text-sm text-muted-foreground">No tienes un Nivelatorio registrado.</p>}
                {!context?.diagnostico && !context?.nivelatorio && <p className="text-sm text-muted-foreground">Tu primer plan se basará en las dificultades que describas.</p>}
              </div>
            </div>
            <div className="min-w-0 space-y-4 lg:border-l lg:pl-6">
              {!!plans.length && <div className="space-y-2"><Label htmlFor="study-history">Planes guardados</Label><Select value={selectedId} disabled={generating} onValueChange={id => { setSelectedId(id); setDraft(''); setSaved(false); setError(''); }}><SelectTrigger id="study-history"><SelectValue /></SelectTrigger><SelectContent>{plans.map((plan, index) => <SelectItem key={plan.id} value={plan.id}>{new Date(plan.created_at).toLocaleString('es-CO')} · Plan {plans.length - index}</SelectItem>)}</SelectContent></Select></div>}
              {text ? <>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground"><Clock className="h-4 w-4" /><span>{draft ? minutes : selected?.minutes_per_day} minutos al día</span>{saved && <Badge variant="secondary">Plan guardado</Badge>}{generating && <Badge variant="outline">En preparación</Badge>}</div>
                {shownContext && !shownContext.diagnostico && !shownContext.nivelatorio && <p className="text-sm text-muted-foreground">Basado en tus dificultades declaradas; sin resultados registrados al generarlo.</p>}
                <article aria-busy={generating} className="max-w-none break-words text-sm leading-7 text-foreground [&>h1]:mb-4 [&>h1]:text-2xl [&>h1]:font-bold [&>h2]:mb-3 [&>h2]:mt-8 [&>h2]:text-xl [&>h2]:font-semibold [&>h3]:mb-2 [&>h3]:mt-6 [&>h3]:text-base [&>h3]:font-semibold [&>p]:mb-4 [&>ul]:mb-4 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:mb-4 [&>ol]:list-decimal [&>ol]:pl-5 [&_li]:mb-2 [&>hr]:my-6 [&>hr]:border-border"><ReactMarkdown skipHtml remarkPlugins={[remarkGfm]} components={{ table: ({ children }) => <div className="my-4 max-w-full overflow-x-auto"><table className="w-full border-collapse text-sm [&_td]:border [&_td]:border-border [&_td]:p-2 [&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:p-2 [&_th]:text-left">{children}</table></div> }}>{text}</ReactMarkdown></article>
              </> : <div className="flex min-h-52 flex-col items-center justify-center gap-3 border-y py-8 text-center text-muted-foreground"><BookOpenCheck className="h-10 w-10 text-primary" /><p>{generating ? 'Preparando sesiones y ejercicios para ti...' : 'Aún no tienes un plan de estudio guardado.'}</p></div>}
            </div>
          </div>
        </>
      )}
    </section>
  );
}