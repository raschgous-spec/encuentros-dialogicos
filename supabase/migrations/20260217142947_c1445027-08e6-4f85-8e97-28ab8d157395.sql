
-- Create RPC to get coordinator registration options (no PII exposed)
CREATE OR REPLACE FUNCTION public.get_coordinator_options()
RETURNS TABLE(facultad text, programa text, sede text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT ca.facultad, ca.programa, ca.sede
  FROM public.coordinadores_autorizados ca
  ORDER BY ca.facultad, ca.programa, ca.sede;
$$;

-- Create RPC to validate coordinator registration (returns boolean, no PII)
CREATE OR REPLACE FUNCTION public.validate_coordinator_registration(
  p_correo text,
  p_facultad text,
  p_programa text,
  p_sede text
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.coordinadores_autorizados
    WHERE lower(correo) = lower(p_correo)
      AND facultad = p_facultad
      AND programa = p_programa
      AND sede = p_sede
  );
$$;

-- Create RPC to validate student registration (returns limited data needed for signup)
CREATE OR REPLACE FUNCTION public.validate_student_registration(
  p_documento text,
  p_correo text
)
RETURNS TABLE(is_valid boolean, sede text, facultad text, programa text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    true AS is_valid,
    ea.sede,
    ea.facultad,
    ea.programa
  FROM public.estudiantes_autorizados ea
  WHERE ea.documento = p_documento
    AND lower(ea.correo) = lower(p_correo)
  LIMIT 1;
$$;

-- Create RPC to check if student document exists (for pre-validation)
CREATE OR REPLACE FUNCTION public.check_student_document(p_documento text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.estudiantes_autorizados
    WHERE documento = p_documento
  );
$$;

-- Drop the public SELECT policies
DROP POLICY IF EXISTS "Cualquiera puede consultar coordinadores para validación" ON public.coordinadores_autorizados;
DROP POLICY IF EXISTS "Cualquiera puede consultar estudiantes para validación" ON public.estudiantes_autorizados;

-- Add authenticated-only SELECT policies (admin already has ALL via existing policy)
CREATE POLICY "Authenticated users can query coordinadores for validation"
ON public.coordinadores_autorizados
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can query estudiantes for validation"
ON public.estudiantes_autorizados
FOR SELECT
TO authenticated
USING (true);
