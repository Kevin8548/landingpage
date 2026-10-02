-- Permitir a los administradores administrar el padrón directamente desde el frontend
CREATE POLICY "Admins pueden hacer todo en padron_alumnos"
ON public.padron_alumnos
FOR ALL
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
