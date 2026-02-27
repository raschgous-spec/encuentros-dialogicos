
-- Create a security definer function to get user email without RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_email(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT email FROM public.profiles WHERE id = _user_id LIMIT 1;
$$;

-- Fix the RLS policy to avoid infinite recursion
DROP POLICY IF EXISTS "Users can view relevant profiles" ON public.profiles;

CREATE POLICY "Users can view relevant profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  auth.uid() = id
  OR has_role(auth.uid(), 'admin'::app_role)
  OR (
    has_role(auth.uid(), 'docente'::app_role) 
    AND (
      curso_id IN (SELECT cursos.id FROM cursos WHERE cursos.docente_id = auth.uid())
      OR LOWER(email) IN (
        SELECT LOWER(ea.correo) FROM estudiantes_autorizados ea
        WHERE LOWER(ea.correo_coordinador) = LOWER(public.get_user_email(auth.uid()))
      )
    )
  )
);
