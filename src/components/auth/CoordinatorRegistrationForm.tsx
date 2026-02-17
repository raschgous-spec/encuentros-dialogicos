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

interface CoordinatorOption {
  facultad: string;
  programa: string;
  sede: string;
}

export const CoordinatorRegistrationForm = ({ onSubmit, isLoading }: CoordinatorRegistrationFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [facultad, setFacultad] = useState('');
  const [programa, setPrograma] = useState('');
  const [sede, setSede] = useState('');
  const [options, setOptions] = useState<CoordinatorOption[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  // Load coordinator options (no PII exposed)
  useEffect(() => {
    const fetchOptions = async () => {
      const { data, error } = await supabase.rpc('get_coordinator_options');
      
      if (error) {
        console.error('Error fetching options:', error);
        return;
      }
      
      setOptions((data as CoordinatorOption[]) || []);
    };
    
    fetchOptions();
  }, []);

  const facultades = [...new Set(options.map(c => c.facultad))].sort();
  const programas = facultad 
    ? [...new Set(options.filter(c => c.facultad === facultad).map(c => c.programa))].sort()
    : [];
  const sedes = facultad && programa
    ? [...new Set(options.filter(c => c.facultad === facultad && c.programa === programa).map(c => c.sede))].sort()
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);

    try {
      const validationResult = coordinatorAuthSchema.safeParse({
        email, password, fullName, facultad, programa, sede
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

      // Validate via secure RPC (returns boolean, no PII)
      const { data: isValid, error } = await supabase.rpc('validate_coordinator_registration', {
        p_correo: email.toLowerCase(),
        p_facultad: facultad,
        p_programa: programa,
        p_sede: sede,
      });
      
      if (error || !isValid) {
        toast({
          title: 'Coordinador no encontrado',
          description: 'Los datos ingresados no corresponden a un coordinador autorizado.',
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
