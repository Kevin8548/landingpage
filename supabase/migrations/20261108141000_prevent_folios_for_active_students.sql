CREATE OR REPLACE FUNCTION public.prevent_folio_assignment_to_active_student()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.registrado AND NEW.folio IS NOT NULL
     AND (TG_OP = 'INSERT' OR NEW.folio IS DISTINCT FROM OLD.folio) THEN
    RAISE EXCEPTION 'No se puede asignar un folio a una cuenta que ya está activa.' USING ERRCODE = '23505';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS zz_prevent_folio_assignment_to_active_student ON public.padron_alumnos;
CREATE TRIGGER zz_prevent_folio_assignment_to_active_student
  BEFORE INSERT OR UPDATE ON public.padron_alumnos
  FOR EACH ROW EXECUTE FUNCTION public.prevent_folio_assignment_to_active_student();
