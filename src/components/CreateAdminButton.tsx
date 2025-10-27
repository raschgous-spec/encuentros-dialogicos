import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Shield } from 'lucide-react';

export const CreateAdminButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateAdmin = async () => {
    setIsLoading(true);
    try {
      // Intentar resetear la contraseña del usuario existente
      const response = await supabase.functions.invoke('reset-admin-password', {
        body: {},
      });

      if (response.error) {
        throw new Error(response.error.message || 'Error al configurar admin');
      }

      toast({
        title: 'Credenciales de Admin configuradas',
        description: 'Email: santiago@raschgo.com | Contraseña: 123456',
        duration: 5000,
      });
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudieron configurar las credenciales',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCreateAdmin}
      disabled={isLoading}
      variant="outline"
      className="flex items-center gap-2"
    >
      <Shield className="h-4 w-4" />
      {isLoading ? 'Configurando...' : 'Configurar Admin (santiago@raschgo.com)'}
    </Button>
  );
};
