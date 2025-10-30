import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Users, Mail, BookOpen, Calendar, Award, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Evaluacion {
  id: string;
  fecha: string;
  puntaje_promedio: number | null;
  nivel: string | null;
  puntaje_brainstorming: number | null;
  puntaje_affinity: number | null;
  puntaje_ishikawa: number | null;
  puntaje_dofa: number | null;
  puntaje_pareto: number | null;
}

interface Estudiante {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  curso: {
    nombre: string;
    codigo: string;
  } | null;
  evaluaciones: Evaluacion[];
}

export const EstudiantesManager = () => {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEstudiantes();
  }, []);

  const fetchEstudiantes = async () => {
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

      // Obtener estudiantes de esos cursos
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          created_at,
          cursos:curso_id (
            nombre,
            codigo
          )
        `)
        .in('curso_id', cursoIds)
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Obtener evaluaciones para cada estudiante
      const estudiantesWithEvaluaciones = await Promise.all(
        (profilesData || []).map(async (profile: any) => {
          const { data: evaluacionesData } = await supabase
            .from('evaluaciones')
            .select('id, fecha, puntaje_promedio, nivel, puntaje_brainstorming, puntaje_affinity, puntaje_ishikawa, puntaje_dofa, puntaje_pareto')
            .eq('estudiante_id', profile.id)
            .order('fecha', { ascending: false });
          
          return {
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name,
            created_at: profile.created_at,
            curso: profile.cursos,
            evaluaciones: evaluacionesData || []
          };
        })
      );

      setEstudiantes(estudiantesWithEvaluaciones);
    } catch (error) {
      console.error('Error fetching estudiantes:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los estudiantes',
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
          <h2 className="text-2xl font-bold">Mis Estudiantes</h2>
          <p className="text-muted-foreground">Estudiantes registrados en tus cursos</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
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
      <div>
        <h2 className="text-2xl font-bold">Mis Estudiantes</h2>
        <p className="text-muted-foreground">
          {estudiantes.length} estudiante(s) registrado(s) en tus cursos
        </p>
      </div>

      {estudiantes.some(e => e.evaluaciones.length > 0) && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Award className="h-4 w-4" />
          <span>Mostrando resultados de evaluaciones completadas</span>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {estudiantes.map((estudiante) => (
          <Card key={estudiante.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {estudiante.full_name || 'Sin nombre'}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {estudiante.email}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {estudiante.curso && (
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{estudiante.curso.nombre}</p>
                    <p className="text-xs text-muted-foreground">
                      Código: {estudiante.curso.codigo}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(estudiante.created_at).toLocaleDateString()}
                </div>
                <Badge variant="secondary">
                  {estudiante.evaluaciones.length} evaluación(es)
                </Badge>
              </div>

              {estudiante.evaluaciones.length > 0 && (
                <div className="mt-3 pt-3 border-t space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <TrendingUp className="h-4 w-4" />
                    Resultados de Evaluaciones
                  </div>
                  {estudiante.evaluaciones.map((evaluacion) => (
                    <div key={evaluacion.id} className="bg-muted/50 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {new Date(evaluacion.fecha).toLocaleDateString()}
                        </span>
                        {evaluacion.nivel && (
                          <Badge 
                            variant={
                              evaluacion.nivel === 'avanzado' ? 'default' : 
                              evaluacion.nivel === 'intermedio' ? 'secondary' : 
                              'outline'
                            }
                            className="text-xs"
                          >
                            {evaluacion.nivel}
                          </Badge>
                        )}
                      </div>
                      
                      {evaluacion.puntaje_promedio !== null && (
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-primary" />
                          <span className="text-sm font-semibold">
                            Promedio: {evaluacion.puntaje_promedio.toFixed(1)}%
                          </span>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {evaluacion.puntaje_brainstorming !== null && (
                          <div>Brainstorming: <span className="font-medium">{evaluacion.puntaje_brainstorming.toFixed(0)}%</span></div>
                        )}
                        {evaluacion.puntaje_affinity !== null && (
                          <div>Afinidad: <span className="font-medium">{evaluacion.puntaje_affinity.toFixed(0)}%</span></div>
                        )}
                        {evaluacion.puntaje_ishikawa !== null && (
                          <div>Ishikawa: <span className="font-medium">{evaluacion.puntaje_ishikawa.toFixed(0)}%</span></div>
                        )}
                        {evaluacion.puntaje_dofa !== null && (
                          <div>DOFA: <span className="font-medium">{evaluacion.puntaje_dofa.toFixed(0)}%</span></div>
                        )}
                        {evaluacion.puntaje_pareto !== null && (
                          <div>Pareto: <span className="font-medium">{evaluacion.puntaje_pareto.toFixed(0)}%</span></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {estudiantes.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No hay estudiantes registrados en tus cursos.
                <br />
                Comparte los códigos de curso con tus estudiantes.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
