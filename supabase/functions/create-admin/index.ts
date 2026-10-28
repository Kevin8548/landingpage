import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const temporaryPassword = () => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@$%";
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return Response.json({ error: "Método no permitido." }, { status: 405, headers: corsHeaders });
  try {
    const authorization = request.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) return Response.json({ error: "Inicia sesión con una cuenta administradora." }, { status: 401, headers: corsHeaders });
    const url = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const callerClient = createClient(url, anonKey, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false } });
    const { data: { user }, error: authError } = await callerClient.auth.getUser();
    if (authError || !user) return Response.json({ error: "La sesión administrativa ya no es válida." }, { status: 401, headers: corsHeaders });
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
    const { data: callerProfile } = await admin.from("profiles").select("role").eq("id", user.id).maybeSingle();
    if (callerProfile?.role !== "admin") return Response.json({ error: "Solo un administrador autorizado puede habilitar otra cuenta." }, { status: 403, headers: corsHeaders });

    const body = await request.json();
    const email = String(body?.email ?? "").trim().toLowerCase();
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ error: "Escribe un correo válido para la cuenta administrativa." }, { status: 400, headers: corsHeaders });
    const password = temporaryPassword();
    const { data: created, error: createError } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { must_change_password: true } });
    if (createError || !created.user) return Response.json({ error: createError?.message ?? "No se pudo crear la cuenta." }, { status: 409, headers: corsHeaders });
    const { error: profileError } = await admin.from("profiles").update({ role: "admin", email }).eq("id", created.user.id);
    if (profileError) {
      await admin.auth.admin.deleteUser(created.user.id);
      console.error("No se pudo asignar rol administrativo:", profileError);
      return Response.json({ error: "No se pudo completar el alta administrativa." }, { status: 500, headers: corsHeaders });
    }
    return Response.json({ email, temporaryPassword: password }, { headers: corsHeaders });
  } catch (error) {
    console.error("Error creando cuenta administrativa:", error);
    return Response.json({ error: "No se pudo crear la cuenta. Inténtalo de nuevo." }, { status: 500, headers: corsHeaders });
  }
});
