-- Folio único, asociado a una matrícula y consumido al activar la cuenta.
ALTER TABLE public.padron_alumnos
  ADD COLUMN IF NOT EXISTS folio text,
  ADD COLUMN IF NOT EXISTS folio_usado boolean NOT NULL DEFAULT false;

ALTER TABLE public.padron_alumnos
  ADD CONSTRAINT padron_alumnos_folio_format_check
    CHECK (folio IS NULL OR folio ~ '^[A-Z0-9-]{1,64}$'),
  ADD CONSTRAINT padron_alumnos_used_folio_check
    CHECK (NOT folio_usado OR folio IS NOT NULL);

CREATE UNIQUE INDEX IF NOT EXISTS padron_alumnos_folio_unique_idx
  ON public.padron_alumnos (upper(btrim(folio)))
  WHERE folio IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS padron_alumnos_one_folio_per_matricula_idx
  ON public.padron_alumnos (upper(btrim(matricula)))
  WHERE folio IS NOT NULL;

-- Mantiene reservados los folios incluso si después se elimina el registro del padrón.
CREATE TABLE IF NOT EXISTS public.used_student_folios (
  folio text PRIMARY KEY CHECK (folio ~ '^[A-Z0-9-]{1,64}$'),
  matricula text NOT NULL UNIQUE,
  activated_profile_id uuid NOT NULL,
  used_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.used_student_folios ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.used_student_folios FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.normalize_and_guard_student_folio()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
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

  IF TG_OP = 'INSERT' AND NEW.folio_usado AND current_user NOT IN ('postgres', 'service_role', 'supabase_auth_admin') THEN
    RAISE EXCEPTION 'Un folio solo se marca como utilizado durante la activación de una cuenta.';
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF OLD.folio_usado AND (NEW.folio IS DISTINCT FROM OLD.folio OR NEW.folio_usado IS DISTINCT FROM true) THEN
      RAISE EXCEPTION 'Un folio utilizado no se puede cambiar ni reasignar.';
    END IF;
    IF NEW.folio_usado IS DISTINCT FROM OLD.folio_usado
       AND current_user NOT IN ('postgres', 'service_role', 'supabase_auth_admin') THEN
      RAISE EXCEPTION 'El estado del folio solo cambia al activar una cuenta.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS normalize_and_guard_student_folio ON public.padron_alumnos;
CREATE TRIGGER normalize_and_guard_student_folio
  BEFORE INSERT OR UPDATE ON public.padron_alumnos
  FOR EACH ROW EXECUTE FUNCTION public.normalize_and_guard_student_folio();

ALTER TABLE public.student_activation_claims
  ADD COLUMN IF NOT EXISTS folio text;

-- Revoca tokens temporales emitidos por el mecanismo anterior, que no solicitaba folio.
DELETE FROM public.student_activation_claims;
DROP FUNCTION IF EXISTS public.prepare_student_activation(text, date);

CREATE OR REPLACE FUNCTION public.prepare_student_activation(p_matricula text, p_folio text, p_fecha_nacimiento date)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_token text := encode(gen_random_bytes(32), 'hex');
  v_attempts integer;
  v_matricula text := upper(trim(p_matricula));
  v_folio text := upper(regexp_replace(trim(coalesce(p_folio, '')), '[[:space:]]+', '', 'g'));
BEGIN
  IF v_matricula !~ '^[A-Z0-9-]{4,24}$' OR v_folio !~ '^[A-Z0-9-]{1,64}$' THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.student_activation_attempts(matricula, window_started_at, attempts)
    VALUES (v_matricula, now(), 1)
    ON CONFLICT (matricula) DO UPDATE SET
      attempts = CASE WHEN student_activation_attempts.window_started_at < now() - interval '1 hour'
        THEN 1 ELSE student_activation_attempts.attempts + 1 END,
      window_started_at = CASE WHEN student_activation_attempts.window_started_at < now() - interval '1 hour'
        THEN now() ELSE student_activation_attempts.window_started_at END
    RETURNING attempts INTO v_attempts;

  IF v_attempts > 6 THEN RETURN NULL; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.padron_alumnos
    WHERE upper(trim(matricula)) = v_matricula
      AND upper(btrim(folio)) = v_folio
      AND fecha_nacimiento = p_fecha_nacimiento
      AND NOT registrado
      AND NOT folio_usado
      AND NOT EXISTS (
        SELECT 1 FROM public.used_student_folios used
        WHERE used.folio = v_folio OR used.matricula = v_matricula
      )
  ) THEN RETURN NULL; END IF;

  DELETE FROM public.student_activation_claims WHERE expires_at < now();
  INSERT INTO public.student_activation_claims(token_hash, matricula, folio, fecha_nacimiento, expires_at)
    VALUES (digest(v_token, 'sha256'), v_matricula, v_folio, p_fecha_nacimiento, now() + interval '15 minutes');
  RETURN v_token;
END;
$$;
GRANT EXECUTE ON FUNCTION public.prepare_student_activation(text, text, date) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.sync_padron_on_user_create()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_matricula text := upper(trim(NEW.raw_user_meta_data->>'matricula'));
  v_folio text := upper(regexp_replace(trim(coalesce(NEW.raw_user_meta_data->>'folio', '')), '[[:space:]]+', '', 'g'));
  v_token text := NEW.raw_user_meta_data->>'activation_token';
  v_claim public.student_activation_claims%ROWTYPE;
  v_padron public.padron_alumnos%ROWTYPE;
BEGIN
  IF v_matricula IS NULL OR v_folio = '' OR v_token IS NULL THEN RETURN NEW; END IF;

  SELECT * INTO v_claim
  FROM public.student_activation_claims
  WHERE token_hash = digest(v_token, 'sha256')
    AND matricula = v_matricula
    AND folio = v_folio
    AND expires_at > now()
  FOR UPDATE;
  IF NOT FOUND THEN RETURN NEW; END IF;

  SELECT * INTO v_padron
  FROM public.padron_alumnos
  WHERE upper(trim(matricula)) = v_matricula
    AND upper(btrim(folio)) = v_folio
    AND fecha_nacimiento = v_claim.fecha_nacimiento
    AND NOT registrado
    AND NOT folio_usado
  FOR UPDATE;
  IF NOT FOUND THEN RETURN NEW; END IF;

  INSERT INTO public.used_student_folios(folio, matricula, activated_profile_id)
  VALUES (v_folio, v_matricula, NEW.id);

  UPDATE public.profiles
  SET role = 'student', matricula = v_padron.matricula,
      nombre = v_padron.nombre, apellido_paterno = v_padron.apellido_paterno,
      apellido_materno = v_padron.apellido_materno, carrera = v_padron.carrera
  WHERE id = NEW.id;

  UPDATE public.padron_alumnos
  SET registrado = true,
      profile_id = NEW.id,
      folio_usado = CASE WHEN id = v_padron.id THEN true ELSE folio_usado END,
      updated_at = now()
  WHERE upper(trim(matricula)) = v_matricula
    AND fecha_nacimiento = v_claim.fecha_nacimiento;

  DELETE FROM public.student_activation_claims WHERE token_hash = v_claim.token_hash;
  RETURN NEW;
END;
$$;
