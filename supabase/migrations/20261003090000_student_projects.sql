CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  autores TEXT NOT NULL,
  carrera TEXT,
  categoria TEXT,
  tecnologias TEXT[] NOT NULL DEFAULT '{}',
  enlace TEXT,
  imagen_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Proyectos visibles para todos" ON public.projects;
CREATE POLICY "Proyectos visibles para todos" ON public.projects FOR SELECT USING (true);

DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('project-images', 'project-images', true, 3145728, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;
