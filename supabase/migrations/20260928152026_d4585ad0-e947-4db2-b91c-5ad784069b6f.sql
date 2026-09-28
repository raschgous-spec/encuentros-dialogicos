ALTER TABLE public.gestores_conocimiento ADD COLUMN IF NOT EXISTS facultad text;
ALTER TABLE public.gestores_conocimiento ALTER COLUMN correo_coordinador SET DEFAULT '';