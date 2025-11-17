import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Activity,
  AlertCircle,
  Users
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface EstudianteProgreso {
  id: string;
  full_name: string;
  email: string;
  momentos: {
    diagnostico?: boolean;
    nivelatorio?: boolean;
    encuentro1?: boolean;
    encuentro2?: boolean;
    encuentro3?: boolean;
    encuentro4?: boolean;
  };
}

interface ActividadReciente {
  id: string;
  estudiante_nombre: string;
  tipo: 'progreso' | 'acta' | 'evaluacion';
  momento: string;
  timestamp: string;
  descripcion: string;
}

export const SeguimientoTiempoReal = () => {
  const [estudiantes, setEstudiantes] = useState<EstudianteProgreso[]>([]);
  const [actividades, setActividades] = useState<ActividadReciente[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const momentosLabels: Record<string, string> = {
    diagnostico: 'Momento 1 - Diagnóstico',
    nivelatorio: 'Momento 2 - Nivelatorio',
    encuentro1: 'Momento 3 - Encuentro 1',
    encuentro2: 'Momento 4 - Encuentro 2',
    encuentro3: 'Momento 5 - Encuentro 3',
    encuentro4: 'Momento 6 - Encuentro 4',
  };

  const cargarDatos = async () => {
    try {
      // Cargar estudiantes con sus progresos
      const { data: perfiles, error: perfilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name');

      if (perfilesError) throw perfilesError;

      // Cargar progreso de todos los estudiantes
      const { data: progresos, error: progresosError } = await supabase
        .from('momento_progreso')
        .select('estudiante_id, momento, completado');

      if (progresosError) throw progresosError;

      // Organizar datos
      const estudiantesConProgreso: EstudianteProgreso[] = perfiles?.map(perfil => {
        const progresosEstudiante = progresos?.filter(p => p.estudiante_id === perfil.id) || [];
        const momentos: any = {};
        
        progresosEstudiante.forEach(p => {
          momentos[p.momento] = p.completado;
        });

        return {
          id: perfil.id,
          full_name: perfil.full_name || perfil.email,
          email: perfil.email,
          momentos
        };
      }) || [];

      setEstudiantes(estudiantesConProgreso);
      setLoading(false);
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar la información de los estudiantes',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    cargarDatos();

    // Suscribirse a cambios en tiempo real
    const progresoChannel = supabase
      .channel('progreso-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'momento_progreso'
        },
        (payload) => {
          console.log('Cambio en progreso:', payload);
          cargarDatos();
          
          // Agregar actividad reciente
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const nuevaActividad: ActividadReciente = {
              id: crypto.randomUUID(),
              estudiante_nombre: 'Estudiante',
              tipo: 'progreso',
              momento: (payload.new as any).momento,
              timestamp: new Date().toISOString(),
              descripcion: `Momento ${(payload.new as any).momento} ${(payload.new as any).completado ? 'completado' : 'actualizado'}`
            };
            setActividades(prev => [nuevaActividad, ...prev].slice(0, 20));
            
            toast({
              title: 'Actualización en tiempo real',
              description: nuevaActividad.descripcion,
            });
          }
        }
      )
      .subscribe();

    const actasChannel = supabase
      .channel('actas-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'actas_encuentro'
        },
        (payload) => {
          console.log('Cambio en actas:', payload);
          const nuevaActividad: ActividadReciente = {
            id: crypto.randomUUID(),
            estudiante_nombre: 'Estudiante',
            tipo: 'acta',
            momento: (payload.new as any).momento,
            timestamp: new Date().toISOString(),
            descripcion: `Acta de ${(payload.new as any).momento} ${payload.eventType === 'INSERT' ? 'creada' : 'actualizada'}`
          };
          setActividades(prev => [nuevaActividad, ...prev].slice(0, 20));
          
          toast({
            title: 'Nueva actividad',
            description: nuevaActividad.descripcion,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(progresoChannel);
      supabase.removeChannel(actasChannel);
    };
  }, [toast]);

  const calcularProgreso = (momentos: any) => {
    const total = 6;
    const completados = Object.values(momentos).filter(Boolean).length;
    return Math.round((completados / total) * 100);
  };

  const getMomentoIcon = (completado?: boolean) => {
    if (completado) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    } else if (completado === false) {
      return <Clock className="h-4 w-4 text-yellow-500" />;
    }
    return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Lista de Estudiantes con Progreso */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Progreso de Estudiantes
          </CardTitle>
          <CardDescription>
            Seguimiento en tiempo real de los 6 momentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <Accordion type="single" collapsible className="space-y-2">
              {estudiantes.map((estudiante) => (
                <AccordionItem key={estudiante.id} value={estudiante.id} className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div className="text-left">
                          <p className="font-medium">{estudiante.full_name}</p>
                          <p className="text-xs text-muted-foreground">{estudiante.email}</p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {calcularProgreso(estudiante.momentos)}% Completado
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pt-2">
                      {Object.entries(momentosLabels).map(([key, label]) => (
                        <div key={key} className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/50">
                          <div className="flex items-center gap-2">
                            {getMomentoIcon(estudiante.momentos[key as keyof typeof estudiante.momentos])}
                            <span className="text-sm">{label}</span>
                          </div>
                          {estudiante.momentos[key as keyof typeof estudiante.momentos] ? (
                            <Badge variant="default" className="bg-green-500">Completado</Badge>
                          ) : estudiante.momentos[key as keyof typeof estudiante.momentos] === false ? (
                            <Badge variant="secondary">En Progreso</Badge>
                          ) : (
                            <Badge variant="outline">Pendiente</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Actividad Reciente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Actividad Reciente
          </CardTitle>
          <CardDescription>
            Actualizaciones en tiempo real
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            {actividades.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No hay actividades recientes</p>
                <p className="text-xs mt-1">Las actualizaciones aparecerán aquí</p>
              </div>
            ) : (
              <div className="space-y-3">
                {actividades.map((actividad) => (
                  <div key={actividad.id} className="p-3 rounded-lg border bg-card">
                    <div className="flex items-start gap-2">
                      {actividad.tipo === 'progreso' && <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />}
                      {actividad.tipo === 'acta' && <FileText className="h-4 w-4 text-blue-500 mt-0.5" />}
                      {actividad.tipo === 'evaluacion' && <Activity className="h-4 w-4 text-purple-500 mt-0.5" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{actividad.descripcion}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(actividad.timestamp).toLocaleString('es-ES')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};