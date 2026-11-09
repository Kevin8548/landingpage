import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const invalidCredentials = () => Response.json({ error: "Matrícula o contraseña incorrectas." }, { status: 401, headers: corsHeaders });

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return Response.json({ error: "Método no permitido." }, { status: 405, headers: corsHeaders });
  try {
    const body = await request.json();
    const matricula = String(body?.matricula ?? "").trim().toUpperCase();
    const password = body?.password;
    if (!/^[A-Za-z0-9-]{4,24}$/.test(matricula) || typeof password !== "string" || password.length === 0 || password.length > 128) return invalidCredentials();

    const url = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
    const { data: profile, error: profileError } = await admin.from("profiles").select("id, role").ilike("matricula", matricula).maybeSingle();
    if (profileError) {
      console.error("Error buscando el perfil por matrícula:", profileError);
      return Response.json({ error: "No se pudo consultar el padrón. Inténtalo de nuevo en unos minutos." }, { status: 500, headers: corsHeaders });
    }
    if (profile?.role !== "student") return invalidCredentials();
    const { data: rosterEntry, error: rosterError } = await admin.from("padron_alumnos")
      .select("id")
      .ilike("matricula", matricula)
      .eq("registrado", true)
      .maybeSingle();
    if (rosterError) {
      console.error("Error verificando que la matrícula siga en el padrón:", rosterError);
      return Response.json({ error: "No se pudo verificar el padrón. Inténtalo de nuevo en unos minutos." }, { status: 500, headers: corsHeaders });
    }
    if (!rosterEntry) return invalidCredentials();
    const { data: userResult, error: userError } = await admin.auth.admin.getUserById(profile.id);
    const email = userResult.user?.email;
    if (userError || !email) {
      console.error("No se pudo recuperar la cuenta asociada al alumno:", userError);
      return Response.json({ error: "No se pudo recuperar la cuenta asociada a esta matrícula." }, { status: 500, headers: corsHeaders });
    }

    const client = createClient(url, anonKey, { auth: { persistSession: false } });
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.status === 400 || error.code === "invalid_credentials") return invalidCredentials();
      console.error("No se pudo verificar la contraseña del alumno:", error);
      return Response.json({ error: "El servicio de autenticación no está disponible ahora. Inténtalo de nuevo." }, { status: 503, headers: corsHeaders });
    }
    if (!data.session || data.user.id !== profile.id) return invalidCredentials();
    return Response.json({ session: data.session }, { headers: corsHeaders });
  } catch (error) {
    console.error("Error al autenticar alumno por matrícula:", error);
    return Response.json({ error: "No se pudo iniciar sesión. Inténtalo de nuevo en unos minutos." }, { status: 500, headers: corsHeaders });
  }
});
