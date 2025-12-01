import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Download, AlertCircle } from "lucide-react";
import { generateCaseStudyPDF } from "@/utils/pdfExport";
import { Progress } from "@/components/ui/progress";

interface EvaluacionData {
  problematica?: string;
  dimension?: string;
  caracteristicas?: string;
  arbolProblemas?: any;
  brainstorming?: any;
  affinity?: any;
  ishikawa?: any;
  dofa?: any;
  pareto?: any;
}

interface EvaluationResult {
  automaticScore: number;
  maxScore: number;
  passed: boolean;
  breakdown: Record<string, number>;
}

interface ReporteCasoEstudioProps {
  evaluacionData: EvaluacionData;
  result: EvaluationResult;
  onClose?: () => void;
}

const toolNames: Record<string, string> = {
  arbolProblemas: 'Árbol de Problemas',
  brainstorming: 'Brainstorming',
  affinity: 'Diagrama de Afinidad',
  ishikawa: 'Diagrama de Ishikawa',
  dofa: 'Matriz DOFA',
  pareto: 'Diagrama de Pareto'
};

const toolIcons: Record<string, string> = {
  arbolProblemas: '🌳',
  brainstorming: '🧠',
  affinity: '🧩',
  ishikawa: '🪶',
  dofa: '🧭',
  pareto: '📊'
};

const getFeedbackForTool = (tool: string, score: number, data: any): string => {
  const percentage = (score / 20) * 100;
  
  if (tool === 'arbolProblemas') {
    const causas = data?.causas?.length || 0;
    const efectos = data?.efectos?.length || 0;
    const problemaCentral = data?.problemaCentral || '';
    
    if (percentage >= 90) {
      return `Excelente análisis del árbol de problemas. Identificaste ${causas} causas y ${efectos} efectos con un problema central bien definido. Tu análisis muestra comprensión profunda de la estructura causal del problema.`;
    } else if (percentage >= 70) {
      return `Buen trabajo con ${causas} causas y ${efectos} efectos identificados. Para mejorar, asegúrate de que cada causa y efecto estén claramente relacionados con el problema central.`;
    } else if (percentage >= 50) {
      return `Análisis básico con ${causas} causas y ${efectos} efectos. Necesitas profundizar más en las causas raíz y considerar más efectos o consecuencias del problema.`;
    } else {
      return `Análisis insuficiente del árbol de problemas. Solo identificaste ${causas} causas y ${efectos} efectos. El árbol requiere al menos 3-4 causas y 3 efectos bien definidos para una comprensión integral del problema.`;
    }
  }
  
  if (tool === 'brainstorming') {
    const ideas = data?.ideas?.length || 0;
    if (percentage >= 90) {
      return `Excelente trabajo. Generaste ${ideas} ideas, demostrando gran capacidad creativa y pensamiento divergente. Tu aporte es valioso para la exploración del problema.`;
    } else if (percentage >= 70) {
      return `Buen trabajo. Generaste ${ideas} ideas. Para mejorar, intenta explorar más perspectivas y no te limites en la fase de generación de ideas.`;
    } else if (percentage >= 50) {
      return `Trabajo aceptable con ${ideas} ideas. Te sugerimos dedicar más tiempo a la fase de brainstorming y evitar juzgar las ideas durante su generación.`;
    } else {
      return `Necesitas mejorar significativamente. Solo generaste ${ideas} ideas. El brainstorming requiere suspender el juicio crítico y generar el mayor número posible de ideas, incluso las que parezcan poco convencionales.`;
    }
  }
  
  if (tool === 'affinity') {
    const groups = data?.groups?.length || 0;
    if (percentage >= 90) {
      return `Excelente organización. Creaste ${groups} grupos coherentes y bien etiquetados. Demuestras capacidad para encontrar patrones y relaciones entre ideas.`;
    } else if (percentage >= 70) {
      return `Buena organización con ${groups} grupos. Considera revisar si las etiquetas son suficientemente descriptivas y si los grupos son mutuamente excluyentes.`;
    } else if (percentage >= 50) {
      return `Organización básica con ${groups} grupos. Trabaja en identificar mejor las relaciones naturales entre ideas y en crear etiquetas más significativas.`;
    } else {
      return `La organización es insuficiente. Necesitas desarrollar mejor tu capacidad para agrupar ideas relacionadas y encontrar categorías coherentes que faciliten el análisis.`;
    }
  }
  
  if (tool === 'ishikawa') {
    const categories = ['metodos', 'maquinaria', 'manoObra', 'materiales', 'medioAmbiente', 'medicion'];
    let totalCauses = 0;
    let categoriesUsed = 0;
    categories.forEach(cat => {
      const count = data?.causes?.[cat]?.length || 0;
      if (count > 0) categoriesUsed++;
      totalCauses += count;
    });
    
    if (percentage >= 90) {
      return `Excelente análisis de causa-efecto. Identificaste ${totalCauses} causas en ${categoriesUsed} categorías. Tu análisis sistemático demuestra comprensión profunda del problema.`;
    } else if (percentage >= 70) {
      return `Buen análisis con ${totalCauses} causas en ${categoriesUsed} categorías. Para mejorar, asegúrate de explorar todas las categorías de las 6M y profundizar en causas raíz.`;
    } else if (percentage >= 50) {
      return `Análisis básico con ${totalCauses} causas. Necesitas utilizar todas las categorías (6M) y profundizar más en las causas potenciales del problema.`;
    } else {
      return `Análisis insuficiente. Solo identificaste ${totalCauses} causas. El diagrama de Ishikawa requiere un análisis sistemático de todas las categorías (Métodos, Máquinas, Mano de obra, Materiales, Medio ambiente, Medición).`;
    }
  }
  
  if (tool === 'dofa') {
    const f = data?.fortalezas?.length || 0;
    const d = data?.debilidades?.length || 0;
    const o = data?.oportunidades?.length || 0;
    const a = data?.amenazas?.length || 0;
    
    if (percentage >= 90) {
      return `Análisis estratégico excelente. Identificaste F:${f}, D:${d}, O:${o}, A:${a}. Tu análisis DOFA es equilibrado y proporciona una visión integral para la toma de decisiones.`;
    } else if (percentage >= 70) {
      return `Buen análisis DOFA (F:${f}, D:${d}, O:${o}, A:${a}). Asegúrate de mantener el equilibrio entre las cuatro dimensiones y que cada elemento sea relevante para el contexto.`;
    } else if (percentage >= 50) {
      return `Análisis DOFA básico (F:${f}, D:${d}, O:${o}, A:${a}). Necesitas profundizar más en cada cuadrante y asegurar que los elementos sean específicos y contextualizados.`;
    } else {
      return `Análisis DOFA insuficiente (F:${f}, D:${d}, O:${o}, A:${a}). Necesitas identificar al menos 3 elementos en cada cuadrante para tener una visión estratégica completa.`;
    }
  }
  
  if (tool === 'pareto') {
    const causes = data?.causes?.length || 0;
    const withFrequency = data?.causes?.filter((c: any) => c.frequency > 0).length || 0;
    
    if (percentage >= 90) {
      return `Excelente aplicación del principio de Pareto. Identificaste ${causes} causas con frecuencias asignadas. Tu análisis permite priorizar efectivamente las acciones de mejora.`;
    } else if (percentage >= 70) {
      return `Buena aplicación con ${causes} causas. Asegúrate de que las frecuencias asignadas sean realistas y basadas en datos o estimaciones fundamentadas.`;
    } else if (percentage >= 50) {
      return `Aplicación básica del Pareto con ${causes} causas. Necesitas identificar más causas y asignar frecuencias apropiadas para un análisis efectivo.`;
    } else {
      return `Aplicación insuficiente. Solo identificaste ${causes} causas con frecuencias. El diagrama de Pareto requiere datos cuantitativos para identificar el 20% de causas que generan el 80% de los efectos.`;
    }
  }
  
  return 'Sin retroalimentación disponible.';
};

export const ReporteCasoEstudio = ({ evaluacionData, result, onClose }: ReporteCasoEstudioProps) => {
  const percentage = (result.automaticScore / result.maxScore) * 100;
  
  const feedback: Record<string, string> = {};
  Object.entries(result.breakdown).forEach(([tool, score]) => {
    feedback[tool] = getFeedbackForTool(tool, score, evaluacionData[tool as keyof EvaluacionData]);
  });

  const handleDownloadPDF = () => {
    generateCaseStudyPDF(evaluacionData, result, feedback);
  };

  return (
    <div className="space-y-6">
      {/* Resultado General */}
      <Card className={result.passed ? "border-green-500/50 bg-green-50/50" : "border-red-500/50 bg-red-50/50"}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {result.passed ? (
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              ) : (
                <XCircle className="h-12 w-12 text-red-600" />
              )}
              <div>
                <CardTitle className="text-2xl">
                  {result.passed ? '¡Valoración Aprobada!' : 'Valoración Completada'}
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  {result.passed 
                    ? 'Has desbloqueado el Momento 3 - Encuentro 1'
                    : 'Necesitas al menos 60 puntos para aprobar'}
                </CardDescription>
              </div>
            </div>
            <Badge variant={result.passed ? "default" : "destructive"} className="text-lg px-4 py-2">
              {result.automaticScore}/{result.maxScore}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={percentage} className="h-3 mb-2" />
          <p className="text-sm text-muted-foreground text-right">{percentage.toFixed(1)}%</p>
        </CardContent>
      </Card>

      {/* Problema Seleccionado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Problema Analizado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Dimensión/Contexto:</p>
            <p className="font-semibold">{evaluacionData.dimension}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Problemática:</p>
            <p>{evaluacionData.problematica}</p>
          </div>
          {evaluacionData.caracteristicas && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Características:</p>
              <p className="text-sm">{evaluacionData.caracteristicas}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultados por Herramienta */}
      <Card>
        <CardHeader>
          <CardTitle>Retroalimentación Detallada por Herramienta</CardTitle>
          <CardDescription>
            Análisis crítico de tu desempeño en cada una de las 6 herramientas de calidad
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(result.breakdown).map(([tool, score]) => {
            const toolPercentage = (score / 20) * 100;
            const level = toolPercentage >= 90 ? 'excelente' : toolPercentage >= 70 ? 'bueno' : toolPercentage >= 50 ? 'aceptable' : 'insuficiente';
            const levelColors = {
              excelente: 'text-green-600 bg-green-100',
              bueno: 'text-blue-600 bg-blue-100',
              aceptable: 'text-yellow-600 bg-yellow-100',
              insuficiente: 'text-red-600 bg-red-100'
            };

            return (
              <div key={tool} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{toolIcons[tool]}</span>
                    <h3 className="font-semibold">{toolNames[tool]}</h3>
                  </div>
                  <Badge className={levelColors[level]}>
                    {score}/20 - {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Badge>
                </div>
                <Progress value={toolPercentage} className="h-2" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feedback[tool]}
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Recomendaciones Generales */}
      <Card>
        <CardHeader>
          <CardTitle>Recomendaciones y Próximos Pasos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {result.passed ? (
            <>
            <p className="text-sm text-muted-foreground leading-relaxed">
              ✅ <strong>Has completado exitosamente el momento nivelatorio.</strong> Tu análisis demuestra comprensión de las 6 herramientas de calidad aplicadas al estudio de caso.
            </p>
              <p className="text-sm leading-relaxed">
                📋 Este prototipo será revisado por el coordinador para asignación de la calificación final. Los comentarios detallados te ayudarán a refinar tu análisis.
              </p>
              <p className="text-sm leading-relaxed">
                🎯 <strong>Próximo paso:</strong> Accede al Momento 3 - Encuentro 1 para continuar con los encuentros dialógicos y desarrollar tu plan de mejoramiento.
              </p>
              <p className="text-sm leading-relaxed">
                💾 Descarga el PDF completo para incluirlo en tus actas y como referencia para los siguientes momentos.
              </p>
            </>
          ) : (
            <>
            <p className="text-sm leading-relaxed">
              ⚠️ <strong>Tu valoración está completa pero no alcanza el puntaje mínimo requerido (72 puntos).</strong> Revisa la retroalimentación detallada de cada herramienta.
            </p>
              <p className="text-sm leading-relaxed">
                📚 Te recomendamos revisar el material de estudio y los videos explicativos antes de realizar un nuevo intento.
              </p>
            <p className="text-sm leading-relaxed">
              🔄 Puedes realizar la valoración nuevamente para mejorar tu calificación y desbloquear el Momento 3. Necesitas obtener al menos 72 puntos.
            </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Acciones */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" size="lg" onClick={handleDownloadPDF}>
          <Download className="mr-2 h-5 w-5" />
          Descargar PDF Completo
        </Button>
        {onClose && (
          <Button size="lg" onClick={onClose}>
            Cerrar Reporte
          </Button>
        )}
      </div>
    </div>
  );
};
