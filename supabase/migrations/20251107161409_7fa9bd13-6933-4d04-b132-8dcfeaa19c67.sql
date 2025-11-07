-- Create table for storing student evaluations
CREATE TABLE public.student_evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  momento TEXT NOT NULL,
  dimension TEXT NOT NULL,
  problematica TEXT NOT NULL,
  brainstorming_data JSONB,
  affinity_data JSONB,
  ishikawa_data JSONB,
  dofa_data JSONB,
  pareto_data JSONB,
  automatic_score INTEGER NOT NULL DEFAULT 0,
  max_score INTEGER NOT NULL DEFAULT 100,
  passed BOOLEAN NOT NULL DEFAULT false,
  coordinator_reviewed BOOLEAN NOT NULL DEFAULT false,
  coordinator_score INTEGER,
  coordinator_comments TEXT,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.student_evaluations ENABLE ROW LEVEL SECURITY;

-- Students can view their own evaluations
CREATE POLICY "Students can view their own evaluations"
ON public.student_evaluations
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Students can insert their own evaluations
CREATE POLICY "Students can insert their own evaluations"
ON public.student_evaluations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Students can update their own evaluations (before coordinator review)
CREATE POLICY "Students can update their own evaluations"
ON public.student_evaluations
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND coordinator_reviewed = false);

-- Admins/Docentes can view all evaluations
CREATE POLICY "Admins can view all evaluations"
ON public.student_evaluations
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'docente')
);

-- Admins/Docentes can update evaluations for review
CREATE POLICY "Admins can review evaluations"
ON public.student_evaluations
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'docente')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'docente')
);

-- Create trigger for updated_at
CREATE TRIGGER update_student_evaluations_updated_at
BEFORE UPDATE ON public.student_evaluations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_student_evaluations_user_id ON public.student_evaluations(user_id);
CREATE INDEX idx_student_evaluations_momento ON public.student_evaluations(momento);
CREATE INDEX idx_student_evaluations_passed ON public.student_evaluations(passed);