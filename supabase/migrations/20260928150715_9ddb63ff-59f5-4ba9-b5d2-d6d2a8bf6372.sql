CREATE TABLE public.medit_sesiones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  facultad text,
  programa text,
  sede text,
  casos jsonb NOT NULL DEFAULT '{}'::jsonb,
  niveles jsonb NOT NULL DEFAULT '{}'::jsonb,
  puntaje_global numeric,
  insignia text,
  ruta jsonb NOT NULL DEFAULT '[]'::jsonb,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.medit_sesiones TO authenticated;
GRANT ALL ON public.medit_sesiones TO service_role;
ALTER TABLE public.medit_sesiones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuario ve sus sesiones MEDIT" ON public.medit_sesiones FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Gestion ve sesiones MEDIT" ON public.medit_sesiones FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'docente'::app_role) OR has_role(auth.uid(),'observador'::app_role));
CREATE INDEX medit_sesiones_user_idx ON public.medit_sesiones(user_id);