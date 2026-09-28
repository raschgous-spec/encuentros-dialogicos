REVOKE EXECUTE ON FUNCTION public.get_coordinator_email(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_coordinator_email(uuid) TO authenticated, service_role;