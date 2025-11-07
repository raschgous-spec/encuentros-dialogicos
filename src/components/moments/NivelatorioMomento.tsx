import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookOpen, Video, FileCheck, Download } from 'lucide-react';
import { useState } from 'react';
import dofaImage from '@/assets/dofa-diagram.webp';
import brainstormingImage from '@/assets/brainstorming-diagram.png';
import affinityImage from '@/assets/affinity-diagram.png';
import ishikawaImage from '@/assets/ishikawa-diagram.jpeg';
import paretoImage from '@/assets/pareto-diagram.png';

interface NivelatorioMomentoProps {
  onComplete?: () => void;
}

export const NivelatorioMomento = ({ onComplete }: NivelatorioMomentoProps) => {
  const [showVideos, setShowVideos] = useState(false);
  const [showMaterial, setShowMaterial] = useState(false);

  const materials = [
    {
      id: 'dofa',
      title: '🧭 Matriz DOFA / FODA (SWOT)',
      description: 'Análisis estratégico de Debilidades, Oportunidades, Fortalezas y Amenazas',
      image: dofaImage,
      content: [
        '📖 Referencia: Talancón, H. P. (2007). La matriz FODA: alternativa de diagnóstico y planeación estratégica.',
        '💡 Concepto: El análisis FODA identifica Fortalezas, Oportunidades, Debilidades y Amenazas de una organización o situación, brindando una visión integral para la toma de decisiones estratégicas.',
        '🔧 Uso y desarrollo: Talancón explica su evolución desde el método SOFT de los años 60. Se usa ampliamente en planificación organizacional, educativa y social para evaluar entornos internos y externos.',
        '✅ Ventajas: Permite diagnósticos claros y decisiones estratégicas. Sencillo y adaptable a distintos contextos.',
        '⚠️ Limitaciones: No cuantifica la magnitud de los factores. Puede depender del criterio subjetivo de los participantes.',
        '📌 Ejemplo: Evaluación de una institución educativa para definir estrategias de mejora.'
      ],
      pdfUrl: '/documents/DOFA.pdf'
    },
    {
      id: 'brainstorming',
      title: '🧠 Brainstorming (Lluvia de Ideas)',
      description: 'Técnica de generación creativa de ideas en grupo',
      image: brainstormingImage,
      content: [
        '📖 Referencia: Delgado, C. (2022). Estrategias didácticas para fortalecer el pensamiento creativo en estudiantes de educación básica.',
        '💡 Concepto: El brainstorming es una técnica grupal que busca generar la mayor cantidad posible de ideas sobre un problema, suspendiendo el juicio crítico durante la fase inicial.',
        '🔧 Uso y desarrollo: Delgado resalta su valor pedagógico como herramienta para fomentar la creatividad y la participación activa. Se originó en los años 40 con Alex Osborn, y su aplicación se ha ampliado en entornos educativos, empresariales y de innovación.',
        '✅ Ventajas: Estimula la creatividad colectiva. Promueve la colaboración y el pensamiento divergente.',
        '⚠️ Limitaciones: Puede verse afectado por la presión social o por participantes dominantes. Requiere moderación adecuada.',
        '📌 Ejemplo: Generación de ideas para proyectos escolares o soluciones innovadoras en grupos de trabajo.'
      ],
      pdfUrl: '/documents/Brainstorming.pdf'
    },
    {
      id: 'affinity',
      title: '🧩 Diagrama de Afinidad (Método KJ)',
      description: 'Organización y agrupación de ideas relacionadas',
      image: affinityImage,
      content: [
        '📖 Referencia: García, M., & Carrero de Blanco, A. (2008). Aplicación del diagrama de afinidad para plantear problemas ambientales.',
        '💡 Concepto: El diagrama de afinidad agrupa ideas o datos cualitativos en categorías basadas en su relación natural, ayudando a clarificar temas complejos.',
        '🔧 Uso y desarrollo: Originado por Jiro Kawakita (método KJ), este enfoque se utiliza para organizar información de manera visual. García y Carrero lo aplican a problemas ambientales, mostrando su utilidad en la estructuración participativa de causas y efectos.',
        '✅ Ventajas: Permite visualizar patrones ocultos en datos cualitativos. Facilita la colaboración interdisciplinaria.',
        '⚠️ Limitaciones: Requiere consenso para agrupar datos. Puede ser subjetivo si no se guía correctamente.',
        '📌 Ejemplo: Clasificación de problemas ambientales por tipo de causa o impacto.'
      ],
      pdfUrl: '/documents/Affinity.pdf'
    },
    {
      id: 'ishikawa',
      title: '🪶 Diagrama de Ishikawa (Causa-Efecto)',
      description: 'Análisis causa-efecto para identificar raíces de problemas',
      image: ishikawaImage,
      content: [
        '📖 Referencia: Bermúdez, E. R. (2010). El uso del diagrama causa-efecto en el análisis de casos.',
        '💡 Concepto: También conocido como "espina de pescado", este diagrama identifica y organiza las causas potenciales de un problema en categorías (métodos, maquinaria, mano de obra, materiales, medio ambiente, medición).',
        '🔧 Uso y desarrollo: Bermúdez explica cómo la herramienta, desarrollada por Kaoru Ishikawa en los años 50, ayuda a encontrar causas raíz dentro de la gestión de calidad o el análisis de procesos.',
        '✅ Ventajas: Clarifica relaciones causa-efecto. Sirve de base para la mejora continua.',
        '⚠️ Limitaciones: Puede omitir factores no evidentes si el grupo carece de experiencia.',
        '📌 Ejemplo: Análisis de causas de retrasos en una línea de producción o en la entrega de servicios.'
      ],
      pdfUrl: '/documents/Ishikawa.pdf'
    },
    {
      id: 'pareto',
      title: '📊 Diagrama de Pareto (Principio 80/20)',
      description: 'Principio 80/20 para priorizar problemas o causas',
      image: paretoImage,
      content: [
        '📖 Referencia: Borjas, C. M. B. (2005). La ley de Pareto aplicada a la fiabilidad.',
        '💡 Concepto: El principio de Pareto establece que un pequeño número de causas genera la mayoría de los efectos (80/20). El diagrama correspondiente permite priorizar acciones sobre las causas más influyentes.',
        '🔧 Uso y desarrollo: Borjas describe su aplicación en ingeniería de fiabilidad para detectar los fallos más recurrentes. Es útil en control de calidad, gestión del tiempo y mejora de procesos.',
        '✅ Ventajas: Enfoca esfuerzos en los factores de mayor impacto. Se integra fácilmente con otras herramientas de calidad.',
        '⚠️ Limitaciones: No muestra relaciones causales. Depende de datos cuantitativos precisos.',
        '📌 Ejemplo: Priorización de defectos en una línea de producción o análisis de causas frecuentes de fallas en sistemas técnicos.'
      ],
      pdfUrl: '/documents/Pareto.pdf'
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

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-xl">Tabla Comparativa de Herramientas</CardTitle>
              <CardDescription>Comparación de las características principales de cada herramienta</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Herramienta</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Enfoque</TableHead>
                    <TableHead>Naturaleza de datos</TableHead>
                    <TableHead>Principal aporte</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Brainstorming</TableCell>
                    <TableCell>Creativa</TableCell>
                    <TableCell>Generación de ideas</TableCell>
                    <TableCell>Cualitativa</TableCell>
                    <TableCell>Estimula creatividad y participación</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Diagrama de afinidad</TableCell>
                    <TableCell>Organizativa</TableCell>
                    <TableCell>Agrupar ideas relacionadas</TableCell>
                    <TableCell>Cualitativa</TableCell>
                    <TableCell>Estructura información compleja</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Ishikawa</TableCell>
                    <TableCell>Analítica</TableCell>
                    <TableCell>Identificar causas raíz</TableCell>
                    <TableCell>Cualitativa-cuantitativa</TableCell>
                    <TableCell>Facilita el análisis sistemático</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">DOFA</TableCell>
                    <TableCell>Estratégica</TableCell>
                    <TableCell>Diagnóstico interno/externo</TableCell>
                    <TableCell>Cualitativa</TableCell>
                    <TableCell>Soporte a la toma de decisiones</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Pareto</TableCell>
                    <TableCell>Cuantitativa</TableCell>
                    <TableCell>Priorización de causas</TableCell>
                    <TableCell>Cuantitativa</TableCell>
                    <TableCell>Permite concentrar recursos en lo esencial</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
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
