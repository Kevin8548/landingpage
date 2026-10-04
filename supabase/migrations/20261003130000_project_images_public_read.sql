-- Refuerza el acceso público de las imágenes de proyectos. El bucket ya es
-- público, pero esta política hace explícita la lectura para las URLs de las
-- tarjetas en la landing.
DROP POLICY IF EXISTS "Lectura pública de imágenes de proyectos" ON storage.objects;
CREATE POLICY "Lectura pública de imágenes de proyectos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'project-images');
