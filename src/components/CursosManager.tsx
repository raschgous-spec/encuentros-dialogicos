import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Copy, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cursoSchema } from '@/lib/validations';

interface Curso {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  created_at: string;
  estudiantes_count?: number;
}

export const CursosManager = () => {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newCurso, setNewCurso] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCursos();
  }, []);

  const fetchCursos = async () => {
    try {
      const { data: cursosData, error } = await supabase
        .from('cursos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Obtener conteo de estudiantes para cada curso
      const cursosWithCount = await Promise.all(
        (cursosData || []).map(async (curso) => {
          const { count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('curso_id', curso.id);
          
          return { ...curso, estudiantes_count: count || 0 };
        })
      );

      setCursos(cursosWithCount);
    } catch (error) {
      console.error('Error fetching cursos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los CAI - Encuentros dialógicos',
        variant: 'destructive',
      });
    }
  };

  const handleCreateCurso = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      const upperCaseCodigo = newCurso.codigo.toUpperCase();

      // Validate input data with Zod
      const validationResult = cursoSchema.safeParse({
        codigo: upperCaseCodigo,
        nombre: newCurso.nombre,
        descripcion: newCurso.descripcion
      });

      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        toast({
          title: 'Error de validación',
          description: firstError.message,
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.from('cursos').insert({
        codigo: validationResult.data.codigo,
        nombre: validationResult.data.nombre,
        descripcion: validationResult.data.descripcion || null,
        docente_id: user.id,
      });

      if (error) throw error;

      toast({
        title: 'CAI - Encuentros dialógicos creado',
        description: 'El CAI - Encuentros dialógicos se ha creado exitosamente',
      });

      setNewCurso({ codigo: '', nombre: '', descripcion: '' });
      setIsOpen(false);
      fetchCursos();
    } catch (error: any) {
      console.error('Error creating curso:', error);
      
      // Map database errors to user-friendly messages
      const getSafeErrorMessage = () => {
        if (error.code === '23505') {
          return 'Ya existe un CAI - Encuentros dialógicos con este código. Por favor usa un código diferente.';
        }
        return 'No se pudo crear el CAI - Encuentros dialógicos. Por favor intenta nuevamente.';
      };
      
      toast({
        title: 'Error',
        description: getSafeErrorMessage(),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCurso = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este CAI - Encuentros dialógicos? Los estudiantes perderán la asociación.')) {
      return;
    }

    try {
      const { error } = await supabase.from('cursos').delete().eq('id', id);

      if (error) throw error;

      toast({
        title: 'CAI - Encuentros dialógicos eliminado',
        description: 'El CAI - Encuentros dialógicos se ha eliminado exitosamente',
      });

      fetchCursos();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el CAI - Encuentros dialógicos',
        variant: 'destructive',
      });
    }
  };

  const copyCodigo = (codigo: string) => {
    navigator.clipboard.writeText(codigo);
    toast({
      title: 'Código copiado',
      description: 'El código se ha copiado al portapapeles',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de CAI - Encuentros dialógicos</h2>
          <p className="text-muted-foreground">
            Crea y administra los códigos de CAI - Encuentros dialógicos para tus estudiantes
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo CAI - Encuentros dialógicos
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreateCurso}>
              <DialogHeader>
                <DialogTitle>Crear Nuevo CAI - Encuentros dialógicos</DialogTitle>
                <DialogDescription>
                  Los estudiantes usarán el código para registrarse
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código del CAI - Encuentros dialógicos *</Label>
                  <Input
                    id="codigo"
                    placeholder="MAT101-2025 (solo mayúsculas, números y guiones)"
                    value={newCurso.codigo}
                    onChange={(e) =>
                      setNewCurso({ ...newCurso, codigo: e.target.value.toUpperCase() })
                    }
                    required
                    maxLength={20}
                  />
                  <p className="text-xs text-muted-foreground">
                    Debe ser único. Ejemplo: MAT101-2025
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del CAI - Encuentros dialógicos *</Label>
                  <Input
                    id="nombre"
                    placeholder="Matemáticas I"
                    value={newCurso.nombre}
                    onChange={(e) => setNewCurso({ ...newCurso, nombre: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción (opcional)</Label>
                  <Textarea
                    id="descripcion"
                    placeholder="Descripción del CAI - Encuentros dialógicos..."
                    value={newCurso.descripcion}
                    onChange={(e) => setNewCurso({ ...newCurso, descripcion: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creando...' : 'Crear CAI - Encuentros dialógicos'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cursos.map((curso) => (
          <Card key={curso.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{curso.nombre}</CardTitle>
                  <CardDescription>{curso.descripcion}</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteCurso(curso.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <code className="text-sm font-mono font-semibold">{curso.codigo}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyCodigo(curso.codigo)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{curso.estudiantes_count} estudiante(s)</span>
              </div>
              <Badge variant="outline" className="text-xs">
                Creado: {new Date(curso.created_at).toLocaleDateString()}
              </Badge>
            </CardContent>
          </Card>
        ))}

        {cursos.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">
                No tienes CAI - Encuentros dialógicos creados. Crea tu primer CAI - Encuentros dialógicos para comenzar.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
