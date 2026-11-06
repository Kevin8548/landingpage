-- La función manage-workshops usa la API REST de Supabase con service_role.
-- BYPASSRLS no sustituye los privilegios SQL de tabla, por eso se conceden
-- explícitamente los permisos que necesita la función administrativa.
GRANT USAGE ON SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.event_workshops TO service_role;
GRANT SELECT, DELETE ON TABLE public.workshop_registrations TO service_role;
