import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import udecLogo from '@/assets/udec-logo.png';

const EstudiantesAcceso = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [documento, setDocumento] = useState('');
  const [correo, setCorreo] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('student-quick-access', {
        body: { documento: documento.trim(), correo: correo.trim() },
      });
      if (error || !data?.token_hash) {
        let msg = data?.error;
        try { msg = msg || (await (error as any)?.context?.json())?.error; } catch { /* ignore */ }
        throw new Error(msg || 'No fue posible validar tus datos.');
      }
      const { error: vErr } = await supabase.auth.verifyOtp({ token_hash: data.token_hash, type: 'magiclink' });
      if (vErr) throw vErr;
      toast({ title: 'Bienvenido', description: 'Acceso concedido' });
      navigate('/estudiante');
    } catch (err: any) {
      toast({ title: 'No pudimos darte acceso', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Volver
        </Button>
        <Card className="shadow-xl">
          <CardHeader className="text-center space-y-3">
            <img src={udecLogo} alt="Universidad de Cundinamarca" className="h-16 mx-auto" />
            <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Plataforma de Estudiantes</CardTitle>
            <CardDescription>Ingresa sin registro con tu documento y tu correo institucional.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="doc">Número de documento</Label>
                <Input id="doc" inputMode="numeric" value={documento} onChange={(e) => setDocumento(e.target.value)} required maxLength={30} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mail">Correo institucional</Label>
                <Input id="mail" type="email" placeholder="usuario@ucundinamarca.edu.co" value={correo} onChange={(e) => setCorreo(e.target.value)} required maxLength={255} />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Validando...' : 'Ingresar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EstudiantesAcceso;
