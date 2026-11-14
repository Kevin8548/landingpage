-- Finalize an activation claim for a newly created auth user or recover a
-- student auth account left orphaned by an earlier interrupted activation.
CREATE OR REPLACE FUNCTION public.complete_student_activation(
  p_token text,
  p_matricula text,
  p_folio text,
  p_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, extensions
AS $$
DECLARE
  v_matricula text := upper(trim(p_matricula));
  v_folio text := upper(regexp_replace(trim(coalesce(p_folio, '')), '[[:space:]]+', '', 'g'));
  v_claim public.student_activation_claims%ROWTYPE;
  v_student public.padron_alumnos%ROWTYPE;
  v_profile public.profiles%ROWTYPE;
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_profile
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;
  IF NOT FOUND THEN RETURN false; END IF;

  -- The auth.users insert trigger may have already consumed the claim and
  -- linked the new account. Treat that completed state as success.
  IF v_profile.role = 'student'
     AND upper(trim(coalesce(v_profile.matricula, ''))) = v_matricula
     AND EXISTS (
       SELECT 1 FROM public.padron_alumnos a
       JOIN public.used_student_folios u
         ON u.matricula = v_matricula AND u.folio = v_folio AND u.activated_profile_id = p_user_id
       WHERE a.profile_id = p_user_id
         AND upper(trim(a.matricula)) = v_matricula
         AND upper(btrim(a.folio)) = v_folio
         AND a.registrado AND a.folio_usado
     ) THEN
    RETURN true;
  END IF;

  SELECT * INTO v_claim
  FROM public.student_activation_claims
  WHERE token_hash = digest(p_token, 'sha256')
    AND matricula = v_matricula
    AND folio = v_folio
    AND expires_at > now()
  FOR UPDATE;
  IF NOT FOUND THEN RETURN false; END IF;

  SELECT * INTO v_student
  FROM public.padron_alumnos
  WHERE upper(trim(matricula)) = v_matricula
    AND upper(btrim(folio)) = v_folio
    AND fecha_nacimiento = v_claim.fecha_nacimiento
    AND NOT registrado
    AND NOT folio_usado
  FOR UPDATE;
  IF NOT FOUND THEN RETURN false; END IF;

  IF EXISTS (
    SELECT 1 FROM public.padron_alumnos
    WHERE profile_id = p_user_id AND id <> v_student.id
  ) THEN
    RETURN false;
  END IF;

  INSERT INTO public.used_student_folios(folio, matricula, activated_profile_id)
  VALUES (v_folio, v_matricula, p_user_id);

  UPDATE public.profiles
  SET role = 'student', matricula = v_student.matricula,
      nombre = v_student.nombre, apellido_paterno = v_student.apellido_paterno,
      apellido_materno = v_student.apellido_materno, carrera = v_student.carrera
  WHERE id = p_user_id;

  UPDATE public.padron_alumnos
  SET registrado = true, profile_id = p_user_id, folio_usado = true, updated_at = now()
  WHERE id = v_student.id;

  DELETE FROM public.student_activation_claims WHERE token_hash = v_claim.token_hash;
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.complete_student_activation(text, text, text, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.complete_student_activation(text, text, text, uuid) TO service_role;
