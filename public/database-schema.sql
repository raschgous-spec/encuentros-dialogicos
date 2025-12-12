-- =============================================
-- ENCUENTROS DIALÓGICOS DATABASE SCHEMA EXPORT
-- Universidad de Cundinamarca
-- Generated: 2025-12-12
-- =============================================

-- ENUM TYPES
CREATE TYPE public.app_role AS ENUM ('admin', 'docente', 'estudiante');

-- =============================================
-- TABLES
-- =============================================

-- PROFILES TABLE
CREATE TABLE public.profiles (
  id uuid NOT NULL PRIMARY KEY,
  email text NOT NULL,
  full_name text,
  curso_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- USER_ROLES TABLE
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- CURSOS TABLE
CREATE TABLE public.cursos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  docente_id uuid NOT NULL,
  nombre text NOT NULL,
  descripcion text,
  codigo text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- EVALUACIONES TABLE
CREATE TABLE public.evaluaciones (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estudiante_id uuid NOT NULL,
  curso_id uuid,
  fecha timestamp with time zone NOT NULL DEFAULT now(),
  puntaje_brainstorming numeric,
  puntaje_affinity numeric,
  puntaje_ishikawa numeric,
  puntaje_dofa numeric,
  puntaje_pareto numeric,
  puntaje_promedio numeric,
  respuestas_completas jsonb,
  tiempos_respuesta jsonb,
  nivel text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- STUDENT_EVALUATIONS TABLE
CREATE TABLE public.student_evaluations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  momento text NOT NULL,
  dimension text NOT NULL,
  problematica text NOT NULL,
  unidad_regional text,
  facultad text,
  programa_academico text,
  brainstorming_data jsonb,
  affinity_data jsonb,
  ishikawa_data jsonb,
  dofa_data jsonb,
  pareto_data jsonb,
  arbol_problemas_data jsonb,
  automatic_score integer NOT NULL DEFAULT 0,
  max_score integer NOT NULL DEFAULT 100,
  passed boolean NOT NULL DEFAULT false,
  coordinator_reviewed boolean NOT NULL DEFAULT false,
  coordinator_score integer,
  coordinator_comments text,
  completed_at timestamp with time zone NOT NULL DEFAULT now(),
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- MOMENTO_PROGRESO TABLE
CREATE TABLE public.momento_progreso (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estudiante_id uuid NOT NULL,
  momento text NOT NULL,
  completado boolean DEFAULT false,
  fecha_completado timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ACTAS_ENCUENTRO TABLE
CREATE TABLE public.actas_encuentro (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estudiante_id uuid NOT NULL,
  momento text NOT NULL,
  fecha date NOT NULL,
  hora_inicio time without time zone NOT NULL,
  hora_fin time without time zone NOT NULL,
  lugar text NOT NULL,
  facultad text NOT NULL,
  programa_academico text NOT NULL,
  nombre_director text NOT NULL,
  responsable text NOT NULL,
  nombre_secretario text NOT NULL,
  identificacion_secretario text NOT NULL,
  facultad_programa_secretario text NOT NULL,
  correo_secretario text NOT NULL,
  participantes text NOT NULL,
  objetivos text NOT NULL,
  agenda_bienvenida text NOT NULL,
  agenda_secretario text NOT NULL,
  agenda_informe text NOT NULL,
  agenda_lectura_orden text NOT NULL,
  agenda_documento_coordinador text NOT NULL,
  agenda_intervencion_estudiantes text NOT NULL,
  temas_institucionales jsonb NOT NULL DEFAULT '[]'::jsonb,
  temas_facultad jsonb NOT NULL DEFAULT '[]'::jsonb,
  temas_programa jsonb NOT NULL DEFAULT '[]'::jsonb,
  plan_mejoramiento jsonb NOT NULL DEFAULT '[]'::jsonb,
  proposiciones_estudiantes text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (estudiante_id, momento)
);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to check user roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'estudiante');
  
  RETURN NEW;
END;
$$;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Function to check moment access
CREATE OR REPLACE FUNCTION public.can_access_moment(_estudiante_id uuid, _momento text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF _momento = 'diagnostico' THEN RETURN TRUE; END IF;
  
  IF _momento = 'nivelatorio' THEN
    RETURN EXISTS (SELECT 1 FROM momento_progreso WHERE estudiante_id = _estudiante_id AND momento = 'diagnostico' AND completado = true);
  ELSIF _momento = 'encuentro1' THEN
    RETURN EXISTS (SELECT 1 FROM momento_progreso WHERE estudiante_id = _estudiante_id AND momento = 'nivelatorio' AND completado = true);
  ELSIF _momento = 'encuentro2' THEN
    RETURN EXISTS (SELECT 1 FROM momento_progreso WHERE estudiante_id = _estudiante_id AND momento = 'encuentro1' AND completado = true);
  ELSIF _momento = 'encuentro3' THEN
    RETURN EXISTS (SELECT 1 FROM momento_progreso WHERE estudiante_id = _estudiante_id AND momento = 'encuentro2' AND completado = true);
  ELSIF _momento = 'encuentro4' THEN
    RETURN EXISTS (SELECT 1 FROM momento_progreso WHERE estudiante_id = _estudiante_id AND momento = 'encuentro3' AND completado = true);
  END IF;
  
  RETURN FALSE;
END;
$$;

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.momento_progreso ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actas_encuentro ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Docentes pueden ver perfiles de estudiantes en sus cursos" ON public.profiles
FOR SELECT USING (
  (auth.uid() = id) OR 
  (has_role(auth.uid(), 'docente') AND curso_id IN (SELECT id FROM cursos WHERE docente_id = auth.uid())) OR 
  has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

-- USER_ROLES POLICIES
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

-- CURSOS POLICIES
CREATE POLICY "Admins pueden gestionar todos los cursos" ON public.cursos
FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Docentes pueden crear sus propios cursos" ON public.cursos
FOR INSERT WITH CHECK (has_role(auth.uid(), 'docente') AND auth.uid() = docente_id);

CREATE POLICY "Docentes pueden actualizar sus propios cursos" ON public.cursos
FOR UPDATE USING (has_role(auth.uid(), 'docente') AND auth.uid() = docente_id);

CREATE POLICY "Docentes pueden eliminar sus propios cursos" ON public.cursos
FOR DELETE USING (has_role(auth.uid(), 'docente') AND auth.uid() = docente_id);

CREATE POLICY "Docentes y admins pueden ver todos los cursos" ON public.cursos
FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'docente'));

-- EVALUACIONES POLICIES
CREATE POLICY "Estudiantes pueden crear sus propias evaluaciones" ON public.evaluaciones
FOR INSERT WITH CHECK (auth.uid() = estudiante_id);

CREATE POLICY "Estudiantes pueden ver sus propias evaluaciones" ON public.evaluaciones
FOR SELECT USING (auth.uid() = estudiante_id);

CREATE POLICY "Docentes pueden ver evaluaciones de sus cursos" ON public.evaluaciones
FOR SELECT USING (has_role(auth.uid(), 'docente') AND curso_id IN (SELECT id FROM cursos WHERE docente_id = auth.uid()));

CREATE POLICY "Admins pueden ver todas las evaluaciones" ON public.evaluaciones
FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete evaluaciones" ON public.evaluaciones
FOR DELETE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update evaluaciones" ON public.evaluaciones
FOR UPDATE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Students cannot delete evaluaciones" ON public.evaluaciones
FOR DELETE USING (false);

CREATE POLICY "Students cannot update evaluaciones" ON public.evaluaciones
FOR UPDATE USING (false);

-- STUDENT_EVALUATIONS POLICIES
CREATE POLICY "Students can insert their own evaluations" ON public.student_evaluations
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can view their own evaluations" ON public.student_evaluations
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Students can update their own evaluations" ON public.student_evaluations
FOR UPDATE USING (auth.uid() = user_id AND coordinator_reviewed = false);

CREATE POLICY "Admins can view all evaluations" ON public.student_evaluations
FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'docente'));

CREATE POLICY "Admins can review evaluations" ON public.student_evaluations
FOR UPDATE USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'docente'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'docente'));

-- MOMENTO_PROGRESO POLICIES
CREATE POLICY "Estudiantes pueden crear su propio progreso" ON public.momento_progreso
FOR INSERT WITH CHECK (auth.uid() = estudiante_id);

CREATE POLICY "Estudiantes pueden ver su propio progreso" ON public.momento_progreso
FOR SELECT USING (auth.uid() = estudiante_id);

CREATE POLICY "Estudiantes pueden actualizar su propio progreso" ON public.momento_progreso
FOR UPDATE USING (auth.uid() = estudiante_id);

CREATE POLICY "Docentes y admins pueden ver todo el progreso" ON public.momento_progreso
FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'docente'));

-- ACTAS_ENCUENTRO POLICIES
CREATE POLICY "Estudiantes pueden crear sus propias actas" ON public.actas_encuentro
FOR INSERT WITH CHECK (auth.uid() = estudiante_id);

CREATE POLICY "Estudiantes pueden ver sus propias actas" ON public.actas_encuentro
FOR SELECT USING (auth.uid() = estudiante_id);

CREATE POLICY "Estudiantes pueden actualizar sus propias actas" ON public.actas_encuentro
FOR UPDATE USING (auth.uid() = estudiante_id);

CREATE POLICY "Docentes y admins pueden ver todas las actas" ON public.actas_encuentro
FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'docente'));

-- =============================================
-- TRIGGERS
-- =============================================

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamps triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cursos_updated_at
  BEFORE UPDATE ON public.cursos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_evaluaciones_updated_at
  BEFORE UPDATE ON public.evaluaciones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_evaluations_updated_at
  BEFORE UPDATE ON public.student_evaluations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_momento_progreso_updated_at
  BEFORE UPDATE ON public.momento_progreso
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_actas_encuentro_updated_at
  BEFORE UPDATE ON public.actas_encuentro
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
