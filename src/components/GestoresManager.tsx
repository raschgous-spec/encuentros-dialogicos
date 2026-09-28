import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Gestor { id: string; correo: string; nombre_completo: string; correo_coordinador: string; created_at: string; }

export const GestoresManager = () => {
  const { hasRole } = useAuth();
  const { toast } = useToast();
  const isAdmin = hasRole('admin');
  const [gestores, setGestores] = useState<Gestor[]>([]);
  const [form, setForm] = useState({ fullName: '', email: '', password: '', correoCoordinador: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await (supabase as any).from('gestores_conocimiento').select('*').order('created_at', { ascending: false });
    setGestores(data || []);
  };
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-gestor', { body: form });
      if (error || data?.error) {
        let msg = data?.error;
        try { msg = msg || (await (error as any)?.context?.json())?.error; } catch { /* ignore */ }
        throw new Error(msg || 'No se pudo crear');
      }
      toast({ title: 'Gestor creado', description: `${form.email} ya puede ingresar con su nombre y correo.` });
      setForm({ fullName: '', email: '', password: '', correoCoordinador: '' });
      load();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Nuevo Gestor del Conocimiento y el Aprendizaje</CardTitle>
          <CardDescription>
            Tendrá las mismas vistas que {isAdmin ? 'el coordinador indicado' : 'tú'} sobre los estudiantes asignados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Nombre completo</Label>
              <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required maxLength={100} /></div>
            <div className="space-y-2"><Label>Correo</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
            {isAdmin && (
              <div className="space-y-2"><Label>Correo del coordinador</Label>
                <Input type="email" value={form.correoCoordinador} onChange={(e) => setForm({ ...form, correoCoordinador: e.target.value })} required /></div>
            )}
            <div className="md:col-span-2">
              <Button type="submit" disabled={saving}>{saving ? 'Creando...' : 'Crear gestor'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Gestores registrados ({gestores.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow>
              <TableHead>Nombre</TableHead><TableHead>Correo</TableHead><TableHead>Coordinador</TableHead><TableHead>Creado</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {gestores.map((g) => (
                <TableRow key={g.id}>
                  <TableCell>{g.nombre_completo}</TableCell>
                  <TableCell>{g.correo}</TableCell>
                  <TableCell>{g.correo_coordinador}</TableCell>
                  <TableCell>{new Date(g.created_at).toLocaleDateString('es-CO')}</TableCell>
                </TableRow>
              ))}
              {gestores.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Sin gestores aún</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
