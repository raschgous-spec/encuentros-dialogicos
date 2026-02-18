import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { Shield, BookOpen, GraduationCap, ArrowLeft, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import udecLogo from '@/assets/udec-logo.png';
import { LoginForm } from '@/components/auth/LoginForm';
import { CoordinatorRegistrationForm } from '@/components/auth/CoordinatorRegistrationForm';
import { StudentRegistrationForm } from '@/components/auth/StudentRegistrationForm';

type UserType = 'estudiante' | 'docente' | 'admin' | 'observador';

const Auth = () => {
  const [userType, setUserType] = useState<UserType>('estudiante');
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast({
          title: 'Error al iniciar sesión',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Sesión iniciada',
          description: 'Bienvenido de vuelta',
        });
        navigate('/');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCoordinatorRegistration = async (data: {
    email: string;
    password: string;
    fullName: string;
    facultad: string;
    programa: string;
    sede: string;
  }) => {
    setIsLoading(true);
    try {
      // Validate via secure RPC (no direct table query)
      const { data: isValid, error: coordError } = await supabase.rpc('validate_coordinator_registration', {
        p_correo: data.email.toLowerCase(),
        p_facultad: data.facultad,
        p_programa: data.programa,
        p_sede: data.sede,
      });

      if (coordError || !isValid) {
        toast({
          title: 'Error de validación',
          description: 'No se encontró un coordinador autorizado con esos datos.',
          variant: 'destructive',
        });
        return;
      }

      // Create user with docente role
      const redirectUrl = `${window.location.origin}/`;
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: data.fullName,
            facultad: data.facultad,
            programa: data.programa,
            sede: data.sede,
            is_coordinator: true,
          },
        },
      });

      if (error) {
        toast({
          title: 'Error al registrarse',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      // Update role to docente
      if (authData.user) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .update({ role: 'docente' })
          .eq('user_id', authData.user.id);

        if (roleError) {
          console.error('Error updating role:', roleError);
        }
      }

      toast({
        title: 'Registro exitoso',
        description: 'Tu cuenta de coordinador ha sido creada. Revisa tu correo para confirmar.',
      });
      setIsLogin(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Ocurrió un error inesperado',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentRegistration = async (data: {
    email: string;
    password: string;
    fullName: string;
    documento: string;
  }) => {
    setIsLoading(true);
    try {
      // Validate via secure RPC (no direct table query)
      const { data: validationData, error: valError } = await supabase.rpc('validate_student_registration', {
        p_documento: data.documento,
        p_correo: data.email.toLowerCase(),
      });

      if (valError || !validationData || validationData.length === 0) {
        toast({
          title: 'Estudiante no encontrado',
          description: 'Tu documento o correo no están registrados en el sistema.',
          variant: 'destructive',
        });
        return;
      }

      const studentInfo = validationData[0];

      // Create student user
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: data.fullName,
            documento: data.documento,
            sede: studentInfo.sede,
            facultad: studentInfo.facultad,
            programa: studentInfo.programa,
          },
        },
      });

      if (error) {
        toast({
          title: 'Error al registrarse',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Registro exitoso',
        description: 'Tu cuenta ha sido creada. Revisa tu correo para confirmar.',
      });
      setIsLogin(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Ocurrió un error inesperado',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getUserTypeInfo = () => {
    switch (userType) {
      case 'admin':
        return {
          title: 'Acceso Administrador',
          description: 'Gestión completa del sistema',
          icon: Shield,
        };
      case 'docente':
        return {
          title: 'Acceso Coordinador',
          description: 'Gestión de CAI - Encuentros dialógicos y estudiantes',
          icon: BookOpen,
        };
      case 'observador':
        return {
          title: 'Acceso Observador Administrativo',
          description: 'Visualización de actividad de estudiantes y coordinadores',
          icon: Eye,
        };
      default:
        return {
          title: 'Acceso Estudiante',
          description: 'Participa en los encuentros dialógicos',
          icon: GraduationCap,
        };
    }
  };

  const info = getUserTypeInfo();
  const Icon = info.icon;

  const canRegister = userType === 'estudiante' || userType === 'docente';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="w-full max-w-2xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        
        <Card className="w-full">
          <CardHeader className="space-y-4">
            <div className="flex justify-center">
              <img 
                src={udecLogo} 
                alt="Universidad de Cundinamarca Logo" 
                className="h-20 w-auto object-contain"
              />
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              Encuentros dialógicos Universidad de Cundinamarca
            </CardTitle>
            <CardDescription className="text-center">
              Selecciona tu tipo de acceso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={userType === 'estudiante' ? 'default' : 'outline'}
                className="flex flex-col items-center gap-2 h-auto py-4"
                onClick={() => setUserType('estudiante')}
              >
                <GraduationCap className="h-6 w-6" />
                <span className="text-xs">Estudiante</span>
              </Button>
              <Button
                type="button"
                variant={userType === 'docente' ? 'default' : 'outline'}
                className="flex flex-col items-center gap-2 h-auto py-4"
                onClick={() => setUserType('docente')}
              >
                <BookOpen className="h-6 w-6" />
                <span className="text-xs">Coordinador</span>
              </Button>
              <Button
                type="button"
                variant={userType === 'observador' ? 'default' : 'outline'}
                className="flex flex-col items-center gap-2 h-auto py-4"
                onClick={() => setUserType('observador')}
              >
                <Eye className="h-6 w-6" />
                <span className="text-xs">Observador Adm.</span>
              </Button>
              <Button
                type="button"
                variant={userType === 'admin' ? 'default' : 'outline'}
                className="flex flex-col items-center gap-2 h-auto py-4"
                onClick={() => setUserType('admin')}
              >
                <Shield className="h-6 w-6" />
                <span className="text-xs">Admin</span>
              </Button>
            </div>

            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <Icon className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">{info.title}</h3>
                <p className="text-sm text-muted-foreground">{info.description}</p>
              </div>
            </div>

            <Tabs value={isLogin ? 'login' : 'signup'} onValueChange={(v) => setIsLogin(v === 'login')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="signup" disabled={!canRegister}>
                  Registrarse
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
              </TabsContent>
              
              <TabsContent value="signup">
                {userType === 'docente' ? (
                  <CoordinatorRegistrationForm 
                    onSubmit={handleCoordinatorRegistration} 
                    isLoading={isLoading} 
                  />
                ) : userType === 'estudiante' ? (
                  <StudentRegistrationForm 
                    onSubmit={handleStudentRegistration} 
                    isLoading={isLoading} 
                  />
                ) : null}
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 text-sm text-muted-foreground">
            {userType === 'estudiante' ? (
              <p className="text-center">
                Para registrarte necesitas tu número de documento y correo institucional registrados en el sistema.
              </p>
            ) : userType === 'docente' ? (
              <p className="text-center">
                Para registrarte como coordinador, debes estar en la base de datos de coordinadores autorizados.
              </p>
            ) : userType === 'observador' ? (
              <p className="text-center">
                El acceso de Observador Administrativo es asignado por el administrador del sistema.
              </p>
            ) : (
              <p className="text-center">
                Si eres administrador, contacta al administrador del sistema para obtener tus credenciales de acceso.
              </p>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
