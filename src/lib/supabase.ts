import { createClient } from '@supabase/supabase-js';

// Usaremos las variables de entorno de Vite (.env) para configurar Supabase.
// La clave ANON es pública y segura de exponer en el frontend siempre y cuando
// las políticas RLS estén bien configuradas en la base de datos.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
