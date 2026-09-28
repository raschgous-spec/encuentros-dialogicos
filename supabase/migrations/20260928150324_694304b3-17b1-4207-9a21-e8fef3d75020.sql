CREATE TABLE public.gestores_conocimiento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  correo text NOT NULL,
  nombre_completo text NOT NULL DEFAULT '',
  correo_coordinador text NOT NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gestores_conocimiento TO authenticated;
GRANT ALL ON public.gestores_conocimiento TO service_role;
ALTER TABLE public.gestores_conocimiento ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.get_coordinator_email(_user_id uuid)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(
    (SELECT lower(correo_coordinador) FROM public.gestores_conocimiento WHERE user_id = _user_id LIMIT 1),
    (SELECT lower(email) FROM public.profiles WHERE id = _user_id LIMIT 1)
  );
$$;

CREATE POLICY "Admins ven gestores" ON public.gestores_conocimiento FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Coordinador ve sus gestores" ON public.gestores_conocimiento FOR SELECT TO authenticated
  USING (lower(correo_coordinador) = lower(get_user_email(auth.uid())));
CREATE POLICY "Gestor ve su registro" ON public.gestores_conocimiento FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Docentes pueden ver evaluaciones de estudiantes asignados" ON public.evaluaciones;
CREATE POLICY "Docentes pueden ver evaluaciones de estudiantes asignados" ON public.evaluaciones FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'docente'::app_role) AND estudiante_id IN (SELECT p.id FROM profiles p WHERE lower(p.email) IN (SELECT lower(ea.correo) FROM estudiantes_autorizados ea WHERE lower(ea.correo_coordinador) = get_coordinator_email(auth.uid()))));

DROP POLICY IF EXISTS "Docentes pueden ver progreso de estudiantes asignados" ON public.momento_progreso;
CREATE POLICY "Docentes pueden ver progreso de estudiantes asignados" ON public.momento_progreso FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'docente'::app_role) AND estudiante_id IN (SELECT p.id FROM profiles p WHERE lower(p.email) IN (SELECT lower(ea.correo) FROM estudiantes_autorizados ea WHERE lower(ea.correo_coordinador) = get_coordinator_email(auth.uid()))));

DROP POLICY IF EXISTS "Docentes pueden ver evaluaciones detalladas de asignados" ON public.student_evaluations;
CREATE POLICY "Docentes pueden ver evaluaciones detalladas de asignados" ON public.student_evaluations FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'docente'::app_role) AND user_id IN (SELECT p.id FROM profiles p WHERE lower(p.email) IN (SELECT lower(ea.correo) FROM estudiantes_autorizados ea WHERE lower(ea.correo_coordinador) = get_coordinator_email(auth.uid()))));

DROP POLICY IF EXISTS "Users can view relevant profiles" ON public.profiles;
CREATE POLICY "Users can view relevant profiles" ON public.profiles FOR SELECT TO authenticated
USING ((auth.uid() = id) OR has_role(auth.uid(), 'admin'::app_role) OR (has_role(auth.uid(), 'docente'::app_role) AND ((curso_id IN (SELECT cursos.id FROM cursos WHERE cursos.docente_id = auth.uid())) OR (lower(email) IN (SELECT lower(ea.correo) FROM estudiantes_autorizados ea WHERE lower(ea.correo_coordinador) = get_coordinator_email(auth.uid()))))));