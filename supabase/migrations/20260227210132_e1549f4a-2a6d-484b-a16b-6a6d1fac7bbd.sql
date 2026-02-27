
-- Allow coordinators to see evaluaciones of their assigned students
CREATE POLICY "Docentes pueden ver evaluaciones de estudiantes asignados"
ON public.evaluaciones FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'docente'::app_role)
  AND estudiante_id IN (
    SELECT p.id FROM profiles p
    WHERE LOWER(p.email) IN (
      SELECT LOWER(ea.correo) FROM estudiantes_autorizados ea
      WHERE LOWER(ea.correo_coordinador) = LOWER(public.get_user_email(auth.uid()))
    )
  )
);

-- Allow coordinators to see momento_progreso of their assigned students
CREATE POLICY "Docentes pueden ver progreso de estudiantes asignados"
ON public.momento_progreso FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'docente'::app_role)
  AND estudiante_id IN (
    SELECT p.id FROM profiles p
    WHERE LOWER(p.email) IN (
      SELECT LOWER(ea.correo) FROM estudiantes_autorizados ea
      WHERE LOWER(ea.correo_coordinador) = LOWER(public.get_user_email(auth.uid()))
    )
  )
);

-- Allow coordinators to see student_evaluations of their assigned students
CREATE POLICY "Docentes pueden ver evaluaciones detalladas de asignados"
ON public.student_evaluations FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'docente'::app_role)
  AND user_id IN (
    SELECT p.id FROM profiles p
    WHERE LOWER(p.email) IN (
      SELECT LOWER(ea.correo) FROM estudiantes_autorizados ea
      WHERE LOWER(ea.correo_coordinador) = LOWER(public.get_user_email(auth.uid()))
    )
  )
);
