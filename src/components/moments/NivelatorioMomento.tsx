import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { BookOpen, Video, FileCheck } from 'lucide-react';
import { useState } from 'react';

interface NivelatorioMomentoProps {
  onComplete?: () => void;
}

export const NivelatorioMomento = ({ onComplete }: NivelatorioMomentoProps) => {
  const [showVideos, setShowVideos] = useState(false);

  const videos = [
    {
      id: '_6vz0-Hx9cE',
      title: 'DOFA',
      description: 'Análisis DOFA: Debilidades, Oportunidades, Fortalezas y Amenazas'
    },
    {
      id: 'obtZtbm45a8',
      title: 'Brainstorming',
      description: 'Técnicas de lluvia de ideas para solución de problemas'
    },
    {
      id: '0R9894qxiJY',
      title: 'Diagrama de Afinidad',
      description: 'Organización y agrupación de ideas relacionadas'
    },
    {
      id: 'SORXxuL30sE',
      title: 'Diagrama de Ishikawa',
      description: 'Diagrama causa-efecto para análisis de problemas'
    },
    {
      id: 'vd7QVKpW27Q',
      title: 'Pareto',
      description: 'Principio 80/20 y análisis de Pareto'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary border-b-2 border-primary pb-3 mb-6">
          MOMENTO 2 - NIVELATORIO
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">1. MATERIAL DE ESTUDIO</CardTitle>
                <CardDescription>Recursos teóricos y guías</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Próximamente encontrarás aquí material de lectura sobre las herramientas de calidad.
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setShowVideos(!showVideos)}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Video className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">2. VIDEOS EXPLICATIVOS</CardTitle>
                <CardDescription>Contenido audiovisual ({videos.length} videos)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Haz clic para {showVideos ? 'ocultar' : 'ver'} los videos explicativos sobre cada herramienta de calidad.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">3. EVALUACIÓN - CASO DE ESTUDIO</CardTitle>
                <CardDescription>Verifica tu progreso</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Próximamente encontrarás aquí la evaluación del caso de estudio.
            </p>
          </CardContent>
        </Card>
      </div>

      {showVideos && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-primary">Videos Explicativos</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {videos.map((video) => (
              <Card key={video.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{video.title}</CardTitle>
                  <CardDescription>{video.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <AspectRatio ratio={16 / 9}>
                    <iframe
                      src={`https://www.youtube.com/embed/${video.id}`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full rounded-md"
                    />
                  </AspectRatio>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {onComplete && (
        <div className="flex justify-end">
          <Button onClick={onComplete} size="lg">
            Marcar como Completado
          </Button>
        </div>
      )}
    </div>
  );
};
