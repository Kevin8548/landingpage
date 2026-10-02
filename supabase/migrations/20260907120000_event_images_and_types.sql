-- La restricción anterior puede no reconocer valores que ya existen (por
-- ejemplo, "cultural"), así que se retira antes de normalizar los datos.
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_tipo_check;

UPDATE public.events
SET tipo = CASE
  WHEN tipo IN ('Conferencia', 'Taller', 'Hackathon') THEN 'academico'
  WHEN tipo = 'Feria' THEN 'cultural'
  WHEN tipo = 'Otro' OR tipo IS NULL THEN 'cultural'
  ELSE tipo
END;

ALTER TABLE public.events
  ADD CONSTRAINT events_tipo_check
  CHECK (tipo IN ('academico', 'cultural', 'deportivo'));
ALTER TABLE public.events
  ALTER COLUMN tipo SET DEFAULT 'cultural',
  ALTER COLUMN tipo SET NOT NULL;

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS audiencia TEXT;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('event-images', 'event-images', true, 3145728, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;
