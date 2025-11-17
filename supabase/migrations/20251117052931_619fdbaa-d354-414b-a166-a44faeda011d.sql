-- Create table for storing meeting minutes (actas)
CREATE TABLE IF NOT EXISTS public.actas_encuentro (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estudiante_id UUID NOT NULL,
  momento TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Meeting basic info
  fecha DATE NOT NULL,
  lugar TEXT NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  facultad TEXT NOT NULL,
  programa_academico TEXT NOT NULL,
  nombre_director TEXT NOT NULL,
  responsable TEXT NOT NULL,
  
  -- Secretary info
  nombre_secretario TEXT NOT NULL,
  identificacion_secretario TEXT NOT NULL,
  facultad_programa_secretario TEXT NOT NULL,
  correo_secretario TEXT NOT NULL,
  
  -- Meeting content
  participantes TEXT NOT NULL,
  objetivos TEXT NOT NULL,
  
  -- Agenda
  agenda_bienvenida TEXT NOT NULL,
  agenda_secretario TEXT NOT NULL,
  agenda_informe TEXT NOT NULL,
  agenda_lectura_orden TEXT NOT NULL,
  agenda_documento_coordinador TEXT NOT NULL,
  agenda_intervencion_estudiantes TEXT NOT NULL,
  
  -- Topics and participations (stored as JSONB)
  temas_institucionales JSONB NOT NULL DEFAULT '[]',
  temas_facultad JSONB NOT NULL DEFAULT '[]',
  temas_programa JSONB NOT NULL DEFAULT '[]',
  
  -- Propositions and improvement plan
  proposiciones_estudiantes TEXT NOT NULL,
  plan_mejoramiento JSONB NOT NULL DEFAULT '[]'
);

-- Enable RLS
ALTER TABLE public.actas_encuentro ENABLE ROW LEVEL SECURITY;

-- Students can insert their own actas
CREATE POLICY "Estudiantes pueden crear sus propias actas"
ON public.actas_encuentro
FOR INSERT
WITH CHECK (auth.uid() = estudiante_id);

-- Students can view their own actas
CREATE POLICY "Estudiantes pueden ver sus propias actas"
ON public.actas_encuentro
FOR SELECT
USING (auth.uid() = estudiante_id);

-- Students can update their own actas
CREATE POLICY "Estudiantes pueden actualizar sus propias actas"
ON public.actas_encuentro
FOR UPDATE
USING (auth.uid() = estudiante_id);

-- Docentes and admins can view all actas
CREATE POLICY "Docentes y admins pueden ver todas las actas"
ON public.actas_encuentro
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'docente'::app_role)
);

-- Create index for faster queries
CREATE INDEX idx_actas_estudiante_momento ON public.actas_encuentro(estudiante_id, momento);

-- Create trigger for updated_at
CREATE TRIGGER update_actas_encuentro_updated_at
BEFORE UPDATE ON public.actas_encuentro
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();