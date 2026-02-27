
-- Enable unaccent extension for accent-insensitive matching
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Associate students with coordinators using fuzzy matching on sede and programa
-- Student sede format: "UNIDAD REGIONAL, SEDE FUSAGASUGÁ" -> extract city
-- Student programa format: "ADMINISTRACION DE EMPRESAS 2007" -> match beginning
-- Coordinator sede: "FUSAGASUGÁ", programa: "ADMINISTRACIÓN DE EMPRESAS"
UPDATE public.estudiantes_autorizados ea
SET correo_coordinador = sub.correo,
    nombre_coordinador = sub.nombre_completo
FROM (
  SELECT DISTINCT ON (ea2.id) ea2.id as est_id, ca.correo, ca.nombre_completo
  FROM public.estudiantes_autorizados ea2
  CROSS JOIN public.coordinadores_autorizados ca
  WHERE (ea2.correo_coordinador = '' OR ea2.correo_coordinador IS NULL)
    AND UPPER(unaccent(ea2.sede)) LIKE '%' || UPPER(unaccent(ca.sede)) || '%'
    AND UPPER(unaccent(ea2.programa)) LIKE UPPER(unaccent(ca.programa)) || '%'
  ORDER BY ea2.id, length(ca.programa) DESC
) sub
WHERE ea.id = sub.est_id;
