CREATE OR REPLACE FUNCTION public.get_coordinator_email(_user_id uuid)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM public.gestores_conocimiento WHERE user_id = _user_id)
      THEN (SELECT NULLIF(lower(correo_coordinador), '') FROM public.gestores_conocimiento WHERE user_id = _user_id LIMIT 1)
    ELSE (SELECT NULLIF(lower(email), '') FROM public.profiles WHERE id = _user_id LIMIT 1)
  END;
$$;
REVOKE EXECUTE ON FUNCTION public.get_coordinator_email(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_coordinator_email(uuid) TO authenticated, service_role;