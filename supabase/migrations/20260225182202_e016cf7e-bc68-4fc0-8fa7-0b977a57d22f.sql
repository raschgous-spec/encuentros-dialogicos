
ALTER TABLE public.estudiantes_autorizados 
ADD COLUMN nombre_coordinador text DEFAULT '',
ADD COLUMN correo_coordinador text DEFAULT '';
