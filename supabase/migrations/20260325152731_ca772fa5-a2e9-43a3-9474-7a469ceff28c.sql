
CREATE TABLE public.lti_platforms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  issuer text NOT NULL,
  client_id text NOT NULL,
  auth_login_url text NOT NULL,
  auth_token_url text NOT NULL,
  jwks_url text NOT NULL,
  deployment_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(issuer, client_id)
);

ALTER TABLE public.lti_platforms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can manage LTI platforms"
  ON public.lti_platforms FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.lti_nonces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nonce text NOT NULL UNIQUE,
  state text NOT NULL UNIQUE,
  platform_id uuid REFERENCES public.lti_platforms(id) ON DELETE CASCADE,
  login_hint text,
  lti_message_hint text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lti_nonces ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_lti_platforms_updated_at
  BEFORE UPDATE ON public.lti_platforms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION public.cleanup_old_nonces()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.lti_nonces WHERE created_at < now() - interval '10 minutes';
$$;
