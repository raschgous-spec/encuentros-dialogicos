CREATE TABLE public.student_study_plans (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL,
 difficulties text NOT NULL CHECK (char_length(difficulties) BETWEEN 10 AND 2000),
 minutes_per_day integer NOT NULL CHECK (minutes_per_day IN (15,30,45,60)),
 results_snapshot jsonb NOT NULL,
 plan text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.student_study_plans TO authenticated;
GRANT ALL ON public.student_study_plans TO service_role;
ALTER TABLE public.student_study_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students read own study plans" ON public.student_study_plans FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
CREATE INDEX student_study_plans_owner_date ON public.student_study_plans(user_id, created_at DESC);
CREATE TABLE public.student_study_ai_state (
 feature text PRIMARY KEY,
 status integer NOT NULL,
 message text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.student_study_ai_state TO service_role;
ALTER TABLE public.student_study_ai_state ENABLE ROW LEVEL SECURITY;