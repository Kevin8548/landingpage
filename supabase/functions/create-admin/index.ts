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
    const { data: callerProfile, error: callerProfileError } = await admin.from("profiles").select("role,is_primary_admin").eq("id", user.id).maybeSingle();
    if (callerProfileError || callerProfile?.role !== "admin") return Response.json({ error: "No tienes permisos para crear cuentas administrativas." }, { status: 403, headers: corsHeaders });
    const { data: primaryAdmin, error: primaryError } = await admin.from("profiles").select("id,nombre").eq("role", "admin").eq("is_primary_admin", true).maybeSingle();
    if (primaryError) throw primaryError;
    if (callerProfile.is_primary_admin !== true || primaryAdmin?.id !== user.id) {
      const principalName = primaryAdmin?.nombre?.trim().split(/\s+/)[0];
      return Response.json({ error: principalName
        ? `Esta cuenta no es la principal. Inicia sesión con la cuenta de ${principalName} para crear administradores.`
        : "Esta cuenta no es la principal. Inicia sesión con la cuenta del administrador principal para crear administradores." }, { status: 403, headers: corsHeaders });
    }

    const body = await request.json();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const nombre = String(body?.nombre ?? "").trim().replace(/\s+/g, " ");
    const apellidoPaterno = String(body?.apellido_paterno ?? "").trim().replace(/\s+/g, " ");
    const apellidoMaterno = String(body?.apellido_materno ?? "").trim().replace(/\s+/g, " ");
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ error: "Escribe un correo válido para la cuenta administrativa." }, { status: 400, headers: corsHeaders });
    if (!nombre || !apellidoPaterno || !apellidoMaterno || [nombre, apellidoPaterno, apellidoMaterno].some((part) => part.length > 100)) return Response.json({ error: "Escribe el nombre y los dos apellidos del administrador." }, { status: 400, headers: corsHeaders });
    const password = temporaryPassword();
    const fullName = `${nombre} ${apellidoPaterno} ${apellidoMaterno}`;
    const { data: created, error: createError } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { given_name: nombre, first_name: nombre, full_name: fullName, nombre, apellido_paterno: apellidoPaterno, apellido_materno: apellidoMaterno, must_change_password: true } });
    if (createError || !created.user) {
      const detail = `${createError?.code ?? ""} ${createError?.message ?? ""}`;
      console.error("No se pudo crear la cuenta administrativa:", createError);
      if (/email_exists|already registered|already been registered|already exists|duplicate/i.test(detail)) {
        return Response.json({ error: "Ese correo ya está asociado a una cuenta de la plataforma. Revisa si ya tiene acceso o utiliza otro correo." }, { status: 409, headers: corsHeaders });
      }
      return Response.json({ error: "No se pudo crear la cuenta. Verifica el correo e inténtalo de nuevo." }, { status: 400, headers: corsHeaders });
    }
    const { error: profileError } = await admin.from("profiles").update({ role: "admin", email, nombre, apellido_paterno: apellidoPaterno, apellido_materno: apellidoMaterno }).eq("id", created.user.id);
    if (profileError) {
      await admin.auth.admin.deleteUser(created.user.id);
      console.error("No se pudo asignar rol administrativo:", profileError);
      return Response.json({ error: "No se pudieron guardar los datos de la cuenta administrativa." }, { status: 500, headers: corsHeaders });
    }
    return Response.json({ email, nombre, apellido_paterno: apellidoPaterno, apellido_materno: apellidoMaterno, temporaryPassword: password }, { headers: corsHeaders });
  } catch (error) {
    console.error("Error creando cuenta administrativa:", error);
    return Response.json({ error: "No se pudo completar el registro. Inténtalo de nuevo." }, { status: 500, headers: corsHeaders });
  }
});
