CREATE OR REPLACE FUNCTION public.student_roster_access_valid()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles profile
    JOIN public.padron_alumnos student
      ON upper(trim(student.matricula)) = upper(trim(profile.matricula))
    WHERE profile.id = auth.uid()
      AND profile.role = 'student'
      AND student.registrado = true
  );
$$;

REVOKE ALL ON FUNCTION public.student_roster_access_valid() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.student_roster_access_valid() TO authenticated;
