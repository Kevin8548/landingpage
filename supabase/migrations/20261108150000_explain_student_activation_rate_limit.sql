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

  IF v_attempts > 6 THEN
    RAISE EXCEPTION 'ACTIVATION_RATE_LIMITED' USING ERRCODE = 'P0001';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.padron_alumnos
    WHERE upper(trim(matricula)) = v_matricula
      AND upper(regexp_replace(trim(coalesce(folio, '')), '[[:space:]]+', '', 'g')) = v_folio
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
