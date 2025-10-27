-- Crear tabla de cursos
CREATE TABLE public.cursos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  docente_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;

-- Políticas para cursos
CREATE POLICY "Docentes y admins pueden ver todos los cursos"
ON public.cursos
FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'docente')
);

CREATE POLICY "Docentes pueden crear sus propios cursos"
ON public.cursos
FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'docente') AND
  auth.uid() = docente_id
);

CREATE POLICY "Docentes pueden actualizar sus propios cursos"
ON public.cursos
FOR UPDATE
USING (
  public.has_role(auth.uid(), 'docente') AND
  auth.uid() = docente_id
);

CREATE POLICY "Docentes pueden eliminar sus propios cursos"
ON public.cursos
FOR DELETE
USING (
  public.has_role(auth.uid(), 'docente') AND
  auth.uid() = docente_id
);

CREATE POLICY "Admins pueden gestionar todos los cursos"
ON public.cursos
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Agregar columna curso_id a profiles
ALTER TABLE public.profiles
ADD COLUMN curso_id UUID REFERENCES public.cursos(id) ON DELETE SET NULL;

-- Crear índice para mejor rendimiento
CREATE INDEX idx_cursos_codigo ON public.cursos(codigo);
CREATE INDEX idx_cursos_docente_id ON public.cursos(docente_id);
CREATE INDEX idx_profiles_curso_id ON public.profiles(curso_id);

-- Trigger para actualizar updated_at en cursos
CREATE TRIGGER update_cursos_updated_at
BEFORE UPDATE ON public.cursos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();