import { useCallback, useEffect, useRef, useState } from 'react';
import { Radar, Network, Flame, Shield, Timer, Zap, LockKeyhole, CheckCircle2, ArrowRight, RotateCcw, Download, Loader2, Trophy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { generarPdfNivelatorioGestor } from '@/utils/nivelatorioGestorPdf';
import { CapsulaRescate } from './CapsulaRescate';
import { NOMBRES, MISIONES, type SesionLaboratorio } from './nivelatorioTypes';

const ICONOS=[Radar,Network,Flame];
export function LaboratorioNivelatorio() {
 const {user,profile}=useAuth();
 const {toast}=useToast();
 const [sesion,setSesion]=useState<SesionLaboratorio|null>(null);
 const [busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState('');
 const [selected,setSelected]=useState(''),[tipo,setTipo]=useState(''),[metodo,setMetodo]=useState('');
 const [seconds,setSeconds]=useState(90),[pdfBusy,setPdfBusy]=useState(false);
 const [feedback,setFeedback]=useState('');
 const deadline=useRef(0),submitted=useRef(false),autoPdf=useRef('');

 const invoke=useCallback(async (accion:string,payload:Record<string,unknown>={})=>{
  const {data,error:e}=await supabase.functions.invoke('gestor-nivelatorio',{body:{accion,...payload}});
  if(e) { let message='No se pudo guardar. Inténtalo de nuevo.'; if(e.context instanceof Response){ const body=await e.context.json().catch(()=>null); message=body?.error || message; } throw new Error(message); }
  if(data?.error) throw new Error(data.error);
  return data as SesionLaboratorio | {sesion:null};
 },[]);
 const accept=useCallback((s:SesionLaboratorio)=>{setSesion(s); deadline.current=Date.now()+s.remaining_ms; setSeconds(Math.ceil(s.remaining_ms/1000)); submitted.current=false;setSelected('');setTipo('');setMetodo('');},[]);
 const load=useCallback(async()=>{
  if(!user) return;
  setLoading(true);setError('');
  try{const s=await invoke('estado');if('sesion_id' in s) accept(s);else setSesion(null);}catch(e){setError(e instanceof Error?e.message:'No se pudo cargar.');}finally{setLoading(false);}
 },[user,invoke,accept]);
 useEffect(()=>{void load();},[load]);

 const act=async(accion:string,extra:Record<string,unknown>={})=>{
  if(busy) return;
  setBusy(true);setError('');setFeedback('');
  try{
   const s=await invoke(accion,{...(accion==='iniciar'?{}:{sesion_id:sesion?.sesion_id,version:sesion?.version}),...extra});
   if('sesion_id' in s){if(accion==='responder')setFeedback(s.escudos < (sesion?.escudos || 0)?'Concepto por reforzar · un escudo menos.':'Conexión validada · '+(s.racha>=3?'racha x2':'avance confirmado'));accept(s);}
  }catch(e){setError(e instanceof Error?e.message:'No se pudo guardar.');submitted.current=false;}finally{setBusy(false);}
 };
 useEffect(()=>{
  if(!sesion || sesion.pausa || sesion.resultado) return;
  const tick=setInterval(()=>setSeconds(Math.max(0,Math.ceil((deadline.current-Date.now())/1000))),250);
  return ()=>clearInterval(tick);
 },[sesion]);
 useEffect(()=>{
  if(seconds===0 && sesion?.task && !sesion.pausa && !sesion.resultado && !busy && !submitted.current){
   submitted.current=true;void act('responder',{seleccion:'tiempo_agotado',tipo:'aplicada',metodo:'analitico'});
  }
 },[seconds,sesion,busy]);
 const download=useCallback(async(borrador=false)=>{
  if(!user || !sesion?.resultado) return;
  setPdfBusy(true);
  try{
   const {data:g,error:e}=await supabase.from('gestores_conocimiento').select('nombre_completo,correo,facultad').eq('user_id',user.id).maybeSingle();if(e) throw e;
   await generarPdfNivelatorioGestor(sesion.resultado,{nombre:g?.nombre_completo || profile?.full_name || user.user_metadata?.full_name || 'Gestor',correo:g?.correo || user.email || '',facultad:g?.facultad || sesion.facultad || '-',fecha:new Date(sesion.finished_at || Date.now()).toLocaleString('es-CO')},borrador);
  }catch{toast({title:'No se pudo descargar el documento',description:'Inténtalo de nuevo con el botón de descarga.',variant:'destructive'});}finally{setPdfBusy(false);}
 },[user,profile,sesion,toast]);
 useEffect(()=>{
  if(sesion?.resultado?.aprobado && autoPdf.current!==sesion.sesion_id){autoPdf.current=sesion.sesion_id;void download(true);}
 },[sesion,download]);

 const task=sesion?.task,mision=task?.mision || 1;
 const result=sesion?.resultado;
 return <section className="space-y-6 border-b pb-8" aria-label="Laboratorio Translocal MEDIT">
  <div className="flex flex-wrap items-start justify-between gap-4">
   <div><p className="text-sm font-semibold text-primary mb-2">MOMENTO 2 · GESTORES DEL CONOCIMIENTO</p><h2 className="text-2xl font-bold">Laboratorio Translocal MEDIT</h2><p className="text-muted-foreground mt-1">Arquitectura de Soluciones</p></div>
   <div className="flex items-center gap-2 text-primary"><Flame className="h-7 w-7"/><span className="font-semibold">{sesion?.xp || 0} XP</span></div>
  </div>
  {error && <Alert variant="destructive"><AlertDescription className="flex items-center justify-between gap-3">{error}<Button size="sm" variant="outline" onClick={()=>void load()}><RefreshCw className="h-4 w-4 mr-2"/>Actualizar</Button></AlertDescription></Alert>}
  {loading ? <div className="flex items-center gap-3 py-12"><Loader2 className="h-5 w-5 animate-spin"/>Preparando laboratorio…</div> : <>
   <ol className="grid gap-3 sm:grid-cols-3" aria-label="Misiones">
    {MISIONES.map((m,i)=>{const Icon=ICONOS[i]; const done=result?.completo || (sesion && mision>i+1);return <li key={m.titulo} className={`border-t-4 p-4 ${done?'border-primary bg-secondary':sesion && mision===i+1 && !result?'border-primary bg-accent':'border-border bg-muted/40'}`}>
     <div className="flex items-center justify-between mb-3"><Icon className="h-6 w-6 text-primary"/>{done?<CheckCircle2 className="h-5 w-5 text-primary"/>:sesion && mision<i+1 && !result?<LockKeyhole className="h-4 w-4 text-muted-foreground"/>:<span className="text-sm text-muted-foreground">0{i+1}</span>}</div>
     <h3 className="font-semibold">{m.titulo}</h3><p className="text-sm text-muted-foreground mt-1">{m.eje}</p><p className="text-xs text-muted-foreground mt-2">{m.cantidad} asignaciones</p>
    </li>;})}
   </ol>
   {!sesion && !error && <div className="flex flex-wrap items-center justify-between gap-6 py-4"><div className="flex flex-wrap gap-5 text-sm"><span className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary"/>3 escudos</span><span className="flex items-center gap-2"><Timer className="h-5 w-5 text-primary"/>90 s por asignación</span><span className="flex items-center gap-2"><Trophy className="h-5 w-5 text-primary"/>Certificación desde 80%</span></div><Button size="lg" disabled={busy} onClick={()=>void act('iniciar')}>{busy?<Loader2 className="h-4 w-4 mr-2 animate-spin"/>:<ArrowRight className="h-4 w-4 mr-2"/>}Iniciar laboratorio</Button></div>}
   {sesion && !result && task && <>
    <div className="flex flex-wrap items-center justify-between gap-4 border-y py-3">
     <span className="text-sm font-medium">Asignación {sesion.index+1} / {sesion.total}</span>
     <span className="flex gap-1" aria-label={`${sesion.escudos} escudos restantes`}>{[1,2,3].map(n=><Shield key={n} className={`h-6 w-6 ${n<=sesion.escudos?'text-primary fill-secondary':'text-muted-foreground/40'}`}/>)}</span>
     <span className="flex items-center gap-2 text-sm"><Zap className="h-4 w-4 text-primary"/>{sesion.racha>=3?'Combo x2':`Racha ${sesion.racha}/3`}</span>
     <span className={`flex items-center gap-2 font-mono tabular-nums ${seconds<=15?'text-destructive':'text-primary'}`} aria-label="Tiempo restante"><Timer className="h-5 w-5"/>{Math.floor(seconds/60)}:{String(seconds%60).padStart(2,'0')}</span>
    </div>
    <Progress value={sesion.index/sesion.total*100} className="h-2"/>
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
     <div className="space-y-5"><div className="border-l-4 border-primary pl-5"><p className="text-xs font-semibold text-primary mb-2">EXPEDIENTE TRANSLOCAL · {task.problema.u}</p><h3 className="text-lg font-semibold leading-relaxed">{task.problema.p}</h3></div>
      <div className="bg-secondary p-5 rounded-md"><p className="text-sm font-semibold text-primary mb-2">{mision===3?'Requerimiento del prototipo':'Necesidad de investigación'}</p><p className="leading-relaxed">{task.necesidad}</p>{mision===3 && <p className="text-sm mt-3 text-muted-foreground">Intervención práctica · análisis de factores del problema</p>}</div>
      <p className="text-xs text-muted-foreground">Escenario didáctico sobre un problema del banco translocal; no representa nuevos hallazgos del territorio.</p>
      {feedback && <p className="text-sm font-medium text-primary" role="status">{feedback}</p>}
     </div>
     <div className="space-y-4">
      {mision===3 && <div className="grid gap-3 sm:grid-cols-2"><div><label className="block text-sm font-medium mb-2">Tipo validado</label><Select value={tipo} onValueChange={setTipo}><SelectTrigger aria-label="Tipo validado"><SelectValue placeholder="Seleccionar tipo"/></SelectTrigger><SelectContent><SelectItem value="aplicada">Aplicada</SelectItem></SelectContent></Select></div><div><label className="block text-sm font-medium mb-2">Método validado</label><Select value={metodo} onValueChange={setMetodo}><SelectTrigger aria-label="Método validado"><SelectValue placeholder="Seleccionar método"/></SelectTrigger><SelectContent><SelectItem value="analitico">Analítico</SelectItem></SelectContent></Select></div></div>}
      <p className="text-sm font-semibold">{mision===1?'Cartas de investigación':mision===2?'Circuitos metodológicos':'Herramienta de calidad'}</p>
      <div className="grid grid-cols-2 gap-3">{task.opciones.map(op=><Button key={op} draggable disabled={busy || sesion.pausa} aria-pressed={selected===op} variant={selected===op?'default':'outline'} className="h-16 w-full whitespace-normal text-sm gap-2" onDragStart={e=>e.dataTransfer.setData('text/plain',op)} onClick={()=>setSelected(op)}>{mision===2 && <Network className="h-4 w-4 shrink-0"/>}{NOMBRES[op]}{selected===op && <CheckCircle2 className="h-4 w-4 shrink-0"/>}</Button>)}</div>
      <div className="min-h-20 border-2 border-dashed rounded-md flex items-center justify-center gap-3 p-3 text-sm" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const op=e.dataTransfer.getData('text/plain');if(task.opciones.includes(op) && !busy)setSelected(op);}} aria-label="Asignación seleccionada"><Network className="h-5 w-5 text-primary"/><span>{selected?NOMBRES[selected]:'Conexión pendiente'}</span></div>
      <Button className="w-full" disabled={!selected || busy || (mision===3 && (!tipo || !metodo))} onClick={()=>void act('responder',{seleccion:selected,tipo,metodo})}>{busy?<Loader2 className="h-4 w-4 mr-2 animate-spin"/>:<LockKeyhole className="h-4 w-4 mr-2"/>}{mision===3?'Validar prototipo':'Fijar conexión'}</Button>
     </div>
    </div>
   </>}
   {result && <div className="space-y-6">
    <div className="flex flex-wrap items-center gap-5 bg-secondary border-l-4 border-primary p-6"><Trophy className="h-12 w-12 text-primary"/><div><h3 className="text-xl font-bold text-primary">{result.estado_certificacion}</h3><p className="text-sm text-muted-foreground mt-1">{result.completo?'Tres misiones completadas':'Escudos agotados · nueva expedición disponible'}</p></div><div className="sm:ml-auto"><p className="text-3xl font-bold tabular-nums">{result.precision}%</p><p className="text-sm text-muted-foreground">{result.aciertos} aciertos / {result.intentos} intentos</p></div></div>
    <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="py-3 pr-4">Dominio por concepto</th><th className="px-3">Intentos</th><th className="px-3">Precisión</th><th className="px-3">Estado</th></tr></thead><tbody>{result.dominio.map(d=><tr key={`${d.categoria}-${d.concepto}`} className="border-b"><td className="py-3 pr-4">{d.categoria} · {NOMBRES[d.concepto]}</td><td className="px-3">{d.intentos}</td><td className="px-3">{d.precision}%</td><td className="px-3">{!d.completado?'Pendiente':d.intentos===1?'Dominio demostrado':'Completado con rescate'}</td></tr>)}</tbody></table></div>
    {result.aprobado && <div className="space-y-2"><h4 className="font-semibold text-primary">Proposición para el Encuentro Dialógico</h4><p className="text-sm">{result.proposicion.objetivo}</p><p className="text-xs text-muted-foreground">Borrador orientativo, pendiente de validación territorial y revisión del coordinador.</p></div>}
    <div className="flex flex-wrap gap-3"><Button disabled={pdfBusy} onClick={()=>void download()}><Download className="h-4 w-4 mr-2"/>Descargar resultados</Button>{result.aprobado && <Button variant="outline" disabled={pdfBusy} onClick={()=>void download(true)}><Download className="h-4 w-4 mr-2"/>Descargar proposición</Button>}<Button variant="outline" disabled={busy} onClick={()=>{autoPdf.current='';void act('iniciar');}}><RotateCcw className="h-4 w-4 mr-2"/>Nueva expedición</Button></div>
   </div>}
   {sesion?.pausa && sesion.capsule && !result && <CapsulaRescate concepto={sesion.capsule} busy={busy} onContinue={()=>void act('continuar')}/>}
  </>}
 </section>;
}