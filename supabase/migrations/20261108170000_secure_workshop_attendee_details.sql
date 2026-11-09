-- Expose only the roster fields needed by administrators to manage workshop lists.
-- Student rosters remain isolated in their normal RLS policies.
ALTER TABLE public.padron_alumnos
  ADD COLUMN IF NOT EXISTS grado text,
  ADD COLUMN IF NOT EXISTS grupo text,
  ADD COLUMN IF NOT EXISTS folio text,
  ADD COLUMN IF NOT EXISTS folio_usado boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.list_workshop_attendees(p_workshop_id uuid)
RETURNS TABLE (
  registration_id uuid,
  registered_at timestamptz,
  matricula text,
  nombre text,
  apellido_paterno text,
  apellido_materno text,
  carrera text,
  grado text,
  grupo text,
  folio text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.current_user_is_admin() THEN
    RAISE EXCEPTION 'Solo los administradores pueden consultar las listas de talleres.';
  END IF;

  RETURN QUERY
  SELECT r.id, r.created_at, p.matricula, p.nombre,
    p.apellido_paterno, p.apellido_materno, p.carrera,
    a.grado, a.grupo, a.folio
  FROM public.workshop_registrations AS r
  LEFT JOIN public.profiles AS p ON p.id = r.student_id
  LEFT JOIN public.padron_alumnos AS a ON upper(trim(a.matricula)) = upper(trim(p.matricula))
  WHERE r.workshop_id = p_workshop_id
  ORDER BY r.created_at, p.matricula;
END;
$$;

REVOKE ALL ON FUNCTION public.list_workshop_attendees(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_workshop_attendees(uuid) TO authenticated;
