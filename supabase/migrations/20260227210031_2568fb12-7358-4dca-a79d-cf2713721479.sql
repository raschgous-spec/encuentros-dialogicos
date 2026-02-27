
-- Update profiles SELECT policy to allow coordinators to see their assigned students
DROP POLICY IF EXISTS "Docentes pueden ver perfiles de estudiantes en sus cursos" ON public.profiles;

CREATE POLICY "Users can view relevant profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  auth.uid() = id
  OR has_role(auth.uid(), 'admin'::app_role)
  OR (
    has_role(auth.uid(), 'docente'::app_role) 
    AND (
      -- Via cursos
      curso_id IN (SELECT cursos.id FROM cursos WHERE cursos.docente_id = auth.uid())
      -- Via correo_coordinador assignment
      OR LOWER(email) IN (
        SELECT LOWER(ea.correo) FROM estudiantes_autorizados ea
        WHERE LOWER(ea.correo_coordinador) = LOWER((SELECT p.email FROM profiles p WHERE p.id = auth.uid()))
      )
    )
  )
);
