-- Habilitar realtime para las tablas de progreso y actividad de estudiantes

-- Habilitar REPLICA IDENTITY FULL para capturar cambios completos
ALTER TABLE public.momento_progreso REPLICA IDENTITY FULL;
ALTER TABLE public.actas_encuentro REPLICA IDENTITY FULL;
ALTER TABLE public.student_evaluations REPLICA IDENTITY FULL;

-- Agregar las tablas a la publicación de realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.momento_progreso;
ALTER PUBLICATION supabase_realtime ADD TABLE public.actas_encuentro;
ALTER PUBLICATION supabase_realtime ADD TABLE public.student_evaluations;