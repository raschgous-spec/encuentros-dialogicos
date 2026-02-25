import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Users, Mail, BookOpen, Calendar, Award, TrendingUp, MapPin, ChevronRight, CheckCircle2, XCircle, FileText, UserCheck, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Valoracion {
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

interface MomentoProgreso {
  momento: string;
  completado: boolean;
  fecha_completado: string | null;
}

interface NivelatorioEvaluation {
  id: string;
  dimension: string;
  problematica: string;
  brainstorming_data: any;
  affinity_data: any;
  ishikawa_data: any;
  dofa_data: any;
  pareto_data: any;
  automatic_score: number;
  max_score: number;
  passed: boolean;
  coordinator_reviewed: boolean;
  coordinator_score: number | null;
  coordinator_comments: string | null;
  completed_at: string;
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
  evaluaciones: Valoracion[];
  momentoProgreso: MomentoProgreso[];
  nivelatorioEval: NivelatorioEvaluation | null;
}

interface EstudianteAutorizado {
  id: string;
  nombre_completo: string;
  correo: string;
  documento: string;
  sede: string;
  facultad: string;
  programa: string;
}

export const EstudiantesManager = () => {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [estudiantesAutorizados, setEstudiantesAutorizados] = useState<EstudianteAutorizado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAutorizados, setIsLoadingAutorizados] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Estudiante | null>(null);
  const [activeMainTab, setActiveMainTab] = useState('registrados');
  const [searchAutorizados, setSearchAutorizados] = useState('');
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

      if (isAdmin) {
        // Admin: obtener todos los estudiantes via cursos
        let cursosQuery = supabase.from('cursos').select('id');
        const { data: cursosData } = await cursosQuery;
        const cursoIds = cursosData?.map(c => c.id) || [];

        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email, full_name, created_at, curso_id')
          .in('curso_id', cursoIds)
          .order('created_at', { ascending: false });

        if (profilesError) throw profilesError;

        const estudiantesWithEvaluaciones = await Promise.all(
          (profilesData || []).map(async (profile: any) => {
            const { data: cursoData } = await supabase
              .from('cursos')
              .select('nombre, codigo')
              .eq('id', profile.curso_id)
              .maybeSingle();

            const { data: evaluacionesData } = await supabase
              .from('evaluaciones')
              .select('id, fecha, puntaje_promedio, nivel, puntaje_brainstorming, puntaje_affinity, puntaje_ishikawa, puntaje_dofa, puntaje_pareto')
              .eq('estudiante_id', profile.id)
              .order('fecha', { ascending: false });

            const { data: momentoData } = await supabase
              .from('momento_progreso')
              .select('momento, completado, fecha_completado')
              .eq('estudiante_id', profile.id)
              .order('fecha_completado', { ascending: false });

            const { data: nivelatorioData } = await supabase
              .from('student_evaluations')
              .select('*')
              .eq('user_id', profile.id)
              .eq('momento', 'nivelatorio')
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            
            return {
              id: profile.id,
              email: profile.email,
              full_name: profile.full_name,
              created_at: profile.created_at,
              curso: cursoData,
              evaluaciones: evaluacionesData || [],
              momentoProgreso: momentoData || [],
              nivelatorioEval: nivelatorioData
            };
          })
        );
        setEstudiantes(estudiantesWithEvaluaciones);
      } else {
        // Coordinador: obtener estudiantes asignados por correo_coordinador
        const { data: autorizados, error: autError } = await supabase
          .from('estudiantes_autorizados')
          .select('correo')
          .eq('correo_coordinador', user.email!.toLowerCase());

        if (autError) throw autError;

        const assignedEmails = (autorizados || []).map(a => a.correo.toLowerCase());

        if (assignedEmails.length === 0) {
          setEstudiantes([]);
          return;
        }

        // Get profiles matching those emails
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email, full_name, created_at, curso_id')
          .in('email', assignedEmails)
          .order('created_at', { ascending: false });

        if (profilesError) throw profilesError;

        const estudiantesWithEvaluaciones = await Promise.all(
          (profilesData || []).map(async (profile: any) => {
            const { data: cursoData } = profile.curso_id 
              ? await supabase.from('cursos').select('nombre, codigo').eq('id', profile.curso_id).maybeSingle()
              : { data: null };

            const { data: evaluacionesData } = await supabase
              .from('evaluaciones')
              .select('id, fecha, puntaje_promedio, nivel, puntaje_brainstorming, puntaje_affinity, puntaje_ishikawa, puntaje_dofa, puntaje_pareto')
              .eq('estudiante_id', profile.id)
              .order('fecha', { ascending: false });

            const { data: momentoData } = await supabase
              .from('momento_progreso')
              .select('momento, completado, fecha_completado')
              .eq('estudiante_id', profile.id)
              .order('fecha_completado', { ascending: false });

            const { data: nivelatorioData } = await supabase
              .from('student_evaluations')
              .select('*')
              .eq('user_id', profile.id)
              .eq('momento', 'nivelatorio')
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            
            return {
              id: profile.id,
              email: profile.email,
              full_name: profile.full_name,
              created_at: profile.created_at,
              curso: cursoData,
              evaluaciones: evaluacionesData || [],
              momentoProgreso: momentoData || [],
              nivelatorioEval: nivelatorioData
            };
          })
        );
        setEstudiantes(estudiantesWithEvaluaciones);
      }
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

  const fetchEstudiantesAutorizados = async () => {
    try {
      setIsLoadingAutorizados(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      const isAdmin = rolesData?.some(r => r.role === 'admin');

      let query = supabase
        .from('estudiantes_autorizados')
        .select('*')
        .order('nombre_completo', { ascending: true });

      if (!isAdmin) {
        query = query.eq('correo_coordinador', user.email!.toLowerCase());
      }

      const { data, error } = await query;

      if (error) throw error;
      setEstudiantesAutorizados(data || []);
    } catch (error) {
      console.error('Error fetching estudiantes autorizados:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los estudiantes precargados',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingAutorizados(false);
    }
  };

  useEffect(() => {
    if (activeMainTab === 'precargados' && estudiantesAutorizados.length === 0) {
      fetchEstudiantesAutorizados();
    }
  }, [activeMainTab]);

  const filteredAutorizados = estudiantesAutorizados.filter(e => {
    const search = searchAutorizados.toLowerCase();
    return (
      e.nombre_completo.toLowerCase().includes(search) ||
      e.correo.toLowerCase().includes(search) ||
      e.documento.toLowerCase().includes(search) ||
      e.facultad.toLowerCase().includes(search) ||
      e.programa.toLowerCase().includes(search) ||
      e.sede.toLowerCase().includes(search)
    );
  });

  const getMomentoActual = (progreso: MomentoProgreso[]) => {
    const momentos = ['diagnostico', 'nivelatorio', 'encuentro1', 'encuentro2', 'encuentro3', 'encuentro4'];
    
    // Find the last completed moment
    const completed = progreso.filter(p => p.completado).map(p => p.momento);
    
    if (completed.length === 0) return 'Diagnóstico';
    
    const lastCompletedIndex = Math.max(...completed.map(m => momentos.indexOf(m)));
    
    // If all completed, return the last one
    if (lastCompletedIndex === momentos.length - 1) {
      return 'Encuentro 4 (Completado)';
    }
    
    // Return next moment
    const nextMomentoIndex = lastCompletedIndex + 1;
    const nextMomento = momentos[nextMomentoIndex];
    
    const momentoNames: Record<string, string> = {
      'diagnostico': 'Diagnóstico',
      'nivelatorio': 'Nivelatorio',
      'encuentro1': 'Encuentro 1',
      'encuentro2': 'Encuentro 2',
      'encuentro3': 'Encuentro 3',
      'encuentro4': 'Encuentro 4'
    };
    
    return momentoNames[nextMomento] || 'Diagnóstico';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Mis Estudiantes</h2>
          <p className="text-muted-foreground">Estudiantes registrados en tus CAI - Encuentros dialógicos</p>
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
        <h2 className="text-2xl font-bold">Estudiantes</h2>
        <p className="text-muted-foreground">
          Gestiona estudiantes registrados y precargados
        </p>
      </div>

      <Tabs value={activeMainTab} onValueChange={setActiveMainTab}>
        <TabsList>
          <TabsTrigger value="registrados">
            <Users className="h-4 w-4 mr-2" />
            Registrados ({estudiantes.length})
          </TabsTrigger>
          <TabsTrigger value="precargados">
            <UserCheck className="h-4 w-4 mr-2" />
            Precargados (Autorizados)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="registrados" className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">
            {estudiantes.length} estudiante(s) registrado(s) en tus CAI - Encuentros dialógicos
          </p>

      {estudiantes.some(e => e.evaluaciones.length > 0) && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Award className="h-4 w-4" />
          <span>Mostrando resultados de valoraciones completadas</span>
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
                  {estudiante.evaluaciones.length} valoración(es)
                </Badge>
              </div>

              {estudiante.evaluaciones.length > 0 && (
                <div className="mt-3 pt-3 border-t space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <TrendingUp className="h-4 w-4" />
                    Resultados de Valoraciones
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

              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Momento Actual</p>
                      <p className="text-sm font-semibold">{getMomentoActual(estudiante.momentoProgreso)}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedStudent(estudiante)}
                  >
                    Ver Detalles
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {estudiantes.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No hay estudiantes registrados en tus CAI - Encuentros dialógicos.
                <br />
                Comparte los códigos de CAI - Encuentros dialógicos con tus estudiantes.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de detalles del estudiante */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {selectedStudent?.full_name || selectedStudent?.email}
            </DialogTitle>
            <DialogDescription>
              Progreso y valoraciones del estudiante
            </DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <Tabs defaultValue="progreso" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="progreso">Progreso de Momentos</TabsTrigger>
                <TabsTrigger value="nivelatorio">
                  Valoración Nivelatorio
                  {selectedStudent.nivelatorioEval && (
                    selectedStudent.nivelatorioEval.passed ? (
                      <CheckCircle2 className="h-4 w-4 ml-2 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 ml-2 text-destructive" />
                    )
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="progreso" className="space-y-4">
                <div className="space-y-3">
                  {['diagnostico', 'nivelatorio', 'encuentro1', 'encuentro2', 'encuentro3', 'encuentro4'].map((momento) => {
                    const progreso = selectedStudent.momentoProgreso.find(p => p.momento === momento);
                    const isCompleted = progreso?.completado || false;
                    
                    const momentoNames: Record<string, string> = {
                      'diagnostico': 'MOMENTO 1 - Diagnóstico',
                      'nivelatorio': 'MOMENTO 2 - Nivelatorio',
                      'encuentro1': 'MOMENTO 3 - Encuentro 1',
                      'encuentro2': 'MOMENTO 4 - Encuentro 2',
                      'encuentro3': 'MOMENTO 5 - Encuentro 3',
                      'encuentro4': 'MOMENTO 6 - Encuentro 4'
                    };

                    return (
                      <Card key={momento} className={isCompleted ? 'border-green-500' : ''}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {isCompleted ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              ) : (
                                <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                              )}
                              <div>
                                <p className="font-semibold">{momentoNames[momento]}</p>
                                {progreso?.fecha_completado && (
                                  <p className="text-xs text-muted-foreground">
                                    Completado: {new Date(progreso.fecha_completado).toLocaleString()}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Badge variant={isCompleted ? 'default' : 'secondary'}>
                              {isCompleted ? 'Completado' : 'Pendiente'}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="nivelatorio" className="space-y-4">
                {selectedStudent.nivelatorioEval ? (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Información General</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Dimensión</p>
                            <p className="text-sm">{selectedStudent.nivelatorioEval.dimension}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Problemática</p>
                            <p className="text-sm">{selectedStudent.nivelatorioEval.problematica}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Calificación Automática</p>
                            <p className="text-sm font-bold">
                              {selectedStudent.nivelatorioEval.automatic_score}/{selectedStudent.nivelatorioEval.max_score}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Estado</p>
                            <Badge variant={selectedStudent.nivelatorioEval.passed ? 'default' : 'destructive'}>
                              {selectedStudent.nivelatorioEval.passed ? 'Aprobado' : 'No Aprobado'}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Fecha</p>
                            <p className="text-sm">
                              {new Date(selectedStudent.nivelatorioEval.completed_at).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Revisión Coordinador</p>
                            <Badge variant={selectedStudent.nivelatorioEval.coordinator_reviewed ? 'default' : 'outline'}>
                              {selectedStudent.nivelatorioEval.coordinator_reviewed ? 'Revisado' : 'Pendiente'}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Respuestas detalladas por herramienta */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">🧠 Brainstorming</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Ideas generadas:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {selectedStudent.nivelatorioEval.brainstorming_data?.ideas?.map((idea: string, idx: number) => (
                              <li key={idx} className="text-sm">{idea}</li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">🧩 Diagrama de Afinidad</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {selectedStudent.nivelatorioEval.affinity_data?.groups?.map((group: any, idx: number) => (
                            <div key={idx} className="border rounded p-3">
                              <p className="font-semibold text-sm mb-2">{group.label}</p>
                              <ul className="list-disc list-inside space-y-1">
                                {group.items?.map((item: string, iIdx: number) => (
                                  <li key={iIdx} className="text-sm text-muted-foreground">{item}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">🪶 Diagrama de Ishikawa</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {Object.entries(selectedStudent.nivelatorioEval.ishikawa_data?.causes || {}).map(([category, causes]: [string, any]) => (
                            <div key={category}>
                              <p className="font-semibold text-sm mb-2 capitalize">{category.replace(/([A-Z])/g, ' $1')}</p>
                              <ul className="list-disc list-inside space-y-1">
                                {causes?.map((cause: string, idx: number) => (
                                  <li key={idx} className="text-sm text-muted-foreground">{cause}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">🧭 Matriz DOFA</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="font-semibold text-sm mb-2">Fortalezas</p>
                            <ul className="list-disc list-inside space-y-1">
                              {selectedStudent.nivelatorioEval.dofa_data?.fortalezas?.map((item: string, idx: number) => (
                                <li key={idx} className="text-sm">{item}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="font-semibold text-sm mb-2">Debilidades</p>
                            <ul className="list-disc list-inside space-y-1">
                              {selectedStudent.nivelatorioEval.dofa_data?.debilidades?.map((item: string, idx: number) => (
                                <li key={idx} className="text-sm">{item}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="font-semibold text-sm mb-2">Oportunidades</p>
                            <ul className="list-disc list-inside space-y-1">
                              {selectedStudent.nivelatorioEval.dofa_data?.oportunidades?.map((item: string, idx: number) => (
                                <li key={idx} className="text-sm">{item}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="font-semibold text-sm mb-2">Amenazas</p>
                            <ul className="list-disc list-inside space-y-1">
                              {selectedStudent.nivelatorioEval.dofa_data?.amenazas?.map((item: string, idx: number) => (
                                <li key={idx} className="text-sm">{item}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">📊 Diagrama de Pareto</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left text-sm font-semibold p-2">Causa</th>
                                <th className="text-right text-sm font-semibold p-2">Frecuencia</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedStudent.nivelatorioEval.pareto_data?.causes?.map((cause: any, idx: number) => (
                                <tr key={idx} className="border-b">
                                  <td className="text-sm p-2">{cause.name}</td>
                                  <td className="text-sm text-right p-2">{cause.frequency}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        El estudiante aún no ha completado la valoración del nivelatorio.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

        </TabsContent>

        <TabsContent value="precargados" className="space-y-4 mt-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, correo, documento, facultad..."
                value={searchAutorizados}
                onChange={(e) => setSearchAutorizados(e.target.value)}
                className="pl-10"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {filteredAutorizados.length} de {estudiantesAutorizados.length} estudiante(s) precargado(s)
            </p>
          </div>

          {isLoadingAutorizados ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-1/2" /></CardHeader>
                  <CardContent><Skeleton className="h-16 w-full" /></CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAutorizados.map((est) => (
                <Card key={est.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      {est.nombre_completo}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {est.correo}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Doc: {est.documento}</Badge>
                    </div>
                    <div className="grid grid-cols-1 gap-1 text-muted-foreground">
                      <span><strong>Sede:</strong> {est.sede}</span>
                      <span><strong>Facultad:</strong> {est.facultad}</span>
                      <span><strong>Programa:</strong> {est.programa}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredAutorizados.length === 0 && !isLoadingAutorizados && (
                <Card className="col-span-full">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <UserCheck className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center">
                      {searchAutorizados
                        ? 'No se encontraron estudiantes con ese criterio de búsqueda.'
                        : 'No hay estudiantes precargados en el sistema.'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
