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
import { z } from 'zod';

const signUpSchema = z.object({
  email: z.string().email('Email inválido').max(255, 'Email muy largo'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  fullName: z.string().trim().min(3, 'El nombre debe tener al menos 3 caracteres').max(100, 'Nombre muy largo'),
  codigoCurso: z.string().trim().optional(),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [codigoCurso, setCodigoCurso] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
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
    setFormErrors({});
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
        // Validar formulario de registro
        try {
          signUpSchema.parse({ email, password, fullName, codigoCurso });
        } catch (error) {
          if (error instanceof z.ZodError) {
            const errors: Record<string, string> = {};
            error.errors.forEach((err) => {
              if (err.path[0]) {
                errors[err.path[0].toString()] = err.message;
              }
            });
            setFormErrors(errors);
            setIsLoading(false);
            return;
          }
        }

        const { error } = await signUp(email, password, fullName, codigoCurso || undefined);
        if (error) {
          toast({
            title: 'Error al registrarse',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Registro exitoso',
            description: 'Tu cuenta ha sido creada',
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Sistema de Gestión UCundinamarca
          </CardTitle>
          <CardDescription className="text-center">
            Accede a tu cuenta o crea una nueva
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={isLogin ? 'login' : 'signup'} onValueChange={(v) => setIsLogin(v === 'login')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="signup">Registrarse</TabsTrigger>
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
                    className={formErrors.fullName ? 'border-destructive' : ''}
                    required
                  />
                  {formErrors.fullName && (
                    <p className="text-sm text-destructive">{formErrors.fullName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={formErrors.email ? 'border-destructive' : ''}
                    required
                  />
                  {formErrors.email && (
                    <p className="text-sm text-destructive">{formErrors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Contraseña</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={formErrors.password ? 'border-destructive' : ''}
                    required
                    minLength={6}
                  />
                  {formErrors.password && (
                    <p className="text-sm text-destructive">{formErrors.password}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="codigoCurso">Código de Curso (opcional)</Label>
                  <Input
                    id="codigoCurso"
                    type="text"
                    placeholder="PROG-2024-A"
                    value={codigoCurso}
                    onChange={(e) => setCodigoCurso(e.target.value.toUpperCase())}
                    className={formErrors.codigoCurso ? 'border-destructive' : ''}
                  />
                  {formErrors.codigoCurso && (
                    <p className="text-sm text-destructive">{formErrors.codigoCurso}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Si tienes un código de curso, ingrésalo aquí para asociarte con tu docente
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Registrando...' : 'Crear Cuenta'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-sm text-muted-foreground">
          <p className="text-center">
            Al registrarte, se te asignará automáticamente el rol de estudiante.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
