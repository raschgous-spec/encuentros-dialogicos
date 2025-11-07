import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { Shield, BookOpen, GraduationCap } from 'lucide-react';

type UserType = 'estudiante' | 'docente' | 'admin';

const Auth = () => {
  const [userType, setUserType] = useState<UserType>('estudiante');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [codigoCurso, setCodigoCurso] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
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
      } else {
        // Solo los estudiantes pueden registrarse
        if (userType !== 'estudiante') {
          toast({
            title: 'Registro no disponible',
            description: 'Solo los estudiantes pueden registrarse. Contacta al administrador.',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }

        if (!fullName.trim()) {
          toast({
            title: 'Error',
            description: 'Por favor ingresa tu nombre completo',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }

        if (!codigoCurso.trim()) {
          toast({
            title: 'Error',
            description: 'Por favor ingresa el código de tu curso',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }

        const { error } = await signUp(email, password, fullName, codigoCurso);
        if (error) {
          toast({
            title: 'Error al registrarse',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Registro exitoso',
            description: 'Tu cuenta ha sido creada y asociada al curso',
          });
          navigate('/');
        }
      }
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
          description: 'Gestión de cursos y estudiantes',
          icon: BookOpen,
        };
      default:
        return {
          title: 'Acceso Estudiante',
          description: 'Realiza diagnósticos y consulta tu progreso',
          icon: GraduationCap,
        };
    }
  };

  const info = getUserTypeInfo();
  const Icon = info.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Sistema de Gestión UCundinamarca
          </CardTitle>
          <CardDescription className="text-center">
            Selecciona tu tipo de acceso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selector de tipo de usuario */}
          <div className="grid grid-cols-3 gap-3">
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
              variant={userType === 'admin' ? 'default' : 'outline'}
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => setUserType('admin')}
            >
              <Shield className="h-6 w-6" />
              <span className="text-xs">Admin</span>
            </Button>
          </div>

          {/* Info del tipo de usuario seleccionado */}
          <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
            <Icon className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-semibold">{info.title}</h3>
              <p className="text-sm text-muted-foreground">{info.description}</p>
            </div>
          </div>

          {/* Formularios de login/registro */}
          <Tabs value={isLogin ? 'login' : 'signup'} onValueChange={(v) => setIsLogin(v === 'login')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="signup" disabled={userType !== 'estudiante'}>
                Registrarse
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
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
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre Completo</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Juan Pérez"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Contraseña</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="codigoCurso">Código de Curso</Label>
                  <Input
                    id="codigoCurso"
                    type="text"
                    placeholder="Ejemplo: MAT101-2025"
                    value={codigoCurso}
                    onChange={(e) => setCodigoCurso(e.target.value.toUpperCase())}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Ingresa el código proporcionado por tu docente
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Registrando...' : 'Crear Cuenta'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 text-sm text-muted-foreground">
          {userType === 'estudiante' ? (
            <p className="text-center">
              Al registrarte como estudiante, debes ingresar el código de curso proporcionado por tu docente.
            </p>
          ) : (
            <p className="text-center">
              Si eres {userType === 'admin' ? 'administrador' : 'coordinador'}, contacta al administrador del sistema para obtener tus credenciales de acceso.
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
