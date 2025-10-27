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
      const response = await supabase.functions.invoke('create-admin', {
        body: {},
      });

      if (response.error) {
        throw new Error(response.error.message || 'Error al crear admin');
      }

      toast({
        title: 'Admin creado',
        description: 'Usuario: santiago@raschgo.com | Contraseña: 123456',
      });
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear el usuario admin',
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
      {isLoading ? 'Creando Admin...' : 'Crear Usuario Admin'}
    </Button>
  );
};
