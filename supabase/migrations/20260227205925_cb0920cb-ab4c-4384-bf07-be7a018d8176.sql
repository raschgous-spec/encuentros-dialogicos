
-- Map remaining students with specific coordinator program matches
-- CHÍA: INGENIERÍA MECATRÓNICA -> egutierrez (INGENIERÍA DE SISTEMAS Y COMPUTACIÓN / MECA)
UPDATE public.estudiantes_autorizados
SET correo_coordinador = 'egutierrez@ucundinamarca.edu.co', nombre_coordinador = 'EDUARD NEFTALI GUTIERREZ RODRIGUEZ'
WHERE (correo_coordinador = '' OR correo_coordinador IS NULL)
  AND UPPER(sede) LIKE '%CHÍA%' AND UPPER(programa) LIKE 'INGENIERÍA MECATRÓNICA%';

-- SOACHA: CIENCIAS DEL DEPORTE -> csuarezr
UPDATE public.estudiantes_autorizados
SET correo_coordinador = 'csuarezr@ucundinamarca.edu.co', nombre_coordinador = 'CARLOS ANDRES SUAREZ REYES'
WHERE (correo_coordinador = '' OR correo_coordinador IS NULL)
  AND UPPER(sede) LIKE '%SOACHA%' AND UPPER(programa) LIKE 'CIENCIAS DEL DEPORTE%';

-- SOACHA: CONTADURIA PUBLICA -> jmaca
UPDATE public.estudiantes_autorizados
SET correo_coordinador = 'jmaca@ucundinamarca.edu.co', nombre_coordinador = 'JOSE MARIA MACA MACA'
WHERE (correo_coordinador = '' OR correo_coordinador IS NULL)
  AND UPPER(sede) LIKE '%SOACHA%' AND UPPER(programa) LIKE 'CONTADURIA PUBLICA%';

-- UBATÉ: MEDICINA VETERINARIA Y ZOOTECNIA -> luiseduardosanchez
UPDATE public.estudiantes_autorizados
SET correo_coordinador = 'luiseduardosanchez@ucundinamarca.edu.co', nombre_coordinador = 'LUIS EDUARDO SANCHEZ'
WHERE (correo_coordinador = '' OR correo_coordinador IS NULL)
  AND UPPER(sede) LIKE '%UBAT%' AND UPPER(programa) LIKE 'MEDICINA VETERINARIA%';
