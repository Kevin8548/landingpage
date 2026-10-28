-- Talleres asociados a eventos, inscripción con cupo transaccional y activación
-- de alumnos desde el padrón. Esta migración ya existe en el Supabase remoto.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'viewer', 'student'));

UPDATE public.profiles p SET role = 'student'
FROM public.padron_alumnos a
WHERE a.profile_id = p.id AND p.role = 'viewer';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role) VALUES (NEW.id, NEW.email, 'viewer');
  RETURN NEW;
END; $$;

CREATE TABLE IF NOT EXISTS public.event_workshops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  descripcion text NOT NULL DEFAULT '',
  ponente text NOT NULL DEFAULT '',
  lugar text NOT NULL,
  inicia_en timestamptz NOT NULL,
  termina_en timestamptz NOT NULL,
  capacidad integer NOT NULL CHECK (capacidad > 0),
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT workshop_valid_time CHECK (termina_en > inicia_en)
);
CREATE INDEX IF NOT EXISTS event_workshops_event_start_idx ON public.event_workshops(event_id, inicia_en);

CREATE TABLE IF NOT EXISTS public.workshop_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id uuid NOT NULL REFERENCES public.event_workshops(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT one_workshop_per_event UNIQUE (event_id, student_id),
  CONSTRAINT no_duplicate_workshop_signup UNIQUE (workshop_id, student_id)
);
CREATE INDEX IF NOT EXISTS workshop_registrations_workshop_idx ON public.workshop_registrations(workshop_id);

ALTER TABLE public.event_workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Perfiles visibles públicamente" ON public.profiles;
DROP POLICY IF EXISTS "Los usuarios pueden ver su propio perfil" ON public.profiles;
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$;
CREATE POLICY "Perfiles propios y para administración" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid() OR public.current_user_is_admin());
GRANT EXECUTE ON FUNCTION public.current_user_is_admin() TO authenticated;
DROP POLICY IF EXISTS "Permitir insercion publica anon" ON public.profiles;
DROP POLICY IF EXISTS "Permitir insercion a usuarios autenticados" ON public.profiles;

CREATE OR REPLACE FUNCTION public.prevent_profile_role_self_change()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
     AND current_user NOT IN ('postgres', 'service_role', 'supabase_auth_admin') THEN
    RAISE EXCEPTION 'El rol de usuario no se puede cambiar desde el perfil.';
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS prevent_profile_role_self_change ON public.profiles;
CREATE TRIGGER prevent_profile_role_self_change BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_role_self_change();

DROP POLICY IF EXISTS "Talleres visibles" ON public.event_workshops;
CREATE POLICY "Talleres visibles" ON public.event_workshops FOR SELECT TO anon, authenticated
  USING (published OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
DROP POLICY IF EXISTS "Administradores gestionan talleres" ON public.event_workshops;
CREATE POLICY "Administradores gestionan talleres" ON public.event_workshops FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
DROP POLICY IF EXISTS "Alumnos y administradores consultan inscripciones" ON public.workshop_registrations;
CREATE POLICY "Alumnos y administradores consultan inscripciones" ON public.workshop_registrations
  FOR SELECT TO authenticated USING (student_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  ));
REVOKE ALL ON public.workshop_registrations FROM anon, authenticated;
GRANT SELECT ON public.workshop_registrations TO authenticated;
GRANT SELECT ON public.event_workshops TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.event_workshops TO authenticated;

CREATE OR REPLACE FUNCTION public.enroll_in_workshop(p_workshop_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_student uuid := auth.uid();
  v_workshop public.event_workshops%ROWTYPE;
  v_registration uuid;
BEGIN
  IF v_student IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = v_student AND role = 'student'
  ) THEN RAISE EXCEPTION 'Inicia sesión con una cuenta de alumno autorizada.'; END IF;
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
END; $$;

CREATE OR REPLACE FUNCTION public.cancel_workshop_registration(p_registration_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  DELETE FROM public.workshop_registrations WHERE id = p_registration_id AND student_id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'No se encontró una inscripción tuya para cancelar.'; END IF;
END; $$;
GRANT EXECUTE ON FUNCTION public.enroll_in_workshop(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_workshop_registration(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.list_event_workshops(p_event_id uuid)
RETURNS TABLE (
  id uuid, event_id uuid, titulo text, descripcion text, ponente text, lugar text,
  inicia_en timestamptz, termina_en timestamptz, capacidad integer, ocupados bigint, mi_inscripcion uuid
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT w.id, w.event_id, w.titulo, w.descripcion, w.ponente, w.lugar,
    w.inicia_en, w.termina_en, w.capacidad,
    (SELECT count(*) FROM public.workshop_registrations r WHERE r.workshop_id = w.id),
    (SELECT r.id FROM public.workshop_registrations r
      WHERE r.workshop_id = w.id AND r.student_id = auth.uid())
  FROM public.event_workshops w
  WHERE w.event_id = p_event_id AND (w.published OR EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  )) ORDER BY w.inicia_en;
$$;
GRANT EXECUTE ON FUNCTION public.list_event_workshops(uuid) TO anon, authenticated;

CREATE TABLE IF NOT EXISTS public.student_activation_claims (
  token_hash bytea PRIMARY KEY,
  matricula text NOT NULL,
  expires_at timestamptz NOT NULL
);
ALTER TABLE public.student_activation_claims ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.student_activation_claims FROM anon, authenticated;
CREATE TABLE IF NOT EXISTS public.student_activation_attempts (
  matricula text PRIMARY KEY,
  window_started_at timestamptz NOT NULL DEFAULT now(),
  attempts integer NOT NULL DEFAULT 0
);
ALTER TABLE public.student_activation_attempts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.student_activation_attempts FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.prepare_student_activation(p_matricula text, p_fecha_nacimiento date)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE
  v_token text := encode(gen_random_bytes(32), 'hex');
  v_attempts integer;
BEGIN
  INSERT INTO public.student_activation_attempts(matricula, window_started_at, attempts)
    VALUES (trim(p_matricula), now(), 1)
    ON CONFLICT (matricula) DO UPDATE SET
      attempts = CASE WHEN student_activation_attempts.window_started_at < now() - interval '1 hour'
        THEN 1 ELSE student_activation_attempts.attempts + 1 END,
      window_started_at = CASE WHEN student_activation_attempts.window_started_at < now() - interval '1 hour'
        THEN now() ELSE student_activation_attempts.window_started_at END
    RETURNING attempts INTO v_attempts;
  IF v_attempts > 6 THEN RETURN NULL; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.padron_alumnos WHERE matricula = trim(p_matricula)
      AND fecha_nacimiento = p_fecha_nacimiento AND NOT registrado) THEN RETURN NULL; END IF;
  DELETE FROM public.student_activation_claims WHERE expires_at < now();
  INSERT INTO public.student_activation_claims(token_hash, matricula, expires_at)
    VALUES (digest(v_token, 'sha256'), trim(p_matricula), now() + interval '15 minutes');
  RETURN v_token;
END; $$;

CREATE OR REPLACE FUNCTION public.sync_padron_on_user_create()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE
  v_matricula text := NEW.raw_user_meta_data->>'matricula';
  v_token text := NEW.raw_user_meta_data->>'activation_token';
  v_claim public.student_activation_claims%ROWTYPE;
  v_padron public.padron_alumnos%ROWTYPE;
BEGIN
  IF v_matricula IS NULL OR v_token IS NULL THEN RETURN NEW; END IF;
  SELECT * INTO v_claim FROM public.student_activation_claims
    WHERE token_hash = digest(v_token, 'sha256') AND matricula = trim(v_matricula)
      AND expires_at > now() FOR UPDATE;
  IF NOT FOUND THEN RETURN NEW; END IF;
  SELECT * INTO v_padron FROM public.padron_alumnos
    WHERE matricula = trim(v_matricula) AND NOT registrado FOR UPDATE;
  IF NOT FOUND THEN RETURN NEW; END IF;
  UPDATE public.profiles SET role = 'student', matricula = v_padron.matricula,
    nombre = v_padron.nombre, apellido_paterno = v_padron.apellido_paterno,
    apellido_materno = v_padron.apellido_materno, carrera = v_padron.carrera WHERE id = NEW.id;
  UPDATE public.padron_alumnos SET registrado = true, profile_id = NEW.id WHERE id = v_padron.id;
  DELETE FROM public.student_activation_claims WHERE token_hash = v_claim.token_hash;
  RETURN NEW;
END; $$;
GRANT EXECUTE ON FUNCTION public.prepare_student_activation(text, date) TO anon, authenticated;
