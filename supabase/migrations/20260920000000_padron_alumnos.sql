-- Añadir columnas a profiles en caso de que falten
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS matricula TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS nombre TEXT,
  ADD COLUMN IF NOT EXISTS apellido_paterno TEXT,
  ADD COLUMN IF NOT EXISTS apellido_materno TEXT,
  ADD COLUMN IF NOT EXISTS carrera TEXT;

-- Crear tabla padron_alumnos
CREATE TABLE IF NOT EXISTS public.padron_alumnos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  matricula text UNIQUE NOT NULL,
  nombre text NOT NULL,
  apellido_paterno text NOT NULL,
  apellido_materno text,
  carrera text NOT NULL,
  curp text UNIQUE NOT NULL,
  registrado boolean DEFAULT false,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.padron_alumnos ENABLE ROW LEVEL SECURITY;

-- Políticas para padron_alumnos
-- No creamos políticas de SELECT abierto para proteger los CURPs. 
-- Usaremos una función RPC con SECURITY DEFINER para validar de forma segura.

CREATE OR REPLACE FUNCTION validate_padron(p_matricula text, p_curp text)
RETURNS jsonb AS $$
DECLARE
  v_padron record;
BEGIN
  SELECT * INTO v_padron FROM public.padron_alumnos 
  WHERE matricula = p_matricula AND curp = p_curp;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Matrícula o CURP incorrectos';
  END IF;
  
  IF v_padron.registrado THEN
    RAISE EXCEPTION 'Esta matrícula ya ha sido registrada';
  END IF;
  
  RETURN to_jsonb(v_padron);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sincronizar datos al registrar el usuario
-- Creamos un trigger en auth.users que se ejecutará DESPUÉS del trigger principal de creación de profiles.

CREATE OR REPLACE FUNCTION sync_padron_on_user_create()
RETURNS TRIGGER AS $$
DECLARE
  v_matricula TEXT;
  v_padron RECORD;
BEGIN
  v_matricula := NEW.raw_user_meta_data->>'matricula';
  
  IF v_matricula IS NOT NULL THEN
    SELECT * INTO v_padron FROM public.padron_alumnos WHERE matricula = v_matricula;
    
    IF FOUND AND NOT v_padron.registrado THEN
      -- Actualizamos el profile creado por el otro trigger
      UPDATE public.profiles
      SET 
        matricula = v_padron.matricula,
        nombre = v_padron.nombre,
        apellido_paterno = v_padron.apellido_paterno,
        apellido_materno = v_padron.apellido_materno,
        carrera = v_padron.carrera
      WHERE id = NEW.id;
      
      -- Marcamos el padrón como registrado
      UPDATE public.padron_alumnos 
      SET registrado = true, profile_id = NEW.id 
      WHERE id = v_padron.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ejecutar DESPUÉS de cualquier otro trigger en auth.users
DROP TRIGGER IF EXISTS z_sync_padron_after_user_create ON auth.users;
CREATE TRIGGER z_sync_padron_after_user_create
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE sync_padron_on_user_create();
