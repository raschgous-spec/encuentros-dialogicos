
-- Associate students with their coordinators based on matching sede, facultad, and programa
UPDATE public.estudiantes_autorizados ea
SET correo_coordinador = ca.correo,
    nombre_coordinador = ca.nombre_completo
FROM public.coordinadores_autorizados ca
WHERE (ea.correo_coordinador = '' OR ea.correo_coordinador IS NULL)
  AND UPPER(TRIM(ea.sede)) = UPPER(TRIM(ca.sede))
  AND UPPER(TRIM(ea.facultad)) = UPPER(TRIM(ca.facultad))
  AND UPPER(TRIM(ea.programa)) = UPPER(TRIM(ca.programa));
