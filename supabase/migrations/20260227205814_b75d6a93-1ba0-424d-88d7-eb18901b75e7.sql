
-- Map remaining students with alternative program name matches
-- Using extensions.unaccent since we moved it there

-- 1. INGENIERIA DE SISTEMAS -> INGENIERÍA DE SISTEMAS Y COMPUTACIÓN (various sedes)
UPDATE public.estudiantes_autorizados ea
SET correo_coordinador = ca.correo, nombre_coordinador = ca.nombre_completo
FROM public.coordinadores_autorizados ca
WHERE (ea.correo_coordinador = '' OR ea.correo_coordinador IS NULL)
  AND UPPER(ea.sede) LIKE '%' || UPPER(ca.sede) || '%'
  AND (
    (UPPER(ea.programa) LIKE 'INGENIERIA DE SISTEMAS%' AND UPPER(ca.programa) LIKE 'INGENIERÍA DE SISTEMAS%')
    OR (UPPER(ea.programa) LIKE 'INGENIERIA DE SOFTWARE%' AND UPPER(ca.programa) LIKE 'INGENIERÍA DE SOFTWARE%')
    OR (UPPER(ea.programa) LIKE 'INGENIERÍA MECATRÓNICA%' AND UPPER(ca.programa) LIKE 'INGENIERÍA MECATRÓNICA%')
    OR (UPPER(ea.programa) LIKE 'ADMINISTRACION DE EMPRESAS%' AND UPPER(ca.programa) LIKE 'ADMINISTRACIÓN DE EMPRESAS%')
    OR (UPPER(ea.programa) LIKE 'ADMINISTRACIÓN DE EMPRESAS%' AND UPPER(ca.programa) LIKE 'ADMINISTRACIÓN DE EMPRESAS%')
    OR (UPPER(ea.programa) LIKE 'CIENCIAS DEL DEPORTE%' AND UPPER(ca.programa) LIKE '%EDUCACIÓN FÍSICA%')
    OR (UPPER(ea.programa) LIKE 'LICENCIATURA EN EDUCACIÓN FÍSICA%' AND UPPER(ca.programa) LIKE '%EDUCACIÓN FÍSICA%')
    OR (UPPER(ea.programa) LIKE 'LIC.%CIENCIAS SOCIALES%' AND UPPER(ca.programa) LIKE '%CIENCIAS SOCIALES%')
    OR (UPPER(ea.programa) LIKE 'LICENCIATURA EN CIENCIAS SOCIALES%' AND UPPER(ca.programa) LIKE '%CIENCIAS SOCIALES%')
    OR (UPPER(ea.programa) LIKE 'ZOOTECNIA%' AND UPPER(ca.programa) LIKE 'ZOOTECNIA%')
    OR (UPPER(ea.programa) LIKE 'CONTADURIA PUBLICA%' AND UPPER(ca.programa) LIKE 'CONTADURÍA PÚBLICA%')
    OR (UPPER(ea.programa) LIKE 'MUSICA%' AND UPPER(ca.programa) LIKE 'MÚSICA%')
    OR (UPPER(ea.programa) LIKE 'MEDICINA VETERINARIA%' AND UPPER(ca.programa) LIKE 'MEDICINA VETERINARIA%')
    OR (UPPER(ea.programa) LIKE 'TECNOLOGIA EN DESARROLLO DE SOFTWARE%' AND UPPER(ca.programa) LIKE '%SOFTWARE%')
    OR (UPPER(ea.programa) LIKE 'LICENCIATURA EN MATEMATICAS%' AND UPPER(ca.programa) LIKE '%CIENCIAS BÁSICAS%')
    OR (UPPER(ea.programa) LIKE 'LIC.%EDUCACION BASICA%CIENCIAS SOCIALES%' AND UPPER(ca.programa) LIKE '%CIENCIAS SOCIALES%')
  );
