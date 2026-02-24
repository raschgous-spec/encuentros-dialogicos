import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { FileText, Clock, TrendingUp, User, Calendar, ChevronRight, Search, Filter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

export const ValoracionesAdminManager = () => {
  const [diagnosticos, setDiagnosticos] = useState<DiagnosticoEval[]>([]);
  const [nivelatorios, setNivelatorios] = useState<NivelatorioEval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDiagnostico, setSelectedDiagnostico] = useState<DiagnosticoEval | null>(null);
  const [selectedNivelatorio, setSelectedNivelatorio] = useState<NivelatorioEval | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setIsLoading(true);

      // Fetch diagnosticos with profile info
      const { data: diagData, error: diagError } = await supabase
        .from('evaluaciones')
        .select('*')
        .order('fecha', { ascending: false });

      if (diagError) throw diagError;

      // Fetch profiles for diagnosticos
      const estudianteIds = [...new Set((diagData || []).map(d => d.estudiante_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', estudianteIds.length > 0 ? estudianteIds : ['none']);

      const profilesMap = new Map((profilesData || []).map(p => [p.id, p]));

      const diagWithNames: DiagnosticoEval[] = (diagData || []).map(d => ({
        ...d,
        full_name: profilesMap.get(d.estudiante_id)?.full_name || null,
        email: profilesMap.get(d.estudiante_id)?.email || '',
      }));

      setDiagnosticos(diagWithNames);

      // Fetch nivelatorios with profile info
      const { data: nivData, error: nivError } = await supabase
        .from('student_evaluations')
        .select('*')
        .eq('momento', 'nivelatorio')
        .order('completed_at', { ascending: false });

      if (nivError) throw nivError;

      const nivUserIds = [...new Set((nivData || []).map(n => n.user_id))];
      const { data: nivProfilesData } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', nivUserIds.length > 0 ? nivUserIds : ['none']);

      const nivProfilesMap = new Map((nivProfilesData || []).map(p => [p.id, p]));

      const nivWithNames: NivelatorioEval[] = (nivData || []).map(n => ({
        ...n,
        full_name: nivProfilesMap.get(n.user_id)?.full_name || null,
        email: nivProfilesMap.get(n.user_id)?.email || '',
      }));

      setNivelatorios(nivWithNames);
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
      case 'excelente': return 'bg-green-500';
      case 'avanzado': return 'bg-green-500';
      case 'intermedio': return 'bg-blue-500';
      case 'bueno': return 'bg-blue-500';
      case 'basico': return 'bg-yellow-500';
      case 'regular': return 'bg-yellow-500';
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
  const filteredNivelatorios = nivelatorios.filter(n => filterBySearch(n.full_name, n.email));

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Valoraciones de Usuarios</h2>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
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
      <div>
        <h2 className="text-2xl font-bold">Valoraciones de Usuarios</h2>
        <p className="text-muted-foreground">
          {diagnosticos.length} diagnóstico(s) y {nivelatorios.length} nivelatorio(s) completado(s)
        </p>
      </div>

      {/* Search */}
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
                        <p className="font-semibold">
                          {evaluacion.full_name || evaluacion.email}
                        </p>
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
          {filteredNivelatorios.map((evaluacion) => (
            <Card key={evaluacion.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">
                          {evaluacion.full_name || evaluacion.email}
                        </p>
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

      {/* Modal Diagnóstico */}
      <Dialog open={!!selectedDiagnostico} onOpenChange={() => setSelectedDiagnostico(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de Diagnóstico</DialogTitle>
            <DialogDescription>
              {selectedDiagnostico?.full_name || selectedDiagnostico?.email}
            </DialogDescription>
          </DialogHeader>
          {selectedDiagnostico && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estudiante</p>
                  <p className="text-sm">{selectedDiagnostico.full_name}</p>
                  <p className="text-xs text-muted-foreground">{selectedDiagnostico.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha</p>
                  <p className="text-sm">{new Date(selectedDiagnostico.fecha).toLocaleString()}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Puntajes por Herramienta</h4>
                <div className="space-y-2">
                  {[
                    { label: 'Brainstorming', value: selectedDiagnostico.puntaje_brainstorming },
                    { label: 'Diagrama de Afinidad', value: selectedDiagnostico.puntaje_affinity },
                    { label: 'Ishikawa', value: selectedDiagnostico.puntaje_ishikawa },
                    { label: 'DOFA', value: selectedDiagnostico.puntaje_dofa },
                    { label: 'Pareto', value: selectedDiagnostico.puntaje_pareto },
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
                  <Badge className={getNivelColor(selectedDiagnostico.nivel)}>
                    {selectedDiagnostico.nivel || 'Sin nivel'}
                  </Badge>
                  <span className="text-lg font-bold">{selectedDiagnostico.puntaje_promedio?.toFixed(1)}%</span>
                </div>
              </div>
              {selectedDiagnostico.tiempos_respuesta && (
                <div>
                  <h4 className="font-semibold mb-3">Tiempos por Paso</h4>
                  <div className="space-y-2">
                    {Object.entries(selectedDiagnostico.tiempos_respuesta).map(([key, value]: [string, any]) => (
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

      {/* Modal Nivelatorio */}
      <Dialog open={!!selectedNivelatorio} onOpenChange={() => setSelectedNivelatorio(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de Nivelatorio</DialogTitle>
            <DialogDescription>
              {selectedNivelatorio?.full_name || selectedNivelatorio?.email}
            </DialogDescription>
          </DialogHeader>
          {selectedNivelatorio && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estudiante</p>
                  <p className="text-sm">{selectedNivelatorio.full_name}</p>
                  <p className="text-xs text-muted-foreground">{selectedNivelatorio.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha</p>
                  <p className="text-sm">{new Date(selectedNivelatorio.completed_at).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Dimensión</p>
                <p className="text-sm font-semibold">{selectedNivelatorio.dimension}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Problemática</p>
                <p className="text-sm">{selectedNivelatorio.problematica}</p>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold">Resultado</span>
                  <div className="flex items-center gap-2">
                    <Badge className={selectedNivelatorio.passed ? 'bg-green-500' : 'bg-red-500'}>
                      {selectedNivelatorio.passed ? 'Aprobado' : 'No aprobado'}
                    </Badge>
                    <span className="text-lg font-bold">
                      {selectedNivelatorio.automatic_score}/{selectedNivelatorio.max_score}
                    </span>
                  </div>
                </div>
              </div>

              {selectedNivelatorio.coordinator_reviewed && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">Revisión del Coordinador</p>
                  <p className="text-sm">Puntaje: {selectedNivelatorio.coordinator_score ?? 'N/A'}</p>
                  {selectedNivelatorio.coordinator_comments && (
                    <p className="text-sm text-muted-foreground mt-1">{selectedNivelatorio.coordinator_comments}</p>
                  )}
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-3">Datos por Herramienta</h4>
                <div className="space-y-2">
                  {[
                    { label: 'Brainstorming', data: selectedNivelatorio.brainstorming_data },
                    { label: 'Afinidad', data: selectedNivelatorio.affinity_data },
                    { label: 'Árbol de Problemas', data: selectedNivelatorio.arbol_problemas_data },
                    { label: 'Ishikawa', data: selectedNivelatorio.ishikawa_data },
                    { label: 'DOFA', data: selectedNivelatorio.dofa_data },
                    { label: 'Pareto', data: selectedNivelatorio.pareto_data },
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
    </div>
  );
};
