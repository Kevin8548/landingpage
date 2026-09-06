-- Habilitar extensión UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Perfiles (Se vincula automáticamente con auth.users de Supabase)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security) en perfiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS de perfiles
CREATE POLICY "Perfiles visibles públicamente" ON public.profiles FOR SELECT USING (true);
-- Nota: La inserción y actualización se manejará de forma segura (Ej: por triggers o Service Role)

-- 2. Tabla de Eventos (Para reemplazar el localStorage de eventos)
CREATE TABLE public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  fecha_inicio TIMESTAMPTZ NOT NULL,
  fecha_fin TIMESTAMPTZ NOT NULL,
  lugar TEXT NOT NULL,
  link_registro TEXT,
  imagen_url TEXT,
  es_destacado BOOLEAN DEFAULT false,
  modalidad TEXT CHECK (modalidad IN ('Presencial', 'Virtual', 'Híbrido')),
  tipo TEXT CHECK (tipo IN ('Conferencia', 'Taller', 'Hackathon', 'Feria', 'Otro')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS en eventos
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Políticas RLS de eventos
-- LECTURA: Abierta. Cualquier usuario que visite la web puede ver los eventos.
CREATE POLICY "Eventos visibles para todos" ON public.events FOR SELECT USING (true);

-- ESCRITURA: BLOQUEADA. 
-- No creamos políticas de INSERT/UPDATE/DELETE porque TODO ingreso de datos 
-- se hará a través de Edge Functions (usando service_role_key) para mayor seguridad.

-- 3. Trigger para actualizar "updated_at" automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
