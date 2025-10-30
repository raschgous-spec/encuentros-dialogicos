-- Crear tabla de evaluaciones
CREATE TABLE public.evaluaciones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estudiante_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  curso_id UUID REFERENCES public.cursos(id) ON DELETE SET NULL,
  fecha TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Puntajes por cada prueba
  puntaje_brainstorming DECIMAL(5,2),
  puntaje_affinity DECIMAL(5,2),
  puntaje_ishikawa DECIMAL(5,2),
  puntaje_dofa DECIMAL(5,2),
  puntaje_pareto DECIMAL(5,2),
  puntaje_promedio DECIMAL(5,2),
  
  -- Nivel alcanzado
  nivel TEXT,
  
  -- Respuestas completas (JSON)
  respuestas_completas JSONB,
  
  -- Tiempos de respuesta por pregunta/paso (en segundos)
  tiempos_respuesta JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para mejorar consultas
CREATE INDEX idx_evaluaciones_estudiante ON public.evaluaciones(estudiante_id);
CREATE INDEX idx_evaluaciones_curso ON public.evaluaciones(curso_id);
CREATE INDEX idx_evaluaciones_fecha ON public.evaluaciones(fecha DESC);

-- Enable RLS
ALTER TABLE public.evaluaciones ENABLE ROW LEVEL SECURITY;

-- Los estudiantes pueden ver sus propias evaluaciones
CREATE POLICY "Estudiantes pueden ver sus propias evaluaciones" 
ON public.evaluaciones 
FOR SELECT 
USING (auth.uid() = estudiante_id);

-- Los estudiantes pueden crear sus propias evaluaciones
CREATE POLICY "Estudiantes pueden crear sus propias evaluaciones" 
ON public.evaluaciones 
FOR INSERT 
WITH CHECK (auth.uid() = estudiante_id);

-- Los docentes pueden ver evaluaciones de estudiantes en sus cursos
CREATE POLICY "Docentes pueden ver evaluaciones de sus cursos" 
ON public.evaluaciones 
FOR SELECT 
USING (
  has_role(auth.uid(), 'docente'::app_role) 
  AND curso_id IN (
    SELECT id FROM public.cursos WHERE docente_id = auth.uid()
  )
);

-- Los admins pueden ver todas las evaluaciones
CREATE POLICY "Admins pueden ver todas las evaluaciones" 
ON public.evaluaciones 
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger para actualizar updated_at
CREATE TRIGGER update_evaluaciones_updated_at
BEFORE UPDATE ON public.evaluaciones
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();