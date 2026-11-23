DROP POLICY IF EXISTS "Authenticated users can query coordinadores for validation" ON public.coordinadores_autorizados;
DROP POLICY IF EXISTS "Authenticated users can query estudiantes for validation" ON public.estudiantes_autorizados;

CREATE POLICY "Staff or self can read coordinadores" ON public.coordinadores_autorizados
FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'observador'::app_role)
  OR lower(correo) = lower(public.get_user_email(auth.uid()))
);

CREATE POLICY "Staff, coordinator or self can read estudiantes" ON public.estudiantes_autorizados
FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'observador'::app_role)
  OR lower(correo) = lower(public.get_user_email(auth.uid()))
  OR (public.has_role(auth.uid(), 'docente'::app_role)
      AND NULLIF(public.get_coordinator_email(auth.uid()), '') IS NOT NULL
      AND lower(correo_coordinador) = lower(public.get_coordinator_email(auth.uid())))
);