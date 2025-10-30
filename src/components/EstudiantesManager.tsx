import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Users, Mail, BookOpen, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Estudiante {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  curso: {
    nombre: string;
    codigo: string;
  } | null;
  evaluaciones_count: number;
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
      
      // Obtener cursos del docente
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      const { data: cursosData } = await supabase
        .from('cursos')
        .select('id')
        .eq('docente_id', user.id);

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

      // Obtener conteo de evaluaciones para cada estudiante
      const estudiantesWithCount = await Promise.all(
        (profilesData || []).map(async (profile: any) => {
          const { count } = await supabase
            .from('evaluaciones')
            .select('*', { count: 'exact', head: true })
            .eq('estudiante_id', profile.id);
          
          return {
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name,
            created_at: profile.created_at,
            curso: profile.cursos,
            evaluaciones_count: count || 0
          };
        })
      );

      setEstudiantes(estudiantesWithCount);
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
                  {estudiante.evaluaciones_count} evaluación(es)
                </Badge>
              </div>
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
