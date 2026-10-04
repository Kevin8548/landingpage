-- Reparación segura para instalaciones donde la tabla projects ya existía
-- antes de la migración inicial de proyectos.
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Proyectos visibles para todos" ON public.projects;
CREATE POLICY "Proyectos visibles para todos"
ON public.projects
FOR SELECT
TO anon, authenticated
USING (true);

GRANT SELECT ON TABLE public.projects TO anon, authenticated;
