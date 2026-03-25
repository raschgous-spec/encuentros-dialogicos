import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const LtiCallback = () => {
  const navigate = useNavigate();
  const { user, roles, loading } = useAuth();
  const [status, setStatus] = useState('Autenticando desde Moodle...');

  useEffect(() => {
    // The auth verify redirect will set the session via the URL hash
    // We just need to wait for it to be picked up by onAuthStateChange
    const timer = setTimeout(() => {
      if (!user && !loading) {
        setStatus('Error de autenticación. Intenta acceder nuevamente desde Moodle.');
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [user, loading]);

  useEffect(() => {
    if (!loading && user && roles.length > 0) {
      // Redirect based on role
      if (roles.includes('admin')) {
        navigate('/admin', { replace: true });
      } else if (roles.includes('docente')) {
        navigate('/docente', { replace: true });
      } else if (roles.includes('observador')) {
        navigate('/observador', { replace: true });
      } else {
        navigate('/estudiante', { replace: true });
      }
    }
  }, [user, roles, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
        <p className="text-lg text-foreground">{status}</p>
        <p className="text-sm text-muted-foreground">
          Conectando tu sesión de Moodle...
        </p>
      </div>
    </div>
  );
};

export default LtiCallback;
