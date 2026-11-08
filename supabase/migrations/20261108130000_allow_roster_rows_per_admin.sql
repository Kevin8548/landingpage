-- La matrícula puede aparecer en más de un padrón (por ejemplo, si dos tutores
-- acompañan al mismo alumno); dentro de cada padrón sigue siendo única.
ALTER TABLE public.padron_alumnos
  DROP CONSTRAINT IF EXISTS padron_alumnos_matricula_key;

ALTER TABLE public.padron_alumnos
  ADD CONSTRAINT padron_alumnos_admin_matricula_key UNIQUE (admin_id, matricula);

-- Una misma cuenta de alumno puede quedar vinculada a la copia que cada tutor
-- conserva en su padrón.
ALTER TABLE public.padron_alumnos
  DROP CONSTRAINT IF EXISTS padron_alumnos_profile_id_key;

CREATE INDEX IF NOT EXISTS padron_alumnos_profile_id_idx
  ON public.padron_alumnos (profile_id)
  WHERE profile_id IS NOT NULL;

ALTER TABLE public.student_activation_claims
  ADD COLUMN IF NOT EXISTS fecha_nacimiento date;

CREATE OR REPLACE FUNCTION public.prepare_student_activation(p_matricula text, p_fecha_nacimiento date)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_token text := encode(gen_random_bytes(32), 'hex');
  v_attempts integer;
BEGIN
  INSERT INTO public.student_activation_attempts(matricula, window_started_at, attempts)
    VALUES (trim(p_matricula), now(), 1)
    ON CONFLICT (matricula) DO UPDATE SET
      attempts = CASE WHEN student_activation_attempts.window_started_at < now() - interval '1 hour'
        THEN 1 ELSE student_activation_attempts.attempts + 1 END,
      window_started_at = CASE WHEN student_activation_attempts.window_started_at < now() - interval '1 hour'
        THEN now() ELSE student_activation_attempts.window_started_at END
    RETURNING attempts INTO v_attempts;

  IF v_attempts > 6 THEN RETURN NULL; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.padron_alumnos
    WHERE matricula = trim(p_matricula)
      AND fecha_nacimiento = p_fecha_nacimiento
      AND NOT registrado
  ) THEN RETURN NULL; END IF;

  DELETE FROM public.student_activation_claims WHERE expires_at < now();
  INSERT INTO public.student_activation_claims(token_hash, matricula, fecha_nacimiento, expires_at)
    VALUES (digest(v_token, 'sha256'), trim(p_matricula), p_fecha_nacimiento, now() + interval '15 minutes');
  RETURN v_token;
END;
$$;

-- Al activar una matrícula, sincroniza el estado de las copias del mismo alumno
-- que comparten matrícula y fecha de nacimiento.
CREATE OR REPLACE FUNCTION public.sync_padron_on_user_create()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_matricula text := NEW.raw_user_meta_data->>'matricula';
  v_token text := NEW.raw_user_meta_data->>'activation_token';
  v_claim public.student_activation_claims%ROWTYPE;
  v_padron public.padron_alumnos%ROWTYPE;
BEGIN
  IF v_matricula IS NULL OR v_token IS NULL THEN RETURN NEW; END IF;

  SELECT * INTO v_claim
  FROM public.student_activation_claims
  WHERE token_hash = digest(v_token, 'sha256')
    AND matricula = trim(v_matricula)
    AND expires_at > now()
  FOR UPDATE;
  IF NOT FOUND THEN RETURN NEW; END IF;

  SELECT * INTO v_padron
  FROM public.padron_alumnos
  WHERE matricula = trim(v_matricula)
    AND fecha_nacimiento = v_claim.fecha_nacimiento
    AND NOT registrado
  ORDER BY created_at ASC NULLS LAST, id ASC
  LIMIT 1
  FOR UPDATE;
  IF NOT FOUND THEN RETURN NEW; END IF;

  UPDATE public.profiles
  SET role = 'student', matricula = v_padron.matricula,
      nombre = v_padron.nombre, apellido_paterno = v_padron.apellido_paterno,
      apellido_materno = v_padron.apellido_materno, carrera = v_padron.carrera
  WHERE id = NEW.id;

  UPDATE public.padron_alumnos
  SET registrado = true, profile_id = NEW.id, updated_at = now()
  WHERE matricula = v_padron.matricula
    AND fecha_nacimiento = v_claim.fecha_nacimiento
    AND NOT registrado;

  DELETE FROM public.student_activation_claims WHERE token_hash = v_claim.token_hash;
  RETURN NEW;
END;
$$;
