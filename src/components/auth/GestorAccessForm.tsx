import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const GestorAccessForm = () => {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gestor-quick-access', { body: { nombre, correo } });
      if (error || !data?.token_hash) {
        let msg = data?.error;
        try { msg = msg || (await (error as any)?.context?.json())?.error; } catch { /* */ }
        throw new Error(msg || 'No fue posible validar tus datos.');
      }
      const { error: vErr } = await supabase.auth.verifyOtp({ token_hash: data.token_hash, type: 'magiclink' });
      if (vErr) throw vErr;
      toast({ title: 'Bienvenido', description: 'Acceso concedido' });
      navigate('/docente');
    } catch (err: any) {
      toast({ title: 'No pudimos darte acceso', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="g-nombre">Nombre completo</Label>
        <Input id="g-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required maxLength={100} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="g-correo">Correo</Label>
        <Input id="g-correo" type="email" placeholder="usuario@ucundinamarca.edu.co" value={correo} onChange={(e) => setCorreo(e.target.value)} required maxLength={255} />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Validando...' : 'Ingresar'}</Button>
    </form>
  );
};
