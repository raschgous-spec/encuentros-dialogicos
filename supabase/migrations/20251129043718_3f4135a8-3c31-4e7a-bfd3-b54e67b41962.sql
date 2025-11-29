-- Add arbol_problemas_data column to student_evaluations table
ALTER TABLE public.student_evaluations 
ADD COLUMN IF NOT EXISTS arbol_problemas_data jsonb;