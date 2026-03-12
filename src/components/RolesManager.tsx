import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Users, Shield, GraduationCap, UserCog } from 'lucide-react';
import { HierarchicalFilters, FilterValues } from '@/components/filters/HierarchicalFilters';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'docente' | 'estudiante' | 'observador';
}

type RoleFilter = 'all' | 'admin' | 'docente' | 'estudiante' | 'observador';

const roleLabels = {
  admin: { label: 'Administrador', icon: Shield, color: 'bg-red-500' },
  docente: { label: 'Coordinador', icon: UserCog, color: 'bg-blue-500' },
  estudiante: { label: 'Estudiante', icon: GraduationCap, color: 'bg-green-500' },
  observador: { label: 'Observador Administrativo', icon: Users, color: 'bg-orange-500' },
};

const paginateQuery = async (table: string, selectCols: string) => {
  let allData: any[] = [];
  let from = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data: batch, error } = await supabase
      .from(table as any)
      .select(selectCols)
      .range(from, from + pageSize - 1);

    if (error) throw error;
    if (batch && batch.length > 0) {
      allData = [...allData, ...batch];
      from += pageSize;
      hasMore = batch.length === pageSize;
    } else {
      hasMore = false;
    }
  }
  return allData;
};

export const RolesManager = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [hierFilters, setHierFilters] = useState<FilterValues>({ sede: '', facultad: '', programa: '' });
  const [estAutorizados, setEstAutorizados] = useState<any[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const [allRoles, allProfiles, allEst] = await Promise.all([
        paginateQuery('user_roles', 'user_id, role'),
        paginateQuery('profiles', 'id, email, full_name'),
        paginateQuery('estudiantes_autorizados', 'correo, sede, facultad, programa'),
      ]);

      setEstAutorizados(allEst);

      const usersWithRoles: UserWithRole[] = allProfiles.map((profile: any) => {
        const userRole = allRoles.find((r: any) => r.user_id === profile.id);
        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          role: (userRole?.role as UserWithRole['role']) || 'estudiante',
        };
      });

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

  // Build email -> est_autorizado lookup
  const emailToEst = useMemo(() => {
    const map = new Map<string, any>();
    estAutorizados.forEach((e: any) => map.set(e.correo?.toLowerCase(), e));
    return map;
  }, [estAutorizados]);

  // Filter users by hierarchical filters
  const hierFilteredUsers = useMemo(() => {
    if (!hierFilters.sede && !hierFilters.facultad && !hierFilters.programa) return users;
    return users.filter(u => {
      const est = emailToEst.get(u.email?.toLowerCase());
      if (!est) return false;
      if (hierFilters.sede && est.sede !== hierFilters.sede) return false;
      if (hierFilters.facultad && est.facultad !== hierFilters.facultad) return false;
      if (hierFilters.programa && est.programa !== hierFilters.programa) return false;
      return true;
    });
  }, [users, hierFilters, emailToEst]);

  const filteredUsers = roleFilter === 'all' ? hierFilteredUsers : hierFilteredUsers.filter(u => u.role === roleFilter);

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
    admin: hierFilteredUsers.filter(u => u.role === 'admin').length,
    docente: hierFilteredUsers.filter(u => u.role === 'docente').length,
    observador: hierFilteredUsers.filter(u => u.role === 'observador').length,
    estudiante: hierFilteredUsers.filter(u => u.role === 'estudiante').length,
  };

  const filterLabel = () => {
    const parts: string[] = [];
    if (hierFilters.sede) parts.push(hierFilters.sede);
    if (hierFilters.facultad) parts.push(hierFilters.facultad);
    if (hierFilters.programa) parts.push(hierFilters.programa);
    return parts.length > 0 ? parts.join(' > ') : 'General (sin filtros)';
  };

  const handleExportPDF = () => {
    const doc = new jsPDF('landscape');
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 15;

    try {
      const logo = new Image();
      logo.src = '/logo-udec.png';
      doc.addImage(logo, 'PNG', (pageWidth - 60) / 2, y, 60, 20);
      y += 30;
    } catch { y += 5; }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE DE ROLES DE USUARIO', pageWidth / 2, y, { align: 'center' });
    y += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Filtro: ${filterLabel()}${roleFilter !== 'all' ? ` | Rol: ${roleLabels[roleFilter]?.label}` : ''}`, pageWidth / 2, y, { align: 'center' });
    y += 5;
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')} | Total: ${filteredUsers.length} usuarios`, pageWidth / 2, y, { align: 'center' });
    y += 10;

    // Summary table
    autoTable(doc, {
      startY: y,
      head: [['Rol', 'Cantidad']],
      body: [
        ['Administradores', counts.admin.toString()],
        ['Coordinadores', counts.docente.toString()],
        ['Observadores', counts.observador.toString()],
        ['Estudiantes', counts.estudiante.toString()],
        ['Total', hierFilteredUsers.length.toString()],
      ],
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9 },
      tableWidth: 100,
    });

    y = (doc as any).lastAutoTable.finalY + 10;

    // Detailed user list
    autoTable(doc, {
      startY: y,
      head: [['Nombre', 'Correo', 'Rol']],
      body: filteredUsers.map(u => [
        u.full_name || 'Sin nombre',
        u.email,
        roleLabels[u.role]?.label || u.role,
      ]),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 2 },
    });

    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Página ${i} de ${pageCount} | Encuentros Dialógicos - Universidad de Cundinamarca`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }

    doc.save(`roles_${new Date().toISOString().split('T')[0]}.pdf`);
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

  const statCards: { key: RoleFilter; icon: typeof Shield; count: number; label: string; iconClass: string }[] = [
    { key: 'admin', icon: Shield, count: counts.admin, label: 'Administradores', iconClass: 'text-destructive' },
    { key: 'docente', icon: UserCog, count: counts.docente, label: 'Coordinadores', iconClass: 'text-primary' },
    { key: 'observador', icon: Users, count: counts.observador, label: 'Observadores', iconClass: 'text-secondary-foreground' },
    { key: 'estudiante', icon: GraduationCap, count: counts.estudiante, label: 'Estudiantes', iconClass: 'text-accent-foreground' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Roles</h2>
          <p className="text-muted-foreground">Administra los roles de los usuarios del sistema</p>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{hierFilteredUsers.length} usuarios</span>
        </div>
      </div>

      {/* Filtros jerárquicos */}
      <Card>
        <CardContent className="pt-4">
          <HierarchicalFilters
            data={estAutorizados.map((e: any) => ({ sede: e.sede, facultad: e.facultad, programa: e.programa }))}
            filters={hierFilters}
            onFilterChange={setHierFilters}
            onExportPDF={handleExportPDF}
          />
        </CardContent>
      </Card>

      {/* Stats - clickable to filter */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ key, icon: Icon, count, label, iconClass }) => (
          <Card
            key={key}
            className={`cursor-pointer transition-all hover:shadow-md ${roleFilter === key ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setRoleFilter(roleFilter === key ? 'all' : key)}
          >
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Icon className={`h-5 w-5 ${iconClass}`} />
                <div>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(roleFilter !== 'all' || hierFilters.sede || hierFilters.facultad || hierFilters.programa) && (
        <p className="text-sm text-muted-foreground">
          Mostrando {filteredUsers.length} usuario(s).{' '}
          {roleFilter !== 'all' && (
            <button className="text-primary underline" onClick={() => setRoleFilter('all')}>Ver todos los roles</button>
          )}
        </p>
      )}

      {/* User list */}
      <div className="grid gap-4">
        {filteredUsers.map(user => (
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
