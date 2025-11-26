import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Mail, User as UserIcon } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { docenteSchema } from '@/lib/validations';

interface Docente {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  cursos_count?: number;
}

export const DocentesManager = () => {
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [docenteToDelete, setDocenteToDelete] = useState<string | null>(null);
  const [newDocente, setNewDocente] = useState({
    email: '',
    password: '',
    fullName: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchDocentes();
  }, []);

  const fetchDocentes = async () => {
    try {
      // Obtener todos los usuarios con rol docente
      const { data: docenteRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'docente');

      if (rolesError) throw rolesError;

      const docenteIds = docenteRoles?.map(r => r.user_id) || [];

      if (docenteIds.length === 0) {
        setDocentes([]);
        return;
      }

      // Obtener perfiles de docentes
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', docenteIds)
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Obtener conteo de cursos para cada docente
      const docentesWithCount = await Promise.all(
        (profilesData || []).map(async (docente) => {
          const { count } = await supabase
            .from('cursos')
            .select('*', { count: 'exact', head: true })
            .eq('docente_id', docente.id);
          
          return { ...docente, cursos_count: count || 0 };
        })
      );

      setDocentes(docentesWithCount);
    } catch (error) {
      console.error('Error fetching docentes:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los docentes',
        variant: 'destructive',
      });
    }
  };

  const handleCreateDocente = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate input data with Zod
      const validationResult = docenteSchema.safeParse(newDocente);
      
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

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No autenticado');

      const response = await supabase.functions.invoke('create-docente', {
        body: validationResult.data,
      });

      if (response.error) {
        throw new Error(response.error.message || 'Error al crear docente');
      }

      toast({
        title: 'Coordinador creado',
        description: `Se ha creado el usuario exitosamente`,
      });

      setNewDocente({ email: '', password: '', fullName: '' });
      setIsOpen(false);
      fetchDocentes();
    } catch (error: any) {
      console.error('Error creating docente:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el coordinador. Por favor intenta nuevamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDocente = async () => {
    if (!docenteToDelete) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No autenticado');

      // Eliminar rol
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', docenteToDelete)
        .eq('role', 'docente');

      if (roleError) throw roleError;

      toast({
        title: 'Coordinador eliminado',
        description: 'El rol de coordinador ha sido eliminado',
      });

      setDeleteDialogOpen(false);
      setDocenteToDelete(null);
      fetchDocentes();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar el coordinador',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Coordinadores</h2>
          <p className="text-muted-foreground">
            Crea y administra las cuentas de los coordinadores
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Coordinador
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreateDocente}>
              <DialogHeader>
                <DialogTitle>Crear Coordinador</DialogTitle>
                <DialogDescription>
                  Crea las credenciales de acceso para un nuevo coordinador
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre Completo *</Label>
                  <Input
                    id="fullName"
                    placeholder="Juan Pérez"
                    value={newDocente.fullName}
                    onChange={(e) =>
                      setNewDocente({ ...newDocente, fullName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="docente@ucundinamarca.edu.co"
                    value={newDocente.email}
                    onChange={(e) =>
                      setNewDocente({ ...newDocente, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mín. 8 caracteres, 1 mayúscula, 1 número"
                    value={newDocente.password}
                    onChange={(e) =>
                      setNewDocente({ ...newDocente, password: e.target.value })
                    }
                    required
                    minLength={8}
                  />
                  <p className="text-xs text-muted-foreground">
                    El coordinador podrá cambiar su contraseña después
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creando...' : 'Crear Coordinador'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {docentes.map((docente) => (
          <Card key={docente.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    {docente.full_name || 'Sin nombre'}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    {docente.email}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setDocenteToDelete(docente.id);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">CAI - Encuentros dialógicos creados:</span>
                <Badge variant="secondary">{docente.cursos_count}</Badge>
              </div>
              <Badge variant="outline" className="text-xs">
                Creado: {new Date(docente.created_at).toLocaleDateString()}
              </Badge>
            </CardContent>
          </Card>
        ))}

        {docentes.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">
                No hay coordinadores creados. Crea el primero para comenzar.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el rol de coordinador. El usuario no podrá acceder al panel de gestión pero sus CAI - Encuentros dialógicos permanecerán.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDocenteToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDocente}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
