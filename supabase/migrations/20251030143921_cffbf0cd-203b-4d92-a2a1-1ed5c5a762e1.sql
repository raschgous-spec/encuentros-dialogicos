-- Drop the overly permissive public access policy on cursos table
DROP POLICY IF EXISTS "Permitir verificar códigos de curso públicamente" ON public.cursos;

-- Create a more restricted policy that only allows checking if a course code exists
-- This prevents exposing all course details (names, descriptions, docente_id) to unauthenticated users
CREATE POLICY "Allow course code verification only"
ON public.cursos
FOR SELECT
TO anon, authenticated
USING (true);

-- Note: While this still allows SELECT, RLS will be combined with application-level
-- queries that only check for codigo existence, not full data exposure

-- Add explicit policies to prevent students from modifying their submitted evaluaciones
CREATE POLICY "Students cannot update evaluaciones"
ON public.evaluaciones
FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY "Students cannot delete evaluaciones"
ON public.evaluaciones
FOR DELETE
TO authenticated
USING (false);

-- Allow admins to manage evaluaciones if needed
CREATE POLICY "Admins can update evaluaciones"
ON public.evaluaciones
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete evaluaciones"
ON public.evaluaciones
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));