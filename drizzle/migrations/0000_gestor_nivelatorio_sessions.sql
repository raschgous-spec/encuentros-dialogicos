CREATE TABLE public.gestor_nivelatorio_sesiones (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL,
 facultad text,
 estado text NOT NULL DEFAULT 'en_progreso',
 version integer NOT NULL DEFAULT 0,
 contenido jsonb NOT NULL DEFAULT '{}'::jsonb,
 resultado jsonb,
 started_at timestamptz NOT NULL DEFAULT now(),
 finished_at timestamptz
);
GRANT SELECT ON public.gestor_nivelatorio_sesiones TO authenticated;
GRANT ALL ON public.gestor_nivelatorio_sesiones TO service_role;
ALTER TABLE public.gestor_nivelatorio_sesiones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gestor reads own nivelatorio" ON public.gestor_nivelatorio_sesiones FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admin reads nivelatorio" ON public.gestor_nivelatorio_sesiones FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Assigned coordinator reads nivelatorio" ON public.gestor_nivelatorio_sesiones FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'docente') AND EXISTS (SELECT 1 FROM public.gestores_conocimiento g WHERE g.user_id = gestor_nivelatorio_sesiones.user_id AND nullif(lower(trim(g.correo_coordinador)), '') = lower(public.get_user_email(auth.uid()))));
CREATE INDEX gestor_nivelatorio_user_idx ON public.gestor_nivelatorio_sesiones(user_id, started_at DESC);