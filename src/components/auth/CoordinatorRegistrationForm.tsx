import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { coordinatorAuthSchema } from '@/lib/validations';

interface CoordinatorRegistrationFormProps {
  onSubmit: (data: {
    email: string;
    password: string;
    fullName: string;
    facultad: string;
    programa: string;
    sede: string;
  }) => Promise<void>;
  isLoading: boolean;
}

interface CoordinadorAutorizado {
  facultad: string;
  programa: string;
  sede: string;
  nombre_completo: string;
  correo: string;
}

export const CoordinatorRegistrationForm = ({ onSubmit, isLoading }: CoordinatorRegistrationFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [facultad, setFacultad] = useState('');
  const [programa, setPrograma] = useState('');
  const [sede, setSede] = useState('');
  const [coordinadores, setCoordinadores] = useState<CoordinadorAutorizado[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  // Cargar coordinadores autorizados
  useEffect(() => {
    const fetchCoordinadores = async () => {
      const { data, error } = await supabase
        .from('coordinadores_autorizados')
        .select('facultad, programa, sede, nombre_completo, correo');
      
      if (error) {
        console.error('Error fetching coordinadores:', error);
        return;
      }
      
      setCoordinadores(data || []);
    };
    
    fetchCoordinadores();
  }, []);

  // Obtener listas únicas para los selectores
  const facultades = [...new Set(coordinadores.map(c => c.facultad))].sort();
  const programas = facultad 
    ? [...new Set(coordinadores.filter(c => c.facultad === facultad).map(c => c.programa))].sort()
    : [];
  const sedes = facultad && programa
    ? [...new Set(coordinadores.filter(c => c.facultad === facultad && c.programa === programa).map(c => c.sede))].sort()
    : [];

  // Validar si existe el coordinador
  const validateCoordinador = async () => {
    const coordinadorEncontrado = coordinadores.find(
      c => c.correo.toLowerCase() === email.toLowerCase() &&
           c.facultad === facultad &&
           c.programa === programa &&
           c.sede === sede
    );
    
    return coordinadorEncontrado;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);

    try {
      // Validar con Zod
      const validationResult = coordinatorAuthSchema.safeParse({
        email,
        password,
        fullName,
        facultad,
        programa,
        sede
      });

      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        toast({
          title: 'Error de validación',
          description: firstError.message,
          variant: 'destructive',
        });
        return;
      }

      // Validar que el coordinador esté en la base de datos
      const coordinador = await validateCoordinador();
      
      if (!coordinador) {
        toast({
          title: 'Coordinador no encontrado',
          description: 'Los datos ingresados no corresponden a un coordinador autorizado. Se creará una cuenta de estudiante.',
          variant: 'destructive',
        });
        return;
      }

      await onSubmit({ email, password, fullName, facultad, programa, sede });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Nombre Completo</Label>
        <Input
          id="fullName"
          type="text"
          placeholder="Como aparece en el registro"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="facultad">Facultad</Label>
        <Select value={facultad} onValueChange={(value) => {
          setFacultad(value);
          setPrograma('');
          setSede('');
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccione su facultad" />
          </SelectTrigger>
          <SelectContent>
            {facultades.map((f) => (
              <SelectItem key={f} value={f}>{f}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="programa">Programa</Label>
        <Select value={programa} onValueChange={(value) => {
          setPrograma(value);
          setSede('');
        }} disabled={!facultad}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccione su programa" />
          </SelectTrigger>
          <SelectContent>
            {programas.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sede">Sede</Label>
        <Select value={sede} onValueChange={setSede} disabled={!programa}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccione su sede" />
          </SelectTrigger>
          <SelectContent>
            {sedes.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="coord-email">Correo Institucional</Label>
        <Input
          id="coord-email"
          type="email"
          placeholder="correo@ucundinamarca.edu.co"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="coord-password">Contraseña</Label>
        <Input
          id="coord-password"
          type="password"
          placeholder="Mín. 8 caracteres, 1 mayúscula, 1 número"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading || isValidating}>
        {isLoading || isValidating ? 'Validando...' : 'Registrarse como Coordinador'}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Sus datos serán validados contra el registro de coordinadores autorizados.
      </p>
    </form>
  );
};
