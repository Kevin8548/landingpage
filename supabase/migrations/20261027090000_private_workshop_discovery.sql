-- La oferta de talleres y sus cupos solo se consultan dentro del espacio
-- autenticado de alumnos; el sitio público sigue mostrando únicamente eventos.
DROP POLICY IF EXISTS "Talleres visibles" ON public.event_workshops;
CREATE POLICY "Talleres para alumnos y administración"
  ON public.event_workshops FOR SELECT TO authenticated
  USING (published OR public.current_user_is_admin());

REVOKE SELECT ON public.event_workshops FROM anon;
GRANT SELECT ON public.event_workshops TO authenticated;

CREATE OR REPLACE FUNCTION public.list_event_workshops(p_event_id uuid)
RETURNS TABLE (
  id uuid, event_id uuid, titulo text, descripcion text, ponente text, lugar text,
  inicia_en timestamptz, termina_en timestamptz, capacidad integer, ocupados bigint, mi_inscripcion uuid
) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('student', 'admin')) THEN
    RAISE EXCEPTION 'La agenda de talleres es privada para alumnos autorizados.';
  END IF;
  RETURN QUERY
    SELECT w.id, w.event_id, w.titulo, w.descripcion, w.ponente, w.lugar,
      w.inicia_en, w.termina_en, w.capacidad,
      (SELECT count(*) FROM public.workshop_registrations r WHERE r.workshop_id = w.id),
      (SELECT r.id FROM public.workshop_registrations r
        WHERE r.workshop_id = w.id AND r.student_id = auth.uid())
    FROM public.event_workshops w
    WHERE w.event_id = p_event_id AND (w.published OR public.current_user_is_admin())
    ORDER BY w.inicia_en;
END;
$$;
REVOKE ALL ON FUNCTION public.list_event_workshops(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_event_workshops(uuid) TO authenticated;
