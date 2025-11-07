-- Create table to track student progress through moments
CREATE TABLE IF NOT EXISTS public.momento_progreso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  momento TEXT NOT NULL CHECK (momento IN ('diagnostico', 'nivelatorio', 'encuentro1', 'encuentro2', 'encuentro3', 'encuentro4')),
  completado BOOLEAN DEFAULT false,
  fecha_completado TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(estudiante_id, momento)
);

-- Enable RLS
ALTER TABLE public.momento_progreso ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view their own progress
CREATE POLICY "Estudiantes pueden ver su propio progreso"
ON public.momento_progreso
FOR SELECT
USING (auth.uid() = estudiante_id);

-- Policy: Students can insert their own progress
CREATE POLICY "Estudiantes pueden crear su propio progreso"
ON public.momento_progreso
FOR INSERT
WITH CHECK (auth.uid() = estudiante_id);

-- Policy: Students can update their own progress
CREATE POLICY "Estudiantes pueden actualizar su propio progreso"
ON public.momento_progreso
FOR UPDATE
USING (auth.uid() = estudiante_id);

-- Policy: Admins and teachers can view all progress
CREATE POLICY "Docentes y admins pueden ver todo el progreso"
ON public.momento_progreso
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'docente'::app_role)
);

-- Add trigger for updated_at
CREATE TRIGGER update_momento_progreso_updated_at
BEFORE UPDATE ON public.momento_progreso
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check if a student can access a moment
CREATE OR REPLACE FUNCTION public.can_access_moment(
  _estudiante_id UUID,
  _momento TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Diagnóstico is always accessible
  IF _momento = 'diagnostico' THEN
    RETURN TRUE;
  END IF;
  
  -- Check if previous moment is completed
  IF _momento = 'nivelatorio' THEN
    RETURN EXISTS (
      SELECT 1 FROM momento_progreso 
      WHERE estudiante_id = _estudiante_id 
      AND momento = 'diagnostico' 
      AND completado = true
    );
  ELSIF _momento = 'encuentro1' THEN
    RETURN EXISTS (
      SELECT 1 FROM momento_progreso 
      WHERE estudiante_id = _estudiante_id 
      AND momento = 'nivelatorio' 
      AND completado = true
    );
  ELSIF _momento = 'encuentro2' THEN
    RETURN EXISTS (
      SELECT 1 FROM momento_progreso 
      WHERE estudiante_id = _estudiante_id 
      AND momento = 'encuentro1' 
      AND completado = true
    );
  ELSIF _momento = 'encuentro3' THEN
    RETURN EXISTS (
      SELECT 1 FROM momento_progreso 
      WHERE estudiante_id = _estudiante_id 
      AND momento = 'encuentro2' 
      AND completado = true
    );
  ELSIF _momento = 'encuentro4' THEN
    RETURN EXISTS (
      SELECT 1 FROM momento_progreso 
      WHERE estudiante_id = _estudiante_id 
      AND momento = 'encuentro3' 
      AND completado = true
    );
  END IF;
  
  RETURN FALSE;
END;
$$;