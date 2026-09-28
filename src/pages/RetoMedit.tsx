import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Inbox, Play, Timer, FlaskConical, BarChart3, Layers, ArrowUp, ArrowDown, ArrowLeftIcon, ArrowRight, Award, Loader2, CheckCircle2, XCircle, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type Fase = 'onboarding' | 'n1' | 'n2' | 'n3' | 'enviando' | 'debrief';
type Enfoque = 'Cuantitativo' | 'Cualitativo' | 'Mixto';
type Herr = 'Ishikawa' | 'Pareto' | 'DOFA';

interface Sesion {
  sesion_id: string;
  limites_ms: Record<string, number>;
  nivel1: { id: string; titulo: string; contexto: string }[];
  nivel2: string[];
  nivel3: { id: string; contexto: string }[];
}

const MODULOS: Record<string, { titulo: string; desc: string }> = {
  modulo_identificacion: { titulo: 'Identificación de Problemas y Enfoques', desc: 'Distinguir enfoques cualitativos, cuantitativos y mixtos según la naturaleza del caso.' },
  modulo_fases_investigacion: { titulo: 'Fases de la Investigación', desc: 'Orden lógico: planteamiento, marco, metodología, recolección y resultados.' },
  modulo_solucion_propositiva: { titulo: 'Solución Propositiva de Problemas', desc: 'Selección de la herramienta técnica ideal para formular soluciones.' },
  modulo_desarrollo_ishikawa: { titulo: 'Desarrollo: Diagrama de Ishikawa', desc: 'Análisis causa-efecto para encontrar causas raíz.' },
  modulo_desarrollo_pareto: { titulo: 'Desarrollo: Diagrama de Pareto', desc: 'Priorización 80/20 de causas.' },
  modulo_desarrollo_dofa: { titulo: 'Desarrollo: Matriz DOFA', desc: 'Análisis estratégico interno y externo.' },
};

async function llamar(body: any) {
  const { data, error } = await supabase.functions.invoke('medit-diagnostico', { body });
  if (error || data?.error) {
    let msg = data?.error;
    try { msg = msg || (await (error as any)?.context?.json())?.error; } catch { /* */ }
    throw new Error(msg || 'Error de conexión');
  }
  return data;
}

// ---------- Temporizador reactivo ----------
function useTemporizador(limite: number, activo: boolean) {
  const [ms, setMs] = useState(0);
  const inicio = useRef(Date.now());
  useEffect(() => {
    if (!activo) return;
    inicio.current = Date.now();
    setMs(0);
    const t = setInterval(() => setMs(Date.now() - inicio.current), 200);
    return () => clearInterval(t);
  }, [activo, limite]);
  return { ms, obtener: () => Date.now() - inicio.current };
}

const BarraTiempo = ({ ms, limite, titulo }: { ms: number; limite: number; titulo: string }) => {
  const r = Math.max(0, 1 - ms / limite);
  const color = r > 0.5 ? 'bg-primary' : r > 0.2 ? 'bg-warning' : 'bg-destructive';
  const seg = Math.max(0, Math.ceil((limite - ms) / 1000));
  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
        <span className="font-semibold text-accent text-sm uppercase tracking-wider">{titulo}</span>
        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
          <div className={cn('h-full transition-all duration-200', color)} style={{ width: `${r * 100}%` }} />
        </div>
        <span className={cn('flex items-center gap-1 font-mono text-sm', seg === 0 && 'text-destructive')}>
          <Timer className="h-4 w-4" /> {seg}s
        </span>
      </div>
    </div>
  );
};

const Feedback = ({ fb, onNext, label }: { fb: any; onNext: () => void; label: string }) => (
  <div className="mt-8 rounded-xl border border-accent/40 bg-card p-6 flex flex-col md:flex-row md:items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
    {fb.estado_nivel === 'completado' ? <CheckCircle2 className="h-10 w-10 text-primary shrink-0" /> : <XCircle className="h-10 w-10 text-destructive shrink-0" />}
    <div className="flex-1">
      <p className="font-bold text-lg">Precisión {fb.precision}% · Puntaje {fb.puntaje_obtenido}</p>
      <p className="text-muted-foreground text-sm">{fb.feedback_inmediato}</p>
    </div>
    <Button onClick={onNext} className="bg-accent text-accent-foreground hover:bg-accent/90">{label} <ArrowRight className="h-4 w-4 ml-2" /></Button>
  </div>
);

// ---------- Nivel 1: Drag & Drop ----------
const LABS: { id: Enfoque; icon: any; desc: string }[] = [
  { id: 'Cuantitativo', icon: BarChart3, desc: 'Medición, estadística' },
  { id: 'Cualitativo', icon: FlaskConical, desc: 'Significados, vivencias' },
  { id: 'Mixto', icon: Layers, desc: 'Integra ambos' },
];

const Nivel1 = ({ ses, onDone }: { ses: Sesion; onDone: (fb: any) => void }) => {
  const lim = ses.limites_ms['1'];
  const [asig, setAsig] = useState<Record<string, Enfoque>>({});
  const [sel, setSel] = useState<string | null>(null);
  const [hover, setHover] = useState<Enfoque | null>(null);
  const [fb, setFb] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const { ms, obtener } = useTemporizador(lim, !fb);
  const { toast } = useToast();

  const pendientes = ses.nivel1.filter((c) => !asig[c.id]);
  const soltar = (lab: Enfoque, id: string | null) => { if (id) { setAsig((a) => ({ ...a, [id]: lab })); setSel(null); } setHover(null); };

  const enviar = async () => {
    setSending(true);
    try { setFb(await llamar({ accion: 'evaluar_nivel', sesion_id: ses.sesion_id, nivel_id: 1, tiempo_consumido_ms: obtener(), respuestas: asig })); }
    catch (e: any) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
    finally { setSending(false); }
  };

  return (
    <>
      <BarraTiempo ms={fb ? lim - 1 : ms} limite={lim} titulo="Nivel 1 · El Enigma del Método" />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <p className="text-muted-foreground mb-6">Arrastra cada expediente al laboratorio metodológico correcto (o tócalo y luego toca el laboratorio).</p>
        <div className="grid md:grid-cols-3 gap-4 min-h-[180px] mb-8">
          {pendientes.map((c) => (
            <div
              key={c.id}
              draggable={!fb}
              onDragStart={(e) => e.dataTransfer.setData('text/plain', c.id)}
              onClick={() => !fb && setSel(sel === c.id ? null : c.id)}
              className={cn('rounded-xl border-2 bg-card p-4 cursor-grab active:cursor-grabbing active:scale-105 transition-all hover:-translate-y-1',
                sel === c.id ? 'border-accent shadow-lg shadow-accent/20 scale-105' : 'border-border')}
            >
              <p className="text-xs uppercase tracking-wider text-accent mb-1">Expediente</p>
              <p className="font-bold mb-2">{c.titulo}</p>
              <p className="text-sm text-muted-foreground">{c.contexto}</p>
            </div>
          ))}
          {pendientes.length === 0 && <p className="md:col-span-3 text-center text-muted-foreground self-center">Todos los expedientes fueron clasificados.</p>}
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {LABS.map((l) => {
            const I = l.icon;
            const dentro = ses.nivel1.filter((c) => asig[c.id] === l.id);
            return (
              <div
                key={l.id}
                onDragOver={(e) => { e.preventDefault(); setHover(l.id); }}
                onDragLeave={() => setHover(null)}
                onDrop={(e) => { e.preventDefault(); soltar(l.id, e.dataTransfer.getData('text/plain')); }}
                onClick={() => !fb && soltar(l.id, sel)}
                className={cn('rounded-xl border-2 border-dashed p-4 min-h-[160px] transition-all cursor-pointer',
                  hover === l.id || sel ? 'border-accent bg-accent/10' : 'border-primary/40 bg-primary/5')}
              >
                <div className="flex items-center gap-2 mb-3"><I className="h-5 w-5 text-primary" /><span className="font-bold">Lab. {l.id}</span></div>
                <p className="text-xs text-muted-foreground mb-3">{l.desc}</p>
                <div className="space-y-2">
                  {dentro.map((c) => (
                    <button key={c.id} disabled={!!fb} onClick={(e) => { e.stopPropagation(); setAsig((a) => { const n = { ...a }; delete n[c.id]; return n; }); }}
                      className="w-full text-left text-sm rounded-md bg-card border border-border px-3 py-2 hover:border-destructive">
                      {c.titulo}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        {!fb && (
          <div className="mt-8 text-right">
            <Button size="lg" disabled={pendientes.length > 0 || sending} onClick={enviar}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Validar clasificación
            </Button>
          </div>
        )}
        {fb && <Feedback fb={fb} onNext={() => onDone(fb)} label="Nivel 2" />}
      </div>
    </>
  );
};

// ---------- Nivel 2: Rompecabezas cronológico ----------
const Nivel2 = ({ ses, onDone }: { ses: Sesion; onDone: (fb: any) => void }) => {
  const lim = ses.limites_ms['2'];
  const [orden, setOrden] = useState<string[]>(ses.nivel2);
  const [drag, setDrag] = useState<number | null>(null);
  const [fb, setFb] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const { ms, obtener } = useTemporizador(lim, !fb);
  const { toast } = useToast();

  const mover = (i: number, d: number) => {
    const j = i + d; if (j < 0 || j >= orden.length) return;
    const n = [...orden]; [n[i], n[j]] = [n[j], n[i]]; setOrden(n);
  };
  const soltarEn = (j: number) => {
    if (drag === null || drag === j) return;
    const n = [...orden]; const [x] = n.splice(drag, 1); n.splice(j, 0, x); setOrden(n); setDrag(null);
  };
  const enviar = async () => {
    setSending(true);
    try { setFb(await llamar({ accion: 'evaluar_nivel', sesion_id: ses.sesion_id, nivel_id: 2, tiempo_consumido_ms: obtener(), respuestas: { orden } })); }
    catch (e: any) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
    finally { setSending(false); }
  };

  return (
    <>
      <BarraTiempo ms={fb ? lim - 1 : ms} limite={lim} titulo="Nivel 2 · La Brújula del Proyecto" />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-muted-foreground mb-6">Un proyecto de mejora institucional llegó desordenado. Conecta las fases en el orden correcto para que la investigación sea válida.</p>
        <ol className="space-y-0">
          {orden.map((f, i) => (
            <li key={f}>
              <div
                draggable={!fb}
                onDragStart={() => setDrag(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => soltarEn(i)}
                className={cn('flex items-center gap-3 rounded-xl border-2 bg-card p-4 cursor-grab transition-all', drag === i ? 'border-accent opacity-60' : 'border-border hover:border-primary')}
              >
                <span className="h-8 w-8 rounded-full bg-primary text-primary-foreground grid place-items-center font-bold shrink-0">{i + 1}</span>
                <span className="flex-1 font-medium">{f}</span>
                {!fb && (
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => mover(i, -1)} aria-label="Subir"><ArrowUp className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => mover(i, 1)} aria-label="Bajar"><ArrowDown className="h-4 w-4" /></Button>
                  </div>
                )}
              </div>
              {i < orden.length - 1 && <div className="ml-8 h-6 border-l-2 border-dashed border-primary/60" />}
            </li>
          ))}
        </ol>
        {!fb && <div className="mt-8 text-right"><Button size="lg" disabled={sending} onClick={enviar}>{sending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Validar secuencia</Button></div>}
        {fb && <Feedback fb={fb} onNext={() => onDone(fb)} label="Nivel 3" />}
      </div>
    </>
  );
};

// ---------- Nivel 3: Swipe cards ----------
const Nivel3 = ({ ses, onDone }: { ses: Sesion; onDone: (fb: any) => void }) => {
  const lim = ses.limites_ms['3'];
  const [idx, setIdx] = useState(0);
  const [resp, setResp] = useState<Record<string, Herr>>({});
  const [dx, setDx] = useState({ x: 0, y: 0 });
  const [salida, setSalida] = useState<Herr | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const { obtener, ms } = useTemporizador(lim, true);
  const { toast } = useToast();
  const caso = ses.nivel3[idx];

  const elegir = useCallback(async (h: Herr) => {
    if (!caso || salida) return;
    setSalida(h);
    const nr = { ...resp, [caso.id]: h };
    setResp(nr);
    setTimeout(async () => {
      setSalida(null); setDx({ x: 0, y: 0 });
      if (idx + 1 < ses.nivel3.length) { setIdx(idx + 1); return; }
      setIdx(idx + 1);
      try {
        const fb = await llamar({ accion: 'evaluar_nivel', sesion_id: ses.sesion_id, nivel_id: 3, tiempo_consumido_ms: obtener(), respuestas: nr });
        onDone(fb);
      } catch (e: any) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
    }, 300);
  }, [caso, salida, resp, idx, ses, obtener, onDone, toast]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') elegir('Ishikawa');
      if (e.key === 'ArrowLeft') elegir('Pareto');
      if (e.key === 'ArrowUp') elegir('DOFA');
    };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, [elegir]);

  const onUp = () => {
    if (!start.current) return; start.current = null;
    if (dx.x > 100) elegir('Ishikawa'); else if (dx.x < -100) elegir('Pareto'); else if (dx.y < -100) elegir('DOFA'); else setDx({ x: 0, y: 0 });
  };
  const trans = salida === 'Ishikawa' ? 'translate(600px,0) rotate(20deg)' : salida === 'Pareto' ? 'translate(-600px,0) rotate(-20deg)' : salida === 'DOFA' ? 'translate(0,-600px)' : `translate(${dx.x}px,${dx.y}px) rotate(${dx.x / 20}deg)`;
  const pista: Herr | null = dx.x > 60 ? 'Ishikawa' : dx.x < -60 ? 'Pareto' : dx.y < -60 ? 'DOFA' : null;

  return (
    <>
      <BarraTiempo ms={ms} limite={lim} titulo="Nivel 3 · El Simulador de Soluciones" />
      <div className="max-w-3xl mx-auto px-4 py-8 select-none">
        <p className="text-muted-foreground mb-2 text-center">Lee el nodo crítico y decide qué matriz aplicar. Tarjeta {Math.min(idx + 1, ses.nivel3.length)} de {ses.nivel3.length}</p>
        <div className="relative h-80 grid place-items-center my-6">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 text-accent font-bold flex items-center gap-1"><ArrowUp className="h-4 w-4" /> DOFA</div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 text-accent font-bold flex items-center gap-1"><ArrowLeftIcon className="h-4 w-4" /> Pareto</div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 text-accent font-bold flex items-center gap-1">Ishikawa <ArrowRight className="h-4 w-4" /></div>
          {caso ? (
            <div
              onPointerDown={(e) => { start.current = { x: e.clientX, y: e.clientY }; (e.target as HTMLElement).setPointerCapture?.(e.pointerId); }}
              onPointerMove={(e) => start.current && setDx({ x: e.clientX - start.current.x, y: e.clientY - start.current.y })}
              onPointerUp={onUp}
              style={{ transform: trans, transition: start.current ? 'none' : 'transform .3s ease' }}
              className={cn('w-[min(420px,70vw)] rounded-2xl border-2 bg-card p-6 shadow-2xl cursor-grab touch-none', pista ? 'border-accent' : 'border-primary/50')}
            >
              <p className="text-xs uppercase tracking-wider text-accent mb-2">Nodo crítico {pista && `→ ${pista}`}</p>
              <p className="text-lg leading-relaxed">{caso.contexto}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-muted-foreground"><Loader2 className="h-10 w-10 animate-spin text-accent" />Procesando decisiones...</div>
          )}
        </div>
        {caso && (
          <div className="grid grid-cols-3 gap-3">
            <Button variant="outline" onClick={() => elegir('Pareto')}><ArrowLeftIcon className="h-4 w-4 mr-1" />Pareto (80/20)</Button>
            <Button variant="outline" onClick={() => elegir('DOFA')}><ArrowUp className="h-4 w-4 mr-1" />DOFA</Button>
            <Button variant="outline" onClick={() => elegir('Ishikawa')}>Ishikawa (causa-efecto)<ArrowRight className="h-4 w-4 ml-1" /></Button>
          </div>
        )}
      </div>
    </>
  );
};

// ---------- Página ----------
const RetoMedit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fase, setFase] = useState<Fase>('onboarding');
  const [ses, setSes] = useState<Sesion | null>(null);
  const [res, setRes] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [texto, setTexto] = useState('');
  const bienvenida = '> Auditor Estratégico, bienvenido al Centro de Comando MEDIT.\n> Se han detectado crisis institucionales en el campus.\n> Solo el rigor científico y la metodología adecuada pueden resolverlas.';

  useEffect(() => {
    if (fase !== 'onboarding') return;
    let i = 0;
    const t = setInterval(() => { i++; setTexto(bienvenida.slice(0, i)); if (i >= bienvenida.length) clearInterval(t); }, 25);
    return () => clearInterval(t);
  }, [fase]);

  const iniciar = async () => {
    setLoading(true);
    try { setSes(await llamar({ accion: 'iniciar' })); setFase('n1'); }
    catch (e: any) { toast({ title: 'No se pudo iniciar', description: e.message, variant: 'destructive' }); }
    finally { setLoading(false); }
  };
  const finalizar = async () => {
    setFase('enviando');
    try { setRes(await llamar({ accion: 'finalizar', sesion_id: ses!.sesion_id })); setFase('debrief'); }
    catch (e: any) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  };

  return (
    <div className="medit min-h-screen bg-background text-foreground">
      {fase === 'onboarding' && (
        <div className="max-w-4xl mx-auto px-4 py-10">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6"><ArrowLeft className="h-4 w-4 mr-2" />Volver</Button>
          <p className="text-accent uppercase tracking-[0.3em] text-xs mb-2">Diagnóstico · Gestores del Conocimiento y el Aprendizaje</p>
          <h1 className="text-4xl md:text-6xl font-black mb-8">Reto MEDIT<span className="text-accent">:</span><br />Expedición Investigativa</h1>
          <pre className="font-mono text-primary bg-card border border-border rounded-xl p-5 whitespace-pre-wrap min-h-[110px] mb-8">{texto}<span className="animate-pulse">▌</span></pre>
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="rounded-xl border border-accent/50 bg-card p-5 flex gap-4 items-start">
              <div className="relative"><Inbox className="h-10 w-10 text-accent" /><span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive animate-ping" /><span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive grid place-items-center text-[10px] font-bold">3</span></div>
              <div><p className="font-bold">Buzón de Crisis</p><p className="text-sm text-muted-foreground">Deserción, fallas de infraestructura y brechas de calidad esperan tu intervención.</p></div>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 text-sm space-y-1">
              <p className="font-bold mb-1">Reglas del reto</p>
              <p><span className="text-accent font-semibold">Nivel 1</span> · Clasifica expedientes por enfoque (90 s)</p>
              <p><span className="text-accent font-semibold">Nivel 2</span> · Ordena las fases de la investigación (60 s)</p>
              <p><span className="text-accent font-semibold">Nivel 3</span> · Elige la matriz técnica ideal (90 s)</p>
              <p className="text-muted-foreground pt-1">La agilidad suma bonificación; exceder el tiempo penaliza.</p>
            </div>
          </div>
          <Button size="lg" onClick={iniciar} disabled={loading} className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-8 py-6">
            {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Play className="h-5 w-5 mr-2" />} Iniciar Expedición
          </Button>
        </div>
      )}
      {fase === 'n1' && ses && <Nivel1 ses={ses} onDone={() => setFase('n2')} />}
      {fase === 'n2' && ses && <Nivel2 ses={ses} onDone={() => setFase('n3')} />}
      {fase === 'n3' && ses && <Nivel3 ses={ses} onDone={finalizar} />}
      {fase === 'enviando' && <div className="min-h-screen grid place-items-center"><Loader2 className="h-12 w-12 animate-spin text-accent" /></div>}
      {fase === 'debrief' && res && (
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <p className="text-accent uppercase tracking-[0.3em] text-xs mb-6">Debriefing de la expedición</p>
          <div className="mx-auto h-40 w-40 rounded-full bg-gradient-to-br from-accent to-primary grid place-items-center shadow-2xl shadow-accent/30 animate-in zoom-in-50 spin-in-12 duration-700">
            <Award className="h-20 w-20 text-accent-foreground" />
          </div>
          <h2 className="text-4xl font-black mt-6">{res.insignia_asignada}</h2>
          <p className="text-muted-foreground mt-2">Eficacia global: <span className="text-accent font-bold text-2xl">{res.puntaje_global}%</span></p>
          <div className="grid grid-cols-3 gap-3 mt-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="rounded-xl bg-card border border-border p-4">
                <p className="text-xs text-muted-foreground">Nivel {n}</p>
                <p className="text-2xl font-bold">{res.niveles?.[n]?.puntaje ?? 0}</p>
              </div>
            ))}
          </div>
          <div className="text-left mt-10">
            <h3 className="font-bold text-xl mb-3">Ruta de nivelación requerida</h3>
            {res.ruta_nivelatorio_requerida.length === 0 ? (
              <p className="text-muted-foreground">No se detectaron brechas: dominio metodológico completo.</p>
            ) : (
              <div className="space-y-2">
                {res.ruta_nivelatorio_requerida.map((m: string) => (
                  <details key={m} className="group rounded-xl bg-card border border-border p-4">
                    <summary className="flex items-center justify-between cursor-pointer font-semibold list-none">
                      Módulo: {MODULOS[m]?.titulo ?? m}<ChevronDown className="h-4 w-4 group-open:rotate-180 transition-transform" />
                    </summary>
                    <p className="text-sm text-muted-foreground mt-2">{MODULOS[m]?.desc}</p>
                  </details>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-3 justify-center mt-10">
            <Button variant="outline" onClick={() => navigate('/gestor')}>Volver al panel</Button>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => { setRes(null); setSes(null); setFase('onboarding'); }}>Nueva expedición</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RetoMedit;
