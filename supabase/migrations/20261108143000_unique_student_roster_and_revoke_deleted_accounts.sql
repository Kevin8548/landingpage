-- Keep one roster entry per matrícula across all administrators. Existing
-- duplicate rows have matching student and academic data; retain the row with
-- an account/folio first, then the earliest roster entry as a stable owner.
WITH ranked AS (
  SELECT id,
         row_number() OVER (
           PARTITION BY upper(trim(matricula))
           ORDER BY coalesce(folio_usado, false) DESC,
                    coalesce(registrado, false) DESC,
                    (profile_id IS NOT NULL) DESC,
                    (folio IS NOT NULL) DESC,
                    created_at ASC NULLS LAST,
                    id ASC
         ) AS position
  FROM public.padron_alumnos
)
DELETE FROM public.padron_alumnos AS student
USING ranked
WHERE student.id = ranked.id AND ranked.position > 1;

CREATE UNIQUE INDEX IF NOT EXISTS padron_alumnos_matricula_global_unique_idx
  ON public.padron_alumnos (upper(trim(matricula)));

CREATE OR REPLACE FUNCTION public.revoke_student_access_after_roster_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_matricula text := upper(trim(OLD.matricula));
  v_profile_id uuid;
BEGIN
  -- Defensive guard in case this trigger is invoked during a future migration
  -- that temporarily moves a record while preserving another roster entry.
  IF EXISTS (
    SELECT 1 FROM public.padron_alumnos
    WHERE upper(trim(matricula)) = v_matricula
  ) THEN
    RETURN OLD;
  END IF;

  DELETE FROM public.student_activation_claims
  WHERE upper(trim(matricula)) = v_matricula;

  IF OLD.profile_id IS NOT NULL THEN
    SELECT id INTO v_profile_id
    FROM public.profiles
    WHERE id = OLD.profile_id AND role = 'student';
  END IF;

  IF v_profile_id IS NULL THEN
    SELECT id INTO v_profile_id
    FROM public.profiles
    WHERE role = 'student' AND upper(trim(matricula)) = v_matricula
    ORDER BY created_at ASC NULLS LAST, id ASC
    LIMIT 1;
  END IF;

  -- Removing auth.users also removes the profile and workshop registrations
  -- through their existing foreign keys, which immediately blocks login and
  -- releases seats held by this student.
  IF v_profile_id IS NOT NULL THEN
    DELETE FROM auth.users WHERE id = v_profile_id;
  END IF;

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS revoke_student_access_after_roster_delete ON public.padron_alumnos;
CREATE TRIGGER revoke_student_access_after_roster_delete
  AFTER DELETE ON public.padron_alumnos
  FOR EACH ROW EXECUTE FUNCTION public.revoke_student_access_after_roster_delete();
