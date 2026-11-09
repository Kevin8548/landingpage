-- The trigger checks the private consumed-folios registry. Run that lookup with
-- table-owner rights, while still checking the JWT role before accepting any
-- client attempt to change the consumed flag.
CREATE OR REPLACE FUNCTION public.normalize_and_guard_student_folio()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_actor text := coalesce(auth.role(), current_user);
BEGIN
  NEW.folio := nullif(regexp_replace(upper(btrim(coalesce(NEW.folio, ''))), '[[:space:]]+', '', 'g'), '');

  IF NEW.folio IS NOT NULL AND NEW.folio !~ '^[A-Z0-9-]{1,64}$' THEN
    RAISE EXCEPTION 'El folio solo puede incluir letras, números y guiones (máximo 64 caracteres).';
  END IF;

  IF NEW.folio IS NOT NULL
     AND (TG_OP = 'INSERT' OR NEW.folio IS DISTINCT FROM OLD.folio)
     AND EXISTS (
       SELECT 1 FROM public.used_student_folios
       WHERE folio = NEW.folio OR matricula = upper(trim(NEW.matricula))
     ) THEN
    RAISE EXCEPTION 'El folio o la matrícula ya se utilizó para activar una cuenta.' USING ERRCODE = '23505';
  END IF;

  IF TG_OP = 'INSERT' AND NEW.folio_usado AND v_actor NOT IN ('postgres', 'service_role', 'supabase_auth_admin') THEN
    RAISE EXCEPTION 'Un folio solo se marca como utilizado durante la activación de una cuenta.';
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF OLD.folio_usado AND (NEW.folio IS DISTINCT FROM OLD.folio OR NEW.folio_usado IS DISTINCT FROM true) THEN
      RAISE EXCEPTION 'Un folio utilizado no se puede cambiar ni reasignar.';
    END IF;
    IF NEW.folio_usado IS DISTINCT FROM OLD.folio_usado
       AND v_actor NOT IN ('postgres', 'service_role', 'supabase_auth_admin') THEN
      RAISE EXCEPTION 'El estado del folio solo cambia al activar una cuenta.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
