-- Permitir a docentes y admins ver perfiles de estudiantes en sus cursos
CREATE POLICY "Docentes pueden ver perfiles de estudiantes en sus cursos" 
ON public.profiles 
FOR SELECT 
USING (
  -- Los usuarios pueden ver su propio perfil
  auth.uid() = id 
  OR 
  -- Los docentes pueden ver estudiantes de sus cursos
  (
    has_role(auth.uid(), 'docente'::app_role) 
    AND curso_id IN (
      SELECT id FROM public.cursos WHERE docente_id = auth.uid()
    )
  )
  OR
  -- Los admins pueden ver todos los perfiles
  has_role(auth.uid(), 'admin'::app_role)
);

-- Eliminar la política anterior que solo permitía ver el propio perfil
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;