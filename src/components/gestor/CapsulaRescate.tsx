import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BookOpen, Download, Play } from 'lucide-react';
import { METODOS, TIPOS } from '@/data/materialNivelatorio';
import { NOMBRES } from './nivelatorioTypes';
const HERRAMIENTAS: Record<string,string> = {
 DOFA:'Contrasta fortalezas y debilidades internas con oportunidades y amenazas externas para construir una estrategia.',
 Ishikawa:'Relaciona el efecto con posibles causas raíz, organizadas por categorías. Después contrasta las causas con evidencia.',
 Pareto:'Ordena factores por frecuencia o impacto y calcula el acumulado para priorizar. Requiere datos; no identifica causalidad por sí solo.',
 Afinidad:'Agrupa ideas o testimonios por afinidad temática antes de dar nombre a cada categoría.',
 Brainstorming:'Genera alternativas diversas sin juzgarlas al principio. La selección y valoración de las ideas se realiza después.',
};
export function CapsulaRescate({concepto,busy,onContinue}:{concepto:string;busy:boolean;onContinue:()=>void}) {
 const id=concepto.replace(/^(tipo_|metodo_|herramienta_)/,'');
 const tema=(concepto.startsWith('tipo_')?TIPOS:METODOS).find(t=>t.id===id);
 return <Dialog open><DialogContent className="max-w-3xl max-h-[90dvh] overflow-y-auto [&>button:last-child]:hidden" onEscapeKeyDown={e=>e.preventDefault()} onPointerDownOutside={e=>e.preventDefault()}>
  <DialogHeader><DialogTitle className="flex items-center gap-2 text-primary"><BookOpen className="h-5 w-5"/>Cápsula de Rescate MEDIT</DialogTitle><DialogDescription>Reloj pausado · {tema?.titulo || NOMBRES[id]}</DialogDescription></DialogHeader>
  <p className="text-sm leading-relaxed">{tema?.descripcion || HERRAMIENTAS[id]}</p>
  {tema && <div className="grid gap-4 md:grid-cols-2"><div className="aspect-video"><iframe className="h-full w-full rounded-md border" src={`https://www.youtube.com/embed/${tema.video}`} title={tema.titulo} allowFullScreen/></div>{tema.imagen && <img src={tema.imagen} alt={tema.titulo} className="w-full h-auto object-contain max-h-72"/>}</div>}
  {tema && <div className="flex flex-wrap gap-3"><Button variant="outline" asChild><a href={`https://www.youtube.com/watch?v=${tema.video}`} target="_blank" rel="noopener noreferrer"><Play className="mr-2 h-4 w-4"/>Abrir video</a></Button>{tema.pdf && <Button variant="outline" asChild><a href={tema.pdf} download target="_blank" rel="noopener noreferrer"><Download className="mr-2 h-4 w-4"/>Documento de soporte</a></Button>}</div>}
  <Button disabled={busy} onClick={onContinue}>Retomar asignación</Button>
 </DialogContent></Dialog>;
}