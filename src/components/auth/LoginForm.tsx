import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  isLoading: boolean;
}

export const LoginForm = ({ onSubmit, isLoading }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [sendingReset, setSendingReset] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(email, password);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setSendingReset(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast({
        title: 'Correo enviado',
        description: 'Revisa tu bandeja de entrada para restablecer tu contraseña.',
      });
      setShowForgot(false);
      setForgotEmail('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo enviar el correo de recuperación.',
        variant: 'destructive',
      });
    } finally {
      setSendingReset(false);
    }
  };

  if (showForgot) {
    return (
      <form onSubmit={handleForgotPassword} className="space-y-4 mt-4">
        <p className="text-sm text-muted-foreground">
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </p>
        <div className="space-y-2">
          <Label htmlFor="forgot-email">Email</Label>
          <Input
            id="forgot-email"
            type="email"
            placeholder="tu@email.com"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={sendingReset}>
          {sendingReset ? 'Enviando...' : 'Enviar enlace de recuperación'}
        </Button>
        <Button type="button" variant="ghost" className="w-full" onClick={() => setShowForgot(false)}>
          Volver al inicio de sesión
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </Button>
      <Button type="button" variant="link" className="w-full text-sm" onClick={() => setShowForgot(true)}>
        ¿Olvidaste tu contraseña?
      </Button>
    </form>
  );
};
