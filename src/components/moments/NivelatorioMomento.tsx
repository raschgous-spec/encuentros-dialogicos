import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { BookOpen, Video, FileCheck, Download } from 'lucide-react';
import { useState } from 'react';
import dofaImage from '@/assets/dofa-diagram.webp';

interface NivelatorioMomentoProps {
  onComplete?: () => void;
}

export const NivelatorioMomento = ({ onComplete }: NivelatorioMomentoProps) => {
  const [showVideos, setShowVideos] = useState(false);
  const [showMaterial, setShowMaterial] = useState(false);

  const materials = [
    {
      id: 'dofa',
      title: 'DOFA (FODA)',
      description: 'Análisis estratégico de Debilidades, Oportunidades, Fortalezas y Amenazas',
      image: dofaImage,
      content: [
        'El análisis DOFA es una herramienta de planificación estratégica que permite evaluar factores internos y externos de una organización o proyecto.',
        'Debilidades: Factores internos negativos que limitan el rendimiento.',
        'Oportunidades: Factores externos positivos que se pueden aprovechar.',
        'Fortalezas: Factores internos positivos que dan ventaja competitiva.',
        'Amenazas: Factores externos negativos que representan riesgos.'
      ],
      pdfUrl: '/documents/DOFA.pdf'
    },
    {
      id: 'brainstorming',
      title: 'Brainstorming (Lluvia de Ideas)',
      description: 'Técnica de generación creativa de ideas en grupo',
      content: [
        'Es una técnica de creatividad grupal que busca generar la mayor cantidad de ideas posibles sin juzgarlas inicialmente.',
        'Reglas básicas: No criticar, fomentar ideas locas, buscar cantidad sobre calidad, combinar y mejorar ideas.',
        'Fases: Generación de ideas, clasificación, evaluación y selección.',
        'Útil para: Solución de problemas, innovación, planificación de proyectos.'
      ]
    },
    {
      id: 'affinity',
      title: 'Diagrama de Afinidad',
      description: 'Organización y agrupación de ideas relacionadas',
      content: [
        'Técnica que permite organizar grandes cantidades de ideas, opiniones o datos en grupos según sus relaciones naturales.',
        'Proceso: Recopilar datos, escribir en tarjetas, agrupar por afinidad, crear encabezados, y analizar relaciones.',
        'Beneficios: Identifica patrones, facilita la comprensión, promueve el consenso del equipo.',
        'Aplicaciones: Análisis de problemas complejos, organización de feedback, planificación estratégica.'
      ]
    },
    {
      id: 'ishikawa',
      title: 'Diagrama de Ishikawa (Espina de Pescado)',
      description: 'Análisis causa-efecto para identificar raíces de problemas',
      content: [
        'También conocido como diagrama causa-efecto, ayuda a identificar, clasificar y visualizar las causas de un problema.',
        'Categorías principales (6M): Métodos, Mano de obra, Materiales, Maquinaria, Medición, Medio ambiente.',
        'Proceso: Definir el problema, identificar categorías principales, encontrar causas potenciales, analizar y verificar.',
        'Ventajas: Visualización clara, enfoque estructurado, identificación de causas raíz.'
      ]
    },
    {
      id: 'pareto',
      title: 'Diagrama de Pareto',
      description: 'Principio 80/20 para priorizar problemas o causas',
      content: [
        'Basado en el principio de Pareto (80/20): el 80% de los problemas provienen del 20% de las causas.',
        'Componentes: Gráfico de barras ordenado por frecuencia + línea acumulativa de porcentaje.',
        'Pasos: Identificar problemas, medir frecuencia, ordenar de mayor a menor, graficar, analizar.',
        'Utilidad: Priorizar esfuerzos, identificar problemas críticos, optimizar recursos, tomar decisiones basadas en datos.'
      ]
    }
  ];

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
        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setShowMaterial(!showMaterial)}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">1. MATERIAL DE ESTUDIO</CardTitle>
                <CardDescription>Recursos teóricos y guías ({materials.length} herramientas)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Haz clic para {showMaterial ? 'ocultar' : 'ver'} el material de estudio sobre cada herramienta de calidad.
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

      {showMaterial && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-primary">Material de Estudio</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {materials.map((material) => (
              <Card key={material.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{material.title}</CardTitle>
                  <CardDescription>{material.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {material.image && (
                      <div className="mb-4">
                        <img 
                          src={material.image} 
                          alt={material.title}
                          className="w-full max-w-md mx-auto rounded-lg"
                        />
                      </div>
                    )}
                    {material.content.map((paragraph, index) => (
                      <p key={index} className="text-sm text-muted-foreground leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                    {material.pdfUrl && (
                      <div className="pt-4">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => window.open(material.pdfUrl, '_blank')}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Descargar Material Completo (PDF)
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

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
