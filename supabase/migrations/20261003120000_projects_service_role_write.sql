-- La Edge Function usa service_role después de comprobar que la sesión
-- pertenece a un administrador. Este rol requiere privilegios SQL explícitos
-- para realizar las mutaciones en la tabla projects.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.projects TO service_role;
