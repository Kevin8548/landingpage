import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('ALERTA: El frontend no envió ningún token.');
    const token = authHeader.replace('Bearer ', '');

    // 1. Verificación de secretos (ESTO APARECERÁ EN TUS LOGS DE SUPABASE)
    const url = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('ADMIN_SERVICE_KEY') ?? '';
    
    console.log("URL detectada:", url ? "SÍ" : "NO");
    console.log("Service Key detectada:", serviceKey ? "SÍ" : "NO (¡Aquí está el error!)");

    if (!serviceKey) throw new Error("La función no encuentra la llave maestra en el servidor.");

    // 2. Cliente con poder absoluto (Service Role)
    const supabaseAdmin = createClient(url, serviceKey);

    // 3. Verificamos quién es el usuario usando su token
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) throw new Error('Token inválido');

    // 4. Verificamos si es admin en la BD (usando el cliente superpoderoso)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error("Error leyendo perfiles:", profileError);
      throw new Error("No se pudo leer el perfil del usuario.");
    }

    if (profile?.role !== 'admin') throw new Error('Permisos insuficientes.');

    // 5. Guardar evento
    if (req.method === 'POST') {
      const eventoData = await req.json();
      const { data, error } = await supabaseAdmin.from('events').insert([eventoData]).select();
      if (error) throw error;
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201
      });
    }

    return new Response("OK", { headers: corsHeaders });
  } catch (error: any) {
    console.error("Error fatal:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400
    });
  }
});