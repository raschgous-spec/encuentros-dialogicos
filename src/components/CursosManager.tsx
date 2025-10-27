import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Copy, Trash2, Users } from 'lucide-react';
import { z } from 'zod';

const cursoSchema = z.object({
  codigo: z.string()
    .trim()
    .min(4, 'El código debe tener al menos 4 caracteres')
    .max(20, 'El código debe tener máximo 20 caracteres')
    .regex(/^[A-Z0-9-]+$/, 'El código solo puede contener letras mayúsculas, números y guiones'),
  nombre: z.string()
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre debe tener máximo 100 caracteres'),
  descripcion: z.string()
    .trim()
    .max(500, 'La descripción debe tener máximo 500 caracteres')
    .optional(),
});

interface Curso {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  created_at: string;
  estudiantes_count?: number;
}

export const CursosManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      loadCursos();
    }
  }, [user]);

  const loadCursos = async () => {
    try {
      const { data: cursosData, error } = await supabase
        .from('cursos')
        .select('*')
        .eq('docente_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Cargar cantidad de estudiantes por curso
      const cursosConEstudiantes = await Promise.all(
        (cursosData || []).map(async (curso) => {
          const { count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('curso_id', curso.id);

          return {
            ...curso,
            estudiantes_count: count || 0,
          };
        })
      );

      setCursos(cursosConEstudiantes);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los cursos',
        variant: 'destructive',
      });
    }
  };

  const validateForm = () => {
    try {
      cursoSchema.parse(formData);
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0].toString()] = err.message;
          }
        });
        setFormErrors(errors);
      }
      return false;
    }
  };

  const handleCreateCurso = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.from('cursos').insert([
        {
          codigo: formData.codigo.toUpperCase(),
          nombre: formData.nombre,
          descripcion: formData.descripcion || null,
          docente_id: user?.id,
        },
      ]);

      if (error) {
        if (error.code === '23505') {
          toast({
            title: 'Error',
            description: 'Este código de curso ya existe',
            variant: 'destructive',
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: 'Curso creado',
          description: 'El curso ha sido creado exitosamente',
        });
        setFormData({ codigo: '', nombre: '', descripcion: '' });
        setIsDialogOpen(false);
        loadCursos();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'No se pudo crear el curso',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCurso = async (cursoId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este curso?')) {
      return;
    }

    try {
      const { error } = await supabase.from('cursos').delete().eq('id', cursoId);

      if (error) throw error;

      toast({
        title: 'Curso eliminado',
        description: 'El curso ha sido eliminado exitosamente',
      });
      loadCursos();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el curso',
        variant: 'destructive',
      });
    }
  };

  const handleCopyCode = (codigo: string) => {
    navigator.clipboard.writeText(codigo);
    toast({
      title: 'Código copiado',
      description: 'El código ha sido copiado al portapapeles',
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Gestión de Cursos</CardTitle>
            <CardDescription>
              Crea y administra códigos de curso para tus estudiantes
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nuevo Curso
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateCurso}>
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Curso</DialogTitle>
                  <DialogDescription>
                    Los estudiantes usarán el código para registrarse
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="codigo">Código del Curso *</Label>
                    <Input
                      id="codigo"
                      placeholder="PROG-2024-A"
                      value={formData.codigo}
                      onChange={(e) =>
                        setFormData({ ...formData, codigo: e.target.value.toUpperCase() })
                      }
                      className={formErrors.codigo ? 'border-destructive' : ''}
                    />
                    {formErrors.codigo && (
                      <p className="text-sm text-destructive">{formErrors.codigo}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre del Curso *</Label>
                    <Input
                      id="nombre"
                      placeholder="Programación Web 2024"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className={formErrors.nombre ? 'border-destructive' : ''}
                    />
                    {formErrors.nombre && (
                      <p className="text-sm text-destructive">{formErrors.nombre}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descripcion">Descripción (opcional)</Label>
                    <Textarea
                      id="descripcion"
                      placeholder="Descripción del curso..."
                      value={formData.descripcion}
                      onChange={(e) =>
                        setFormData({ ...formData, descripcion: e.target.value })
                      }
                      className={formErrors.descripcion ? 'border-destructive' : ''}
                    />
                    {formErrors.descripcion && (
                      <p className="text-sm text-destructive">{formErrors.descripcion}</p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Creando...' : 'Crear Curso'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {cursos.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No tienes cursos creados aún.</p>
            <p className="text-sm mt-2">Crea tu primer curso para comenzar.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Estudiantes</TableHead>
                <TableHead>Fecha Creación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cursos.map((curso) => (
                <TableRow key={curso.id}>
                  <TableCell className="font-mono font-medium">{curso.codigo}</TableCell>
                  <TableCell>{curso.nombre}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {curso.estudiantes_count}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(curso.created_at).toLocaleDateString('es-CO')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyCode(curso.codigo)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteCurso(curso.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
