import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FileText, Clock, TrendingUp, User, Calendar, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Evaluacion {
  id: string;
  fecha: string;
  puntaje_brainstorming: number;
  puntaje_affinity: number;
  puntaje_ishikawa: number;
  puntaje_dofa: number;
  puntaje_pareto: number;
  puntaje_promedio: number;
  nivel: string;
  tiempos_respuesta: any;
  estudiante: {
    full_name: string | null;
    email: string;
  };
  curso: {
    nombre: string;
    codigo: string;
  } | null;
}

export const EvaluacionesManager = ({ showRecent = false }: { showRecent?: boolean }) => {
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [selectedEvaluacion, setSelectedEvaluacion] = useState<Evaluacion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEvaluaciones();
  }, []);

  const fetchEvaluaciones = async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      // Verificar si el usuario es admin
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      const isAdmin = rolesData?.some(r => r.role === 'admin');

      // Si es admin, obtener todos los cursos; si no, solo los propios
      let cursosQuery = supabase.from('cursos').select('id');
      
      if (!isAdmin) {
        cursosQuery = cursosQuery.eq('docente_id', user.id);
      }

      const { data: cursosData } = await cursosQuery;
      const cursoIds = cursosData?.map(c => c.id) || [];

      // Query para evaluaciones
      let query = supabase
        .from('evaluaciones')
        .select(`
          id,
          fecha,
          puntaje_brainstorming,
          puntaje_affinity,
          puntaje_ishikawa,
          puntaje_dofa,
          puntaje_pareto,
          puntaje_promedio,
          nivel,
          tiempos_respuesta,
          profiles!evaluaciones_estudiante_id_fkey (
            full_name,
            email
          ),
          cursos (
            nombre,
            codigo
          )
        `)
        .in('curso_id', cursoIds)
        .order('fecha', { ascending: false });

      if (showRecent) {
        query = query.limit(5);
      }

      const { data: evaluacionesData, error } = await query;

      if (error) throw error;

      const formattedData = (evaluacionesData || []).map((ev: any) => ({
        id: ev.id,
        fecha: ev.fecha,
        puntaje_brainstorming: ev.puntaje_brainstorming,
        puntaje_affinity: ev.puntaje_affinity,
        puntaje_ishikawa: ev.puntaje_ishikawa,
        puntaje_dofa: ev.puntaje_dofa,
        puntaje_pareto: ev.puntaje_pareto,
        puntaje_promedio: ev.puntaje_promedio,
        nivel: ev.nivel,
        tiempos_respuesta: ev.tiempos_respuesta,
        estudiante: ev.profiles,
        curso: ev.cursos
      }));

      setEvaluaciones(formattedData);
    } catch (error) {
      console.error('Error fetching evaluaciones:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las evaluaciones',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getNivelColor = (nivel: string) => {
    switch (nivel?.toLowerCase()) {
      case 'excelente': return 'bg-green-500';
      case 'bueno': return 'bg-blue-500';
      case 'regular': return 'bg-yellow-500';
      case 'insuficiente': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getTotalTime = (tiempos: any): number => {
    if (!tiempos) return 0;
    return Object.values(tiempos).reduce<number>((sum, time) => {
      return sum + (Number(time) || 0);
    }, 0);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {!showRecent && (
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Evaluaciones</h2>
            <p className="text-muted-foreground">Resultados de diagnósticos completados</p>
          </div>
        )}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!showRecent && (
        <div>
          <h2 className="text-2xl font-bold">Evaluaciones</h2>
          <p className="text-muted-foreground">
            {evaluaciones.length} evaluación(es) completada(s)
          </p>
        </div>
      )}

      <div className="space-y-3">
        {evaluaciones.map((evaluacion) => (
          <Card key={evaluacion.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">
                        {evaluacion.estudiante?.full_name || evaluacion.estudiante?.email}
                      </p>
                      {evaluacion.curso && (
                        <p className="text-xs text-muted-foreground">
                          {evaluacion.curso.nombre} ({evaluacion.curso.codigo})
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(evaluacion.fecha).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(getTotalTime(evaluacion.tiempos_respuesta))}
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Promedio: {evaluacion.puntaje_promedio?.toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge className={getNivelColor(evaluacion.nivel)}>
                    {evaluacion.nivel}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedEvaluacion(evaluacion)}
                  >
                    Ver detalles
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {evaluaciones.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No hay evaluaciones completadas todavía.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de detalles */}
      <Dialog open={!!selectedEvaluacion} onOpenChange={() => setSelectedEvaluacion(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de Evaluación</DialogTitle>
            <DialogDescription>
              {selectedEvaluacion?.estudiante?.full_name || selectedEvaluacion?.estudiante?.email}
            </DialogDescription>
          </DialogHeader>
          
          {selectedEvaluacion && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha</p>
                  <p className="text-sm">{new Date(selectedEvaluacion.fecha).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tiempo Total</p>
                  <p className="text-sm">{formatTime(getTotalTime(selectedEvaluacion.tiempos_respuesta))}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Puntajes por Prueba</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">Brainstorming</span>
                    <Badge variant="outline">{selectedEvaluacion.puntaje_brainstorming?.toFixed(1)}%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">Diagrama de Afinidad</span>
                    <Badge variant="outline">{selectedEvaluacion.puntaje_affinity?.toFixed(1)}%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">Ishikawa</span>
                    <Badge variant="outline">{selectedEvaluacion.puntaje_ishikawa?.toFixed(1)}%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">DOFA</span>
                    <Badge variant="outline">{selectedEvaluacion.puntaje_dofa?.toFixed(1)}%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">Pareto</span>
                    <Badge variant="outline">{selectedEvaluacion.puntaje_pareto?.toFixed(1)}%</Badge>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Promedio Final</span>
                  <div className="flex items-center gap-2">
                    <Badge className={getNivelColor(selectedEvaluacion.nivel)}>
                      {selectedEvaluacion.nivel}
                    </Badge>
                    <span className="text-lg font-bold">{selectedEvaluacion.puntaje_promedio?.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {selectedEvaluacion.tiempos_respuesta && (
                <div>
                  <h4 className="font-semibold mb-3">Tiempos por Paso</h4>
                  <div className="space-y-2">
                    {Object.entries(selectedEvaluacion.tiempos_respuesta).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex justify-between items-center text-sm">
                        <span className="capitalize">{key.replace('_', ' ')}</span>
                        <span className="text-muted-foreground">{formatTime(Number(value) || 0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
