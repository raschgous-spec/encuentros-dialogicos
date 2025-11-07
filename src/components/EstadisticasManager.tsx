import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { BarChart3, Users, TrendingUp, Clock, Award } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface EstadisticasData {
  totalEstudiantes: number;
  totalEvaluaciones: number;
  promedioGeneral: number;
  distribucionNiveles: { name: string; value: number }[];
  promediosPorPrueba: {
    brainstorming: number;
    affinity: number;
    ishikawa: number;
    dofa: number;
    pareto: number;
  };
  tiempoPromedio: number;
}

const COLORS = ['#22c55e', '#3b82f6', '#eab308', '#ef4444'];

export const EstadisticasManager = () => {
  const [estadisticas, setEstadisticas] = useState<EstadisticasData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEstadisticas();
  }, []);

  const fetchEstadisticas = async () => {
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

      // Obtener estudiantes
      const { data: estudiantesData } = await supabase
        .from('profiles')
        .select('id')
        .in('curso_id', cursoIds);

      const totalEstudiantes = estudiantesData?.length || 0;

      // Obtener evaluaciones
      const { data: evaluacionesData } = await supabase
        .from('evaluaciones')
        .select('*')
        .in('curso_id', cursoIds);

      const totalEvaluaciones = evaluacionesData?.length || 0;

      if (totalEvaluaciones === 0) {
        setEstadisticas({
          totalEstudiantes,
          totalEvaluaciones: 0,
          promedioGeneral: 0,
          distribucionNiveles: [],
          promediosPorPrueba: {
            brainstorming: 0,
            affinity: 0,
            ishikawa: 0,
            dofa: 0,
            pareto: 0,
          },
          tiempoPromedio: 0,
        });
        return;
      }

      // Calcular promedio general
      const promedioGeneral = evaluacionesData.reduce((sum, ev) => sum + (ev.puntaje_promedio || 0), 0) / totalEvaluaciones;

      // Distribución de niveles
      const nivelesCount: { [key: string]: number } = {};
      evaluacionesData.forEach(ev => {
        const nivel = ev.nivel || 'Sin clasificar';
        nivelesCount[nivel] = (nivelesCount[nivel] || 0) + 1;
      });

      const distribucionNiveles = Object.entries(nivelesCount).map(([name, value]) => ({
        name,
        value,
      }));

      // Promedios por prueba
      const promediosPorPrueba = {
        brainstorming: evaluacionesData.reduce((sum, ev) => sum + (ev.puntaje_brainstorming || 0), 0) / totalEvaluaciones,
        affinity: evaluacionesData.reduce((sum, ev) => sum + (ev.puntaje_affinity || 0), 0) / totalEvaluaciones,
        ishikawa: evaluacionesData.reduce((sum, ev) => sum + (ev.puntaje_ishikawa || 0), 0) / totalEvaluaciones,
        dofa: evaluacionesData.reduce((sum, ev) => sum + (ev.puntaje_dofa || 0), 0) / totalEvaluaciones,
        pareto: evaluacionesData.reduce((sum, ev) => sum + (ev.puntaje_pareto || 0), 0) / totalEvaluaciones,
      };

      // Tiempo promedio
      let tiempoTotal = 0;
      evaluacionesData.forEach(ev => {
        if (ev.tiempos_respuesta) {
          const tiempos = Object.values(ev.tiempos_respuesta);
          tiempoTotal += tiempos.reduce<number>((sum, tiempo) => sum + (Number(tiempo) || 0), 0);
        }
      });
      const tiempoPromedio = tiempoTotal / totalEvaluaciones;

      setEstadisticas({
        totalEstudiantes,
        totalEvaluaciones,
        promedioGeneral,
        distribucionNiveles,
        promediosPorPrueba,
        tiempoPromedio,
      });
    } catch (error) {
      console.error('Error fetching estadísticas:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las estadísticas',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Estadísticas</h2>
          <p className="text-muted-foreground">Progreso de los estudiantes</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!estadisticas) return null;

  const chartData = [
    { name: 'Brainstorming', puntaje: estadisticas.promediosPorPrueba.brainstorming },
    { name: 'Afinidad', puntaje: estadisticas.promediosPorPrueba.affinity },
    { name: 'Ishikawa', puntaje: estadisticas.promediosPorPrueba.ishikawa },
    { name: 'DOFA', puntaje: estadisticas.promediosPorPrueba.dofa },
    { name: 'Pareto', puntaje: estadisticas.promediosPorPrueba.pareto },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Estadísticas</h2>
        <p className="text-muted-foreground">
          Progreso general de los estudiantes en tus CAI - Encuentros dialógicos
        </p>
      </div>

      {/* Resumen General */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.totalEstudiantes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Evaluaciones</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.totalEvaluaciones}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.promedioGeneral.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(estadisticas.tiempoPromedio)}</div>
          </CardContent>
        </Card>
      </div>

      {estadisticas.totalEvaluaciones > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Gráfico de Promedios por Prueba */}
          <Card>
            <CardHeader>
              <CardTitle>Promedios por Prueba</CardTitle>
              <CardDescription>Puntajes promedio en cada tipo de evaluación</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="puntaje" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Distribución de Niveles */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Niveles</CardTitle>
              <CardDescription>Clasificación de estudiantes por nivel de desempeño</CardDescription>
            </CardHeader>
            <CardContent>
              {estadisticas.distribucionNiveles.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={estadisticas.distribucionNiveles}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {estadisticas.distribucionNiveles.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No hay datos disponibles
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Award className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No hay evaluaciones completadas todavía.
              <br />
              Las estadísticas aparecerán cuando los estudiantes completen sus diagnósticos.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
