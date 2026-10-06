import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { FileText } from 'lucide-react';
import { METODOS, TIPOS, VIDEO_INTRO, TemaEstudio } from '@/data/materialNivelatorio';

const Video = ({ id, title }: { id: string; title: string }) => (
  <div className="aspect-video w-full overflow-hidden rounded-lg border bg-muted">
    <iframe
      className="h-full w-full"
      src={`https://www.youtube.com/embed/${id}`}
      title={title}
      loading="lazy"
      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  </div>
);

const Lista = ({ temas }: { temas: TemaEstudio[] }) => (
  <Accordion type="single" collapsible className="w-full">
    {temas.map((t) => (
      <AccordionItem key={t.id} value={t.id}>
        <AccordionTrigger className="text-left font-semibold">{t.titulo}</AccordionTrigger>
        <AccordionContent className="space-y-4">
          <p className="text-sm leading-relaxed text-foreground">{t.descripcion}</p>
          <div className="grid gap-4 md:grid-cols-2">
            <Video id={t.video} title={t.titulo} />
            {t.imagen && (
              <a href={t.imagen} target="_blank" rel="noopener noreferrer">
                <img src={t.imagen} alt={t.titulo} loading="lazy" className="w-full rounded-lg border shadow-sm" />
              </a>
            )}
          </div>
          {t.texto && (
            <a href={t.texto} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
              <FileText className="h-4 w-4" /> Lectura complementaria
            </a>
          )}
        </AccordionContent>
      </AccordionItem>
    ))}
  </Accordion>
);

export const MaterialEstudio = () => (
  <section className="space-y-4">
    <div className="space-y-2">
      <h4 className="font-semibold">Metodología de investigación · video introductorio</h4>
      <div className="max-w-2xl"><Video id={VIDEO_INTRO} title="Metodología de investigación" /></div>
    </div>
    <Tabs defaultValue="metodos">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="metodos">Métodos de investigación</TabsTrigger>
        <TabsTrigger value="tipos">Tipos de investigación</TabsTrigger>
      </TabsList>
      <TabsContent value="metodos"><Lista temas={METODOS} /></TabsContent>
      <TabsContent value="tipos"><Lista temas={TIPOS} /></TabsContent>
    </Tabs>
  </section>
);
