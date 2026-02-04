-- Tabla para coordinadores autorizados
CREATE TABLE public.coordinadores_autorizados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facultad TEXT NOT NULL,
    programa TEXT NOT NULL,
    sede TEXT NOT NULL,
    nombre_completo TEXT NOT NULL,
    correo TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla para estudiantes autorizados
CREATE TABLE public.estudiantes_autorizados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sede TEXT NOT NULL,
    facultad TEXT NOT NULL,
    programa TEXT NOT NULL,
    documento TEXT NOT NULL UNIQUE,
    nombre_completo TEXT NOT NULL,
    correo TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.coordinadores_autorizados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estudiantes_autorizados ENABLE ROW LEVEL SECURITY;

-- Políticas para coordinadores_autorizados (solo lectura pública para validación)
CREATE POLICY "Cualquiera puede consultar coordinadores para validación"
ON public.coordinadores_autorizados
FOR SELECT
USING (true);

CREATE POLICY "Solo admins pueden modificar coordinadores"
ON public.coordinadores_autorizados
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Políticas para estudiantes_autorizados (solo lectura pública para validación)
CREATE POLICY "Cualquiera puede consultar estudiantes para validación"
ON public.estudiantes_autorizados
FOR SELECT
USING (true);

CREATE POLICY "Solo admins pueden modificar estudiantes"
ON public.estudiantes_autorizados
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));