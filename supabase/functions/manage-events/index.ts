import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // 1. Manejar las peticiones de pre-vuelo (CORS) del navegador
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 2. Extraer el token de seguridad que enviará tu frontend
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');

    // 3. Crear un cliente de Supabase con permisos máximos (Service Role)
    // Deno automáticamente tiene acceso a estas variables en la nube
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // 4. Validar que el token sea auténtico
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) throw new Error('Token inválido o expirado');

    // 5. Validar que el usuario sea ADMIN en la tabla profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      throw new Error('Permisos insuficientes. Solo los administradores pueden hacer esto.');
    }

    // 6. Procesar los datos enviados por el panel (Crear Evento)
    if (req.method === 'POST') {
      const eventoData = await req.json();
      
      const { data, error } = await supabase
        .from('events')
        .insert([eventoData])
        .select();

      if (error) throw error;
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      });
    }

    return new Response("Método no soportado", { headers: corsHeaders, status: 405 });
    
  } catch (error: any) {
    // Si algo falla o detecta a un intruso, devuelve un error 400
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});