import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { FileText, Clock, TrendingUp, User, Calendar, ChevronRight, Search, Filter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DiagnosticoEval {
  id: string;
  estudiante_id: string;
  fecha: string;
  puntaje_brainstorming: number | null;
  puntaje_affinity: number | null;
  puntaje_ishikawa: number | null;
  puntaje_dofa: number | null;
  puntaje_pareto: number | null;
  puntaje_promedio: number | null;
  nivel: string | null;
  tiempos_respuesta: any;
  full_name: string | null;
  email: string;
}

interface NivelatorioEval {
  id: string;
  user_id: string;
  momento: string;
  dimension: string;
  problematica: string;
  automatic_score: number;
  max_score: number;
  passed: boolean;
  coordinator_reviewed: boolean;
  coordinator_score: number | null;
  coordinator_comments: string | null;
  completed_at: string;
  full_name: string | null;
  email: string;
  brainstorming_data: any;
  affinity_data: any;
  ishikawa_data: any;
  dofa_data: any;
  pareto_data: any;
  arbol_problemas_data: any;
}

export const ValoracionesCoordinadorManager = ({ showRecent = false }: { showRecent?: boolean }) => {
  const [diagnosticos, setDiagnosticos] = useState<DiagnosticoEval[]>([]);
  const [nivelatorios, setNivelatorios] = useState<NivelatorioEval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDiagnostico, setSelectedDiagnostico] = useState<DiagnosticoEval | null>(null);
  const [selectedNivelatorio, setSelectedNivelatorio] = useState<NivelatorioEval | null>(null);
  const [approvalFilter, setApprovalFilter] = useState<'all' | 'passed' | 'failed'>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setIsLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      // Get coordinator's email
      const { data: profileData } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', user.id)
        .single();

      if (!profileData) throw new Error('Perfil no encontrado');

      // Find students assigned to this coordinator
      const { data: assignedStudents } = await supabase
        .from('estudiantes_autorizados')
        .select('correo')
        .ilike('correo_coordinador', profileData.email);

      const studentEmails = assignedStudents?.map(s => s.correo.toLowerCase()) || [];

      if (studentEmails.length === 0) {
        setDiagnosticos([]);
        setNivelatorios([]);
        setIsLoading(false);
        return;
      }

      // Get profile IDs for these students
      const { data: studentProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, email');

      const matchedProfiles = (studentProfiles || []).filter(p =>
        studentEmails.includes(p.email.toLowerCase())
      );
      const profilesMap = new Map(matchedProfiles.map(p => [p.id, p]));
      const studentIds = matchedProfiles.map(p => p.id);

      if (studentIds.length === 0) {
        setDiagnosticos([]);
        setNivelatorios([]);
        setIsLoading(false);
        return;
      }

      // Fetch diagnosticos (evaluaciones table) - RLS already filters
      const { data: diagData } = await supabase
        .from('evaluaciones')
        .select('*')
        .in('estudiante_id', studentIds)
        .order('fecha', { ascending: false });

      const diagWithNames: DiagnosticoEval[] = (diagData || []).map((d: any) => {
        const profile = profilesMap.get(d.estudiante_id);
        return {
          ...d,
          full_name: profile?.full_name || null,
          email: profile?.email || '',
        };
      });

      // Fetch nivelatorios (student_evaluations table) - RLS already filters
      const { data: nivData } = await supabase
        .from('student_evaluations')
        .select('*')
        .eq('momento', 'nivelatorio')
        .in('user_id', studentIds)
        .order('completed_at', { ascending: false });

      const nivWithNames: NivelatorioEval[] = (nivData || []).map((n: any) => {
        const profile = profilesMap.get(n.user_id);
        return {
          ...n,
          full_name: profile?.full_name || null,
          email: profile?.email || '',
        };
      });

      if (showRecent) {
        setDiagnosticos(diagWithNames.slice(0, 5));
        setNivelatorios(nivWithNames.slice(0, 5));
      } else {
        setDiagnosticos(diagWithNames);
        setNivelatorios(nivWithNames);
      }
    } catch (error) {
      console.error('Error fetching valoraciones:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las valoraciones',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getNivelColor = (nivel: string | null) => {
    switch (nivel?.toLowerCase()) {
      case 'excelente': case 'avanzado': return 'bg-green-500';
      case 'bueno': case 'intermedio': return 'bg-blue-500';
      case 'regular': case 'basico': return 'bg-yellow-500';
      case 'inicial': return 'bg-orange-500';
      case 'insuficiente': return 'bg-red-500';
      default: return 'bg-muted-foreground';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getTotalTime = (tiempos: any): number => {
    if (!tiempos) return 0;
    return Object.values(tiempos).reduce<number>((sum, time) => sum + (Number(time) || 0), 0);
  };

  const filterBySearch = (name: string | null, email: string) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (name?.toLowerCase().includes(term) || email.toLowerCase().includes(term));
  };

  const filteredDiagnosticos = diagnosticos.filter(d => filterBySearch(d.full_name, d.email));
  const filteredNivelatorios = nivelatorios.filter(n => {
    if (!filterBySearch(n.full_name, n.email)) return false;
    if (approvalFilter === 'passed') return n.passed;
    if (approvalFilter === 'failed') return !n.passed;
    return true;
  });

  const aprobadosCount = nivelatorios.filter(n => filterBySearch(n.full_name, n.email) && n.passed).length;
  const noAprobadosCount = nivelatorios.filter(n => filterBySearch(n.full_name, n.email) && !n.passed).length;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {!showRecent && (
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Valoraciones de Estudiantes</h2>
            <p className="text-muted-foreground">Cargando...</p>
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

  // Recent view: simple flat list
  if (showRecent) {
    const recentAll = [
      ...diagnosticos.map(d => ({ type: 'diag' as const, date: d.fecha, item: d })),
      ...nivelatorios.map(n => ({ type: 'niv' as const, date: n.completed_at, item: n })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

    return (
      <div className="space-y-3">
        {recentAll.map((entry) => {
          if (entry.type === 'diag') {
            const d = entry.item as DiagnosticoEval;
            return (
              <Card key={d.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedDiagnostico(d)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold text-sm">{d.full_name || d.email}</span>
                        <Badge variant="outline" className="text-xs">Diagnóstico</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{new Date(d.fecha).toLocaleDateString()}</span>
                        <span>Promedio: {d.puntaje_promedio?.toFixed(1)}%</span>
                      </div>
                    </div>
                    <Badge className={getNivelColor(d.nivel)}>{d.nivel || 'Sin nivel'}</Badge>
                  </div>
                </CardContent>
              </Card>
            );
          } else {
            const n = entry.item as NivelatorioEval;
            return (
              <Card key={n.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedNivelatorio(n)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold text-sm">{n.full_name || n.email}</span>
                        <Badge variant="outline" className="text-xs">Nivelatorio</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{new Date(n.completed_at).toLocaleDateString()}</span>
                        <span>Puntaje: {n.automatic_score}/{n.max_score}</span>
                      </div>
                    </div>
                    <Badge className={n.passed ? 'bg-green-500' : 'bg-red-500'}>
                      {n.passed ? 'Aprobado' : 'No aprobado'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          }
        })}
        {recentAll.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay valoraciones completadas todavía.</p>
            </CardContent>
          </Card>
        )}

        {/* Modals */}
        <DiagnosticoDetailModal
          evaluacion={selectedDiagnostico}
          onClose={() => setSelectedDiagnostico(null)}
          getNivelColor={getNivelColor}
          formatTime={formatTime}
          getTotalTime={getTotalTime}
        />
        <NivelatorioDetailModal
          evaluacion={selectedNivelatorio}
          onClose={() => setSelectedNivelatorio(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Valoraciones de Estudiantes</h2>
        <p className="text-muted-foreground">
          {diagnosticos.length} diagnóstico(s) y {nivelatorios.length} nivelatorio(s) completado(s)
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o correo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="diagnosticos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="diagnosticos">
            Diagnósticos ({filteredDiagnosticos.length})
          </TabsTrigger>
          <TabsTrigger value="nivelatorios">
            Nivelatorios ({filteredNivelatorios.length})
          </TabsTrigger>
        </TabsList>

        {/* DIAGNÓSTICOS */}
        <TabsContent value="diagnosticos" className="space-y-3">
          {filteredDiagnosticos.map((evaluacion) => (
            <Card key={evaluacion.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">{evaluacion.full_name || evaluacion.email}</p>
                        <p className="text-xs text-muted-foreground">{evaluacion.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(evaluacion.fecha).toLocaleDateString()}
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
                      {evaluacion.nivel || 'Sin nivel'}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedDiagnostico(evaluacion)}>
                      Ver detalles
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredDiagnosticos.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No se encontraron diagnósticos.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* NIVELATORIOS */}
        <TabsContent value="nivelatorios" className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filtrar:</span>
            </div>
            <Button
              variant={approvalFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setApprovalFilter('all')}
            >
              Todos ({aprobadosCount + noAprobadosCount})
            </Button>
            <Button
              variant={approvalFilter === 'passed' ? 'default' : 'outline'}
              size="sm"
              className={approvalFilter === 'passed' ? 'bg-green-600 hover:bg-green-700' : ''}
              onClick={() => setApprovalFilter('passed')}
            >
              Aprobados ({aprobadosCount})
            </Button>
            <Button
              variant={approvalFilter === 'failed' ? 'default' : 'outline'}
              size="sm"
              className={approvalFilter === 'failed' ? 'bg-red-600 hover:bg-red-700' : ''}
              onClick={() => setApprovalFilter('failed')}
            >
              No aprobados ({noAprobadosCount})
            </Button>
          </div>

          {filteredNivelatorios.map((evaluacion) => (
            <Card key={evaluacion.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">{evaluacion.full_name || evaluacion.email}</p>
                        <p className="text-xs text-muted-foreground">{evaluacion.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(evaluacion.completed_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Puntaje: {evaluacion.automatic_score}/{evaluacion.max_score}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {evaluacion.dimension}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      Problemática: {evaluacion.problematica}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={evaluacion.passed ? 'bg-green-500' : 'bg-red-500'}>
                      {evaluacion.passed ? 'Aprobado' : 'No aprobado'}
                    </Badge>
                    {evaluacion.coordinator_reviewed && (
                      <Badge variant="outline">Revisado</Badge>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => setSelectedNivelatorio(evaluacion)}>
                      Ver detalles
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredNivelatorios.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No se encontraron nivelatorios.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <DiagnosticoDetailModal
        evaluacion={selectedDiagnostico}
        onClose={() => setSelectedDiagnostico(null)}
        getNivelColor={getNivelColor}
        formatTime={formatTime}
        getTotalTime={getTotalTime}
      />
      <NivelatorioDetailModal
        evaluacion={selectedNivelatorio}
        onClose={() => setSelectedNivelatorio(null)}
      />
    </div>
  );
};

// --- Detail Modals ---

const DiagnosticoDetailModal = ({
  evaluacion,
  onClose,
  getNivelColor,
  formatTime,
  getTotalTime,
}: {
  evaluacion: DiagnosticoEval | null;
  onClose: () => void;
  getNivelColor: (nivel: string | null) => string;
  formatTime: (s: number) => string;
  getTotalTime: (t: any) => number;
}) => (
  <Dialog open={!!evaluacion} onOpenChange={onClose}>
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Detalles de Diagnóstico</DialogTitle>
        <DialogDescription>
          {evaluacion?.full_name || evaluacion?.email}
        </DialogDescription>
      </DialogHeader>
      {evaluacion && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Estudiante</p>
              <p className="text-sm">{evaluacion.full_name}</p>
              <p className="text-xs text-muted-foreground">{evaluacion.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fecha</p>
              <p className="text-sm">{new Date(evaluacion.fecha).toLocaleString()}</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Puntajes por Herramienta</h4>
            <div className="space-y-2">
              {[
                { label: 'Brainstorming', value: evaluacion.puntaje_brainstorming },
                { label: 'Diagrama de Afinidad', value: evaluacion.puntaje_affinity },
                { label: 'Ishikawa', value: evaluacion.puntaje_ishikawa },
                { label: 'DOFA', value: evaluacion.puntaje_dofa },
                { label: 'Pareto', value: evaluacion.puntaje_pareto },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="text-sm">{label}</span>
                  <Badge variant="outline">{value?.toFixed(1) ?? 'N/A'}%</Badge>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-4 border-t flex justify-between items-center">
            <span className="font-semibold">Promedio Final</span>
            <div className="flex items-center gap-2">
              <Badge className={getNivelColor(evaluacion.nivel)}>
                {evaluacion.nivel || 'Sin nivel'}
              </Badge>
              <span className="text-lg font-bold">{evaluacion.puntaje_promedio?.toFixed(1)}%</span>
            </div>
          </div>
          {evaluacion.tiempos_respuesta && (
            <div>
              <h4 className="font-semibold mb-3">Tiempos por Paso</h4>
              <div className="space-y-2">
                {Object.entries(evaluacion.tiempos_respuesta).map(([key, value]: [string, any]) => (
                  <div key={key} className="flex justify-between items-center text-sm">
                    <span className="capitalize">{key.replace(/_/g, ' ')}</span>
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
);

const NivelatorioDetailModal = ({
  evaluacion,
  onClose,
}: {
  evaluacion: NivelatorioEval | null;
  onClose: () => void;
}) => (
  <Dialog open={!!evaluacion} onOpenChange={onClose}>
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Detalles de Nivelatorio</DialogTitle>
        <DialogDescription>
          {evaluacion?.full_name || evaluacion?.email}
        </DialogDescription>
      </DialogHeader>
      {evaluacion && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Estudiante</p>
              <p className="text-sm">{evaluacion.full_name}</p>
              <p className="text-xs text-muted-foreground">{evaluacion.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fecha</p>
              <p className="text-sm">{new Date(evaluacion.completed_at).toLocaleString()}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Dimensión</p>
            <p className="text-sm font-semibold">{evaluacion.dimension}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Problemática</p>
            <p className="text-sm">{evaluacion.problematica}</p>
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold">Resultado</span>
              <div className="flex items-center gap-2">
                <Badge className={evaluacion.passed ? 'bg-green-500' : 'bg-red-500'}>
                  {evaluacion.passed ? 'Aprobado' : 'No aprobado'}
                </Badge>
                <span className="text-lg font-bold">
                  {evaluacion.automatic_score}/{evaluacion.max_score}
                </span>
              </div>
            </div>
          </div>

          {evaluacion.coordinator_reviewed && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">Revisión del Coordinador</p>
              <p className="text-sm">Puntaje: {evaluacion.coordinator_score ?? 'N/A'}</p>
              {evaluacion.coordinator_comments && (
                <p className="text-sm text-muted-foreground mt-1">{evaluacion.coordinator_comments}</p>
              )}
            </div>
          )}

          <div>
            <h4 className="font-semibold mb-3">Datos por Herramienta</h4>
            <div className="space-y-2">
              {[
                { label: 'Brainstorming', data: evaluacion.brainstorming_data },
                { label: 'Afinidad', data: evaluacion.affinity_data },
                { label: 'Árbol de Problemas', data: evaluacion.arbol_problemas_data },
                { label: 'Ishikawa', data: evaluacion.ishikawa_data },
                { label: 'DOFA', data: evaluacion.dofa_data },
                { label: 'Pareto', data: evaluacion.pareto_data },
              ].map(({ label, data }) => (
                <div key={label} className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="text-sm">{label}</span>
                  <Badge variant={data ? 'outline' : 'secondary'}>
                    {data ? 'Completado' : 'Sin datos'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </DialogContent>
  </Dialog>
);
