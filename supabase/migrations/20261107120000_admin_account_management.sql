-- Solo el administrador principal puede gestionar cuentas administrativas.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_primary_admin boolean NOT NULL DEFAULT false;

-- Designa como principal a la cuenta admin más antigua una sola vez.
UPDATE public.profiles
SET is_primary_admin = true
WHERE id = (
  SELECT id
  FROM public.profiles
  WHERE role = 'admin'
  ORDER BY created_at ASC NULLS LAST, id ASC
  LIMIT 1
)
AND NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE is_primary_admin = true
);

CREATE UNIQUE INDEX IF NOT EXISTS profiles_single_primary_admin
  ON public.profiles (is_primary_admin)
  WHERE is_primary_admin = true;

CREATE OR REPLACE FUNCTION public.prevent_primary_admin_self_change()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.is_primary_admin IS DISTINCT FROM OLD.is_primary_admin
     AND current_user NOT IN ('postgres', 'service_role', 'supabase_auth_admin') THEN
    RAISE EXCEPTION 'La designación del administrador principal no se puede cambiar desde el perfil.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_primary_admin_self_change ON public.profiles;
CREATE TRIGGER prevent_primary_admin_self_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_primary_admin_self_change();
