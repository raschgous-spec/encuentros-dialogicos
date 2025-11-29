-- Add unique constraint for upsert operations on actas_encuentro
ALTER TABLE public.actas_encuentro
ADD CONSTRAINT actas_encuentro_estudiante_momento_unique 
UNIQUE (estudiante_id, momento);