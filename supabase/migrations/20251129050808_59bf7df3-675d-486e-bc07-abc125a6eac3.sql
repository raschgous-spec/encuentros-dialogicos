-- Add columns to store translocal problem filters in student_evaluations
ALTER TABLE public.student_evaluations 
ADD COLUMN IF NOT EXISTS unidad_regional TEXT,
ADD COLUMN IF NOT EXISTS facultad TEXT,
ADD COLUMN IF NOT EXISTS programa_academico TEXT;