import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Users, Shield, GraduationCap, UserCog } from 'lucide-react';

interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'docente' | 'estudiante' | 'observador';
}

const roleLabels = {
  admin: { label: 'Administrador', icon: Shield, color: 'bg-red-500' },
  docente: { label: 'Coordinador', icon: UserCog, color: 'bg-blue-500' },
  estudiante: { label: 'Estudiante', icon: GraduationCap, color: 'bg-green-500' },
  observador: { label: 'Observador Administrativo', icon: Users, color: 'bg-orange-500' },
};

export const RolesManager = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch all roles first (much smaller table)
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Fetch all profiles using pagination to avoid 1000 row limit
      let allProfiles: { id: string; email: string; full_name: string | null }[] = [];
      let from = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data: batch, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .range(from, from + pageSize - 1);

        if (profilesError) throw profilesError;
        if (batch && batch.length > 0) {
          allProfiles = [...allProfiles, ...batch];
          from += pageSize;
          hasMore = batch.length === pageSize;
        } else {
          hasMore = false;
        }
      }

      const usersWithRoles: UserWithRole[] = allProfiles.map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.id);
        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          role: (userRole?.role as UserWithRole['role']) || 'estudiante',
        };
      });

      // Sort: admins first, then docentes, then estudiantes
      usersWithRoles.sort((a, b) => {
        const order = { admin: 0, docente: 1, observador: 2, estudiante: 3 };
        return order[a.role] - order[b.role];
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdating(userId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('No estás autenticado');
        return;
      }

      const { data, error } = await supabase.functions.invoke('update-user-role', {
        body: { user_id: userId, new_role: newRole },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success(data.message || 'Rol actualizado correctamente');
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole as UserWithRole['role'] } : user
      ));
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error(error.message || 'Error al actualizar rol');
    } finally {
      setUpdating(null);
    }
  };

  const getRoleBadge = (role: UserWithRole['role']) => {
    const config = roleLabels[role];
    const Icon = config.icon;
    return (
      <Badge variant="secondary" className={`${config.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const counts = {
    admin: users.filter(u => u.role === 'admin').length,
    docente: users.filter(u => u.role === 'docente').length,
    observador: users.filter(u => u.role === 'observador').length,
    estudiante: users.filter(u => u.role === 'estudiante').length,
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Roles</h2>
          <p className="text-muted-foreground">Administra los roles de los usuarios del sistema</p>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{users.length} usuarios</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-2xl font-bold">{counts.admin}</p>
                <p className="text-xs text-muted-foreground">Administradores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <UserCog className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{counts.docente}</p>
                <p className="text-xs text-muted-foreground">Coordinadores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-secondary-foreground" />
              <div>
                <p className="text-2xl font-bold">{counts.observador}</p>
                <p className="text-xs text-muted-foreground">Observadores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-accent-foreground" />
              <div>
                <p className="text-2xl font-bold">{counts.estudiante}</p>
                <p className="text-xs text-muted-foreground">Estudiantes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User list */}
      <div className="grid gap-4">
        {users.map(user => (
          <Card key={user.id}>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-lg font-semibold">
                      {(user.full_name || user.email)[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{user.full_name || 'Sin nombre'}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {getRoleBadge(user.role)}
                  <Select
                    value={user.role}
                    onValueChange={(value) => handleRoleChange(user.id, value)}
                    disabled={updating === user.id}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Cambiar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="docente">Coordinador</SelectItem>
                      <SelectItem value="observador">Observador Administrativo</SelectItem>
                      <SelectItem value="estudiante">Estudiante</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
