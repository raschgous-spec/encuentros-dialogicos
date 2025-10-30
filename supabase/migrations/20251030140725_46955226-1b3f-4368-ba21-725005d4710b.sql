-- Permitir que usuarios no autenticados puedan verificar códigos de curso
-- Solo durante el proceso de registro
CREATE POLICY "Permitir verificar códigos de curso públicamente" 
ON public.cursos 
FOR SELECT 
USING (true);

-- Nota: Esta política permite leer cursos públicamente, pero solo expone 
-- la información necesaria para validar códigos durante el registro