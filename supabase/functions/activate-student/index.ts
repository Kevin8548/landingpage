import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return Response.json({ error: "Método no permitido." }, { status: 405, headers: corsHeaders });
  try {
    const body = await request.json();
    const matricula = String(body?.matricula ?? "").trim();
    const token = body?.token;
    const password = body?.password;
    if (!/^[A-Za-z0-9-]{4,24}$/.test(matricula) || typeof token !== "string" || token.length !== 64 || typeof password !== "string" || password.length < 8) {
      return Response.json({ error: "Revisa la matrícula y usa una contraseña de al menos 8 caracteres." }, { status: 400, headers: corsHeaders });
    }

    const url = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
    const email = `${matricula.toLowerCase()}@usuarios.utt.invalid`;
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { matricula, activation_token: token },
    });
    if (createError || !created.user) {
      return Response.json({ error: createError?.message ?? "No fue posible crear la cuenta." }, { status: 400, headers: corsHeaders });
    }

    const { data: profile } = await admin.from("profiles").select("role").eq("id", created.user.id).maybeSingle();
    if (profile?.role !== "student") {
      await admin.auth.admin.deleteUser(created.user.id);
      return Response.json({ error: "No se pudo vincular la cuenta al padrón. Solicita apoyo a tu tutor." }, { status: 400, headers: corsHeaders });
    }

    const publicClient = createClient(url, anonKey, { auth: { persistSession: false } });
    const { data: signedIn, error: signInError } = await publicClient.auth.signInWithPassword({ email, password });
    if (signInError || !signedIn.session) {
      return Response.json({ error: "La cuenta se creó. Inicia sesión con tu matrícula y contraseña." }, { status: 200, headers: corsHeaders });
    }
    return Response.json({ session: signedIn.session }, { headers: corsHeaders });
  } catch (error) {
    console.error("Error al activar cuenta de alumno:", error);
    return Response.json({ error: "No fue posible activar la cuenta. Inténtalo nuevamente." }, { status: 500, headers: corsHeaders });
  }
});
