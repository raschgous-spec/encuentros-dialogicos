import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { studentAuthSchema } from '@/lib/validations';

interface StudentRegistrationFormProps {
  onSubmit: (data: {
    email: string;
    password: string;
    fullName: string;
    documento: string;
  }) => Promise<void>;
  isLoading: boolean;
}

export const StudentRegistrationForm = ({ onSubmit, isLoading }: StudentRegistrationFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [documento, setDocumento] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);

    try {
      const validationResult = studentAuthSchema.safeParse({
        email, password, fullName, documento
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

      // Check document exists first
      const { data: docExists, error: docError } = await supabase.rpc('check_student_document', {
        p_documento: documento,
      });

      if (docError || !docExists) {
        toast({
          title: 'Estudiante no encontrado',
          description: 'El documento ingresado no está registrado en el sistema. Contacta al administrador.',
          variant: 'destructive',
        });
        return;
      }

      // Validate document + email match via secure RPC
      const { data: validationData, error: valError } = await supabase.rpc('validate_student_registration', {
        p_documento: documento,
        p_correo: email.toLowerCase(),
      });

      if (valError || !validationData || validationData.length === 0) {
        toast({
          title: 'Datos incorrectos',
          description: 'El correo no coincide con el documento registrado.',
          variant: 'destructive',
        });
        return;
      }

      await onSubmit({ email, password, fullName, documento });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="student-documento">Número de Documento</Label>
        <Input
          id="student-documento"
          type="text"
          placeholder="Ingrese su cédula o documento"
          value={documento}
          onChange={(e) => setDocumento(e.target.value.replace(/\D/g, ''))}
          required
        />
        <p className="text-xs text-muted-foreground">
          Solo números, sin puntos ni espacios
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="student-fullName">Nombre Completo</Label>
        <Input
          id="student-fullName"
          type="text"
          placeholder="Como aparece en el documento"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="student-email">Correo Institucional</Label>
        <Input
          id="student-email"
          type="email"
          placeholder="correo@ucundinamarca.edu.co"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="student-password">Contraseña</Label>
        <Input
          id="student-password"
          type="password"
          placeholder="Mín. 8 caracteres, 1 mayúscula, 1 número"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading || isValidating}>
        {isLoading || isValidating ? 'Validando...' : 'Crear Cuenta de Estudiante'}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Tu documento y correo serán validados contra el registro de estudiantes autorizados.
      </p>
    </form>
  );
};
