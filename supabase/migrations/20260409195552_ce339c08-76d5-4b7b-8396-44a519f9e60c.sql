CREATE POLICY "Observadores pueden ver todas las actas"
ON public.actas_encuentro
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'observador'::app_role));