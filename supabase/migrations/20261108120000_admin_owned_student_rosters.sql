-- Cada administrador administra únicamente los alumnos que incorporó.
ALTER TABLE public.padron_alumnos
  ADD COLUMN IF NOT EXISTS admin_id uuid;

DO $$
DECLARE
  v_owner_id uuid;
BEGIN
  SELECT id INTO v_owner_id
  FROM public.profiles
  WHERE role = 'admin'
  ORDER BY is_primary_admin DESC NULLS LAST, created_at ASC NULLS LAST, id ASC
  LIMIT 1;

  IF EXISTS (SELECT 1 FROM public.padron_alumnos WHERE admin_id IS NULL) AND v_owner_id IS NULL THEN
    RAISE EXCEPTION 'No existe una cuenta administradora para asignar la propiedad de los alumnos actuales.';
  END IF;

  IF v_owner_id IS NOT NULL THEN
    UPDATE public.padron_alumnos SET admin_id = v_owner_id WHERE admin_id IS NULL;
  END IF;
END;
$$;

ALTER TABLE public.padron_alumnos
  ALTER COLUMN admin_id SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'padron_alumnos_admin_id_fkey'
      AND conrelid = 'public.padron_alumnos'::regclass
  ) THEN
    ALTER TABLE public.padron_alumnos
      ADD CONSTRAINT padron_alumnos_admin_id_fkey
      FOREIGN KEY (admin_id) REFERENCES public.profiles(id) ON DELETE RESTRICT;
  END IF;
END;
$$;

-- Si se elimina un administrador secundario, sus registros pasan al principal
-- para conservar el padrón y permitir la baja de la cuenta.
CREATE OR REPLACE FUNCTION public.transfer_roster_before_admin_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_primary_id uuid;
BEGIN
  IF OLD.role <> 'admin' OR OLD.is_primary_admin THEN
    RETURN OLD;
  END IF;

  SELECT id INTO v_primary_id
  FROM public.profiles
  WHERE role = 'admin' AND is_primary_admin = true AND id <> OLD.id
  LIMIT 1;

  IF EXISTS (SELECT 1 FROM public.padron_alumnos WHERE admin_id = OLD.id) THEN
    IF v_primary_id IS NULL THEN
      RAISE EXCEPTION 'No se puede eliminar este administrador porque no hay un administrador principal para recibir su padrón.';
    END IF;
    UPDATE public.padron_alumnos SET admin_id = v_primary_id WHERE admin_id = OLD.id;
  END IF;

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS transfer_roster_before_admin_delete ON public.profiles;
CREATE TRIGGER transfer_roster_before_admin_delete
  BEFORE DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.transfer_roster_before_admin_delete();

DROP POLICY IF EXISTS "Admins pueden hacer todo en padron_alumnos" ON public.padron_alumnos;
DROP POLICY IF EXISTS "Cada admin consulta su propio padron" ON public.padron_alumnos;
DROP POLICY IF EXISTS "Cada admin agrega a su propio padron" ON public.padron_alumnos;
DROP POLICY IF EXISTS "Cada admin actualiza su propio padron" ON public.padron_alumnos;
DROP POLICY IF EXISTS "Cada admin elimina de su propio padron" ON public.padron_alumnos;

CREATE POLICY "Cada admin consulta su propio padron"
  ON public.padron_alumnos FOR SELECT TO authenticated
  USING (
    admin_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "Cada admin agrega a su propio padron"
  ON public.padron_alumnos FOR INSERT TO authenticated
  WITH CHECK (
    admin_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "Cada admin actualiza su propio padron"
  ON public.padron_alumnos FOR UPDATE TO authenticated
  USING (
    admin_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  )
  WITH CHECK (
    admin_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "Cada admin elimina de su propio padron"
  ON public.padron_alumnos FOR DELETE TO authenticated
  USING (
    admin_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );
