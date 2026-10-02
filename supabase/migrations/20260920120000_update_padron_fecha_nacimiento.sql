-- Eliminar la columna curp y añadir fecha_nacimiento
ALTER TABLE public.padron_alumnos DROP COLUMN IF EXISTS curp;
ALTER TABLE public.padron_alumnos ADD COLUMN fecha_nacimiento DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE public.padron_alumnos ALTER COLUMN fecha_nacimiento DROP DEFAULT;

-- Actualizar la función RPC para que valide usando la fecha de nacimiento en lugar del CURP
DROP FUNCTION IF EXISTS validate_padron(text, text);

CREATE OR REPLACE FUNCTION validate_padron(p_matricula text, p_fecha_nacimiento date)
RETURNS jsonb AS $$
DECLARE
  v_padron record;
BEGIN
  SELECT * INTO v_padron FROM public.padron_alumnos 
  WHERE matricula = p_matricula AND fecha_nacimiento = p_fecha_nacimiento;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Matrícula o fecha de nacimiento incorrectas';
  END IF;
  
  IF v_padron.registrado THEN
    RAISE EXCEPTION 'Esta matrícula ya ha sido registrada';
  END IF;
  
  RETURN to_jsonb(v_padron);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
