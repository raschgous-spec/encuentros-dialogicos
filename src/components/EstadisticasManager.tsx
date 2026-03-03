import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { BarChart3, Users, TrendingUp, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
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
import { Progress } from '@/components/ui/progress';

interface EstadisticasMomento {
  momento: string;
  label: string;
  totalEstudiantes: number;
  completados: number;
  enProgreso: number;
  pendientes: number;
  porcentajeCompletado: number;
}

const COLORS = ['#22c55e', '#3b82f6', '#eab308', '#ef4444'];
const MOMENTOS = [
  { key: 'diagnostico', label: 'Momento 1 - Diagnóstico' },
  { key: 'nivelatorio', label: 'Momento 2 - Nivelatorio' },
  { key: 'encuentro1', label: 'Momento 3 - Encuentro 1' },
  { key: 'encuentro2', label: 'Momento 4 - Encuentro 2' },
  { key: 'encuentro3', label: 'Momento 5 - Encuentro 3' },
  { key: 'encuentro4', label: 'Momento 6 - Encuentro 4' },
];

export const EstadisticasManager = () => {
  const [estadisticasMomentos, setEstadisticasMomentos] = useState<EstadisticasMomento[]>([]);
  const [totalEstudiantes, setTotalEstudiantes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole('admin');

  useEffect(() => {
    fetchEstadisticas();
  }, []);

  const paginateQuery = async (table: string, selectCols: string) => {
    let allData: any[] = [];
    let from = 0;
    const pageSize = 1000;
    let hasMore = true;
    while (hasMore) {
      const { data: batch, error } = await supabase
        .from(table as any)
        .select(selectCols)
        .range(from, from + pageSize - 1);
      if (error) throw error;
      if (batch && batch.length > 0) {
        allData = [...allData, ...batch];
        from += pageSize;
        hasMore = batch.length === pageSize;
      } else {
        hasMore = false;
      }
    }
    return allData;
  };

  const fetchEstadisticas = async () => {
    try {
      setIsLoading(true);
      
      const [estudiantesData, progresosData, studentEvalsData] = await Promise.all([
        paginateQuery('profiles', 'id'),
        paginateQuery('momento_progreso', 'estudiante_id, momento, completado'),
        paginateQuery('student_evaluations', 'user_id, momento, passed'),
      ]);

      // Filter out the coordinator's own profile for docente context
      const studentProfiles = isAdmin 
        ? estudiantesData 
        : estudiantesData.filter((p: any) => p.id !== user?.id);

      const total = studentProfiles.length;
      const studentIds = new Set(studentProfiles.map((p: any) => p.id));
      setTotalEstudiantes(total);

      // Calcular estadísticas por momento
      const estadisticas: EstadisticasMomento[] = MOMENTOS.map(({ key, label }) => {
        const progresosDelMomento = progresosData?.filter(p => p.momento === key && studentIds.has(p.estudiante_id)) || [];
        
        let completados = progresosDelMomento.filter(p => p.completado === true).length;
        let enProgreso = progresosDelMomento.filter(p => p.completado === false).length;

        // Enrich with student_evaluations data (e.g. nivelatorio entries not in momento_progreso)
        if (key === 'nivelatorio' || key === 'diagnostico') {
          const evalsDelMomento = studentEvalsData?.filter(e => e.momento === key && studentIds.has(e.user_id)) || [];
          const evalUserIds = new Set(evalsDelMomento.map(e => e.user_id));
          const progresoUserIds = new Set(progresosDelMomento.map(p => p.estudiante_id));
          
          // Count users with evaluations but no momento_progreso entry
          for (const userId of evalUserIds) {
            if (!progresoUserIds.has(userId)) {
              const eval_ = evalsDelMomento.find(e => e.user_id === userId);
              if (eval_?.passed) {
                completados++;
              } else {
                enProgreso++;
              }
            }
          }
        }

        const pendientes = Math.max(0, total - completados - enProgreso);
        const porcentajeCompletado = total > 0 ? Math.round((completados / total) * 100) : 0;

        return {
          momento: key,
          label,
          totalEstudiantes: total,
          completados,
          enProgreso,
          pendientes,
          porcentajeCompletado,
        };
      });

      setEstadisticasMomentos(estadisticas);
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Estadísticas por Momento</h2>
          <p className="text-muted-foreground">Progreso de los estudiantes en los 6 momentos</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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

  const chartData = estadisticasMomentos.map(est => ({
    name: est.label.split(' - ')[0],
    Completados: est.completados,
    'En Progreso': est.enProgreso,
    Pendientes: est.pendientes,
  }));

  const consolidadoData = [
    {
      name: 'Completados',
      value: estadisticasMomentos.reduce((sum, est) => sum + est.completados, 0),
    },
    {
      name: 'En Progreso',
      value: estadisticasMomentos.reduce((sum, est) => sum + est.enProgreso, 0),
    },
    {
      name: 'Pendientes',
      value: estadisticasMomentos.reduce((sum, est) => sum + est.pendientes, 0),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Estadísticas por Momento</h2>
        <p className="text-muted-foreground">
          Progreso consolidado de los estudiantes en los 6 momentos de encuentros dialógicos
        </p>
      </div>

      {/* Resumen General */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEstudiantes}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Registrados en el sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progreso Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(estadisticasMomentos.reduce((sum, est) => sum + est.porcentajeCompletado, 0) / 6)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Promedio en todos los momentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Momentos</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground mt-1">
              Encuentros dialógicos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas Detalladas por Momento */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {estadisticasMomentos.map((estadistica) => (
          <Card key={estadistica.momento}>
            <CardHeader>
              <CardTitle className="text-base">{estadistica.label}</CardTitle>
              <CardDescription>
                Progreso del momento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Completado</span>
                  <span className="font-bold">{estadistica.porcentajeCompletado}%</span>
                </div>
                <Progress value={estadistica.porcentajeCompletado} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Completados</span>
                  </div>
                  <span className="font-bold">{estadistica.completados}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span>En Progreso</span>
                  </div>
                  <span className="font-bold">{estadistica.enProgreso}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-gray-400" />
                    <span>Pendientes</span>
                  </div>
                  <span className="font-bold">{estadistica.pendientes}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Momento</CardTitle>
            <CardDescription>
              Comparación de estados en cada momento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Completados" fill="#22c55e" />
                <Bar dataKey="En Progreso" fill="#eab308" />
                <Bar dataKey="Pendientes" fill="#94a3b8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado Consolidado</CardTitle>
            <CardDescription>
              Distribución total en todos los momentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={consolidadoData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {consolidadoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabla Resumen */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen Detallado</CardTitle>
          <CardDescription>
            Vista completa del progreso en todos los momentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Momento</th>
                  <th className="text-center py-3 px-4 font-medium">Completados</th>
                  <th className="text-center py-3 px-4 font-medium">En Progreso</th>
                  <th className="text-center py-3 px-4 font-medium">Pendientes</th>
                  <th className="text-center py-3 px-4 font-medium">% Completado</th>
                </tr>
              </thead>
              <tbody>
                {estadisticasMomentos.map((est, index) => (
                  <tr key={est.momento} className={index % 2 === 0 ? 'bg-muted/50' : ''}>
                    <td className="py-3 px-4">{est.label}</td>
                    <td className="text-center py-3 px-4">
                      <span className="inline-flex items-center justify-center rounded-full bg-green-100 text-green-800 px-2 py-1 text-sm font-medium">
                        {est.completados}
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="inline-flex items-center justify-center rounded-full bg-yellow-100 text-yellow-800 px-2 py-1 text-sm font-medium">
                        {est.enProgreso}
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="inline-flex items-center justify-center rounded-full bg-gray-100 text-gray-800 px-2 py-1 text-sm font-medium">
                        {est.pendientes}
                      </span>
                    </td>
                    <td className="text-center py-3 px-4 font-bold">
                      {est.porcentajeCompletado}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};