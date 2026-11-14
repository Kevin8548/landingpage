import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return Response.json({ error: "Método no permitido." }, { status: 405, headers: corsHeaders });
  try {
    const body = await request.json();
    const matricula = String(body?.matricula ?? "").trim();
    const folio = String(body?.folio ?? "").replace(/\s+/g, "").trim().toUpperCase();
    const token = body?.token;
    const password = body?.password;
    if (!/^[A-Za-z0-9-]{4,24}$/.test(matricula) || !/^[A-Z0-9-]{1,64}$/.test(folio) || typeof token !== "string" || token.length !== 64 || typeof password !== "string" || password.length < 8) {
      return Response.json({ error: "Revisa la matrícula y el folio, y usa una contraseña de al menos 8 caracteres." }, { status: 400, headers: corsHeaders });
    }

    const url = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
    const email = `${matricula.toLowerCase()}@usuarios.utt.invalid`;
    const metadata = { matricula, folio, activation_token: token };
    let activatedUser: { id: string } | null = null;
    let recoveryError = "";
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email, password, email_confirm: true, user_metadata: metadata,
    });

    if (!createError && created.user) {
      activatedUser = created.user;
    } else {
      // A previous interrupted attempt can leave a student profile without a
      // roster link. Probe for it after any create failure (Auth error wording
      // varies by project), and reuse it only when identity matches exactly.
      const { data: profile, error: profileError } = await admin.from("profiles")
        .select("id,role,matricula").eq("role", "student").ilike("matricula", matricula).maybeSingle();
      if (profileError) console.error("No se pudo buscar el perfil previo de alumno:", profileError.message);
      if (!profileError && profile?.matricula?.trim().toUpperCase() === matricula) {
        const { data: existing, error: existingError } = await admin.auth.admin.getUserById(profile.id);
        if (existingError) {
          recoveryError = existingError.message;
          console.error("No se pudo consultar la cuenta previa de alumno:", existingError.message);
        }
        if (existing?.user?.email?.toLowerCase() === email) {
          const { data: updated, error: updateError } = await admin.auth.admin.updateUserById(profile.id, {
            password, user_metadata: metadata,
          });
          if (!updateError && updated.user) activatedUser = updated.user;
          else if (updateError) {
            recoveryError = updateError.message;
            console.error("No se pudo actualizar la cuenta previa de alumno:", updateError.message);
          }
        }
      }
    }

    if (!activatedUser) {
      console.error("No se pudo crear o recuperar la cuenta de alumno:", createError?.message ?? "usuario no disponible");
      const authMessage = recoveryError || createError?.message || "";
      const error = /weak|compromised|too common|password.*common/i.test(authMessage)
        ? "La contraseña es demasiado común. Elige otra contraseña de al menos 8 caracteres que combine letras y números."
        : /already registered|already exists|duplicate/i.test(authMessage)
          ? "Ya existe una cuenta previa para esta matrícula, pero no se pudo vincular automáticamente. Solicita a tu tutor que revise el registro."
          : "No se pudo preparar la cuenta para validarla. Inténtalo de nuevo y, si persiste, solicita a tu tutor que revise el registro.";
      return Response.json({ error }, { status: 400, headers: corsHeaders });
    }

    const { data: completed, error: completionError } = await admin.rpc("complete_student_activation", {
      p_token: token, p_matricula: matricula, p_folio: folio, p_user_id: activatedUser.id,
    });
    if (completionError || completed !== true) {
      console.error("No se pudo vincular la cuenta al padrón:", completionError?.message ?? "claim no válido");
      return Response.json({ error: "No se pudo confirmar la cuenta con el padrón. Revisa que el folio siga asignado y vuelve a intentarlo." }, { status: 400, headers: corsHeaders });
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
