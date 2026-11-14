-- Enrollment must check the roster in the database, not just the profile role.
CREATE OR REPLACE FUNCTION public.enroll_in_workshop(p_workshop_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student uuid := auth.uid();
  v_workshop public.event_workshops%ROWTYPE;
  v_registration uuid;
BEGIN
  IF v_student IS NULL OR NOT EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.padron_alumnos a
      ON upper(trim(a.matricula)) = upper(trim(p.matricula))
    WHERE p.id = v_student
      AND p.role = 'student'
      AND a.registrado = true
  ) THEN
    RAISE EXCEPTION 'Inicia sesión con una cuenta de alumno validada en el padrón.';
  END IF;

  SELECT * INTO v_workshop FROM public.event_workshops
    WHERE id = p_workshop_id AND published FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Este taller ya no está disponible.'; END IF;
  IF EXISTS (SELECT 1 FROM public.workshop_registrations
    WHERE event_id = v_workshop.event_id AND student_id = v_student) THEN
    RAISE EXCEPTION 'Ya tienes una inscripción para este evento.';
  END IF;
  IF EXISTS (SELECT 1 FROM public.workshop_registrations r
    JOIN public.event_workshops w ON w.id = r.workshop_id
    WHERE r.student_id = v_student AND tstzrange(w.inicia_en, w.termina_en, '[)') &&
      tstzrange(v_workshop.inicia_en, v_workshop.termina_en, '[)')) THEN
    RAISE EXCEPTION 'Este horario se cruza con otro taller en el que ya estás inscrito.';
  END IF;
  IF (SELECT count(*) FROM public.workshop_registrations WHERE workshop_id = p_workshop_id)
    >= v_workshop.capacidad THEN RAISE EXCEPTION 'El taller ya llegó a su capacidad.'; END IF;
  INSERT INTO public.workshop_registrations(workshop_id, event_id, student_id)
    VALUES (p_workshop_id, v_workshop.event_id, v_student) RETURNING id INTO v_registration;
  RETURN v_registration;
END;
$$;
GRANT EXECUTE ON FUNCTION public.enroll_in_workshop(uuid) TO authenticated;

-- Deleting the sole roster row revokes every historical account for the
-- matrícula, including profiles orphaned when old duplicate roster rows were
-- removed during the global uniqueness migration.
CREATE OR REPLACE FUNCTION public.revoke_student_access_after_roster_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_matricula text := upper(trim(OLD.matricula));
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.padron_alumnos
    WHERE upper(trim(matricula)) = v_matricula
  ) THEN
    RETURN OLD;
  END IF;

  DELETE FROM public.student_activation_claims
  WHERE upper(trim(matricula)) = v_matricula;

  DELETE FROM auth.users u
  USING public.profiles p
  WHERE u.id = p.id
    AND p.role = 'student'
    AND (p.id = OLD.profile_id OR upper(trim(coalesce(p.matricula, ''))) = v_matricula);

  RETURN OLD;
END;
$$;

-- Remove legacy student identities that have no validated roster entry. Their
-- registrations cascade with auth.users and release the occupied seats.
DELETE FROM auth.users u
USING public.profiles p
WHERE u.id = p.id
  AND p.role = 'student'
  AND NOT EXISTS (
    SELECT 1 FROM public.padron_alumnos a
    WHERE upper(trim(a.matricula)) = upper(trim(coalesce(p.matricula, '')))
      AND a.registrado = true
  );
