import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const response = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: corsHeaders });

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return response({ error: "Método no permitido." }, 405);

  try {
    const authorization = request.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) return response({ error: "Inicia sesión con una cuenta administradora." }, 401);

    const url = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const callerClient = createClient(url, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false },
    });
    const { data: { user }, error: authError } = await callerClient.auth.getUser();
    if (authError || !user) return response({ error: "La sesión administrativa ya no es válida." }, 401);

    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
    const { data: callerProfile, error: callerProfileError } = await admin
      .from("profiles").select("role,is_primary_admin").eq("id", user.id).maybeSingle();
    if (callerProfileError || callerProfile?.role !== "admin") return response({ error: "No tienes permisos para gestionar cuentas administrativas." }, 403);

    const { data: primaryAdmin, error: primaryError } = await admin
      .from("profiles").select("id,nombre").eq("role", "admin").eq("is_primary_admin", true).maybeSingle();
    if (primaryError) throw primaryError;
    if (callerProfile.is_primary_admin !== true || primaryAdmin?.id !== user.id) {
      const principalName = primaryAdmin?.nombre?.trim().split(/\s+/)[0];
      return response({ error: principalName
        ? `Esta cuenta no es la principal. Inicia sesión con la cuenta de ${principalName} para gestionar administradores.`
        : "Esta cuenta no es la principal. Inicia sesión con la cuenta del administrador principal para gestionar administradores." }, 403);
    }

    const body = await request.json();
    if (body?.action === "list") {
      const { data: accounts, error } = await admin
        .from("profiles")
        .select("id,email,nombre,apellido_paterno,apellido_materno,created_at")
        .eq("role", "admin")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return response({ accounts: accounts ?? [], primaryAdminId: primaryAdmin.id, currentAdminId: user.id });
    }

    if (body?.action === "update-self") {
      const nombre = String(body?.nombre ?? "").trim().replace(/\s+/g, " ");
      const apellidoPaterno = String(body?.apellido_paterno ?? "").trim().replace(/\s+/g, " ");
      const apellidoMaterno = String(body?.apellido_materno ?? "").trim().replace(/\s+/g, " ");
      if (!nombre || !apellidoPaterno || !apellidoMaterno || [nombre, apellidoPaterno, apellidoMaterno].some((part) => part.length > 100)) {
        return response({ error: "Escribe tu nombre y tus dos apellidos." }, 400);
      }
      const fullName = `${nombre} ${apellidoPaterno} ${apellidoMaterno}`;
      const { error: profileError } = await admin.from("profiles").update({
        nombre,
        apellido_paterno: apellidoPaterno,
        apellido_materno: apellidoMaterno,
      }).eq("id", user.id);
      if (profileError) throw profileError;
      const { error: userUpdateError } = await admin.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...(user.user_metadata ?? {}),
          given_name: nombre,
          first_name: nombre,
          full_name: fullName,
          nombre,
          apellido_paterno: apellidoPaterno,
          apellido_materno: apellidoMaterno,
        },
      });
      if (userUpdateError) throw userUpdateError;
      return response({ success: true, nombre, apellido_paterno: apellidoPaterno, apellido_materno: apellidoMaterno });
    }

    if (body?.action === "delete") {
      const id = String(body?.id ?? "");
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
        return response({ error: "Selecciona una cuenta administrativa válida." }, 400);
      }
      if (id === user.id || id === primaryAdmin.id) return response({ error: "No se puede eliminar la cuenta del administrador principal." }, 400);

      const { data: target, error: targetError } = await admin
        .from("profiles").select("id,role").eq("id", id).maybeSingle();
      if (targetError) throw targetError;
      if (!target || target.role !== "admin") return response({ error: "La cuenta administrativa ya no existe." }, 404);

      const { error: deleteError } = await admin.auth.admin.deleteUser(id);
      if (deleteError) throw deleteError;
      return response({ success: true, deletedId: id });
    }

    return response({ error: "La operación solicitada no es válida." }, 400);
  } catch (error) {
    console.error("No se pudo gestionar las cuentas administrativas:", error);
    return response({ error: "No se pudo completar la gestión de cuentas. Revisa tu conexión e inténtalo de nuevo." }, 500);
  }
});
