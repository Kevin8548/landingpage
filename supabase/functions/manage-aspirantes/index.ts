import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";
import { corsHeaders } from "../_shared/cors.ts";

const imageMimeTypes = ["image/jpeg", "image/png", "image/webp"];

const heroSchema = z.object({
  title: z.string().trim().min(1).max(200),
  subtitle: z.string().trim().min(1).max(400),
});

const dateSchema = z.object({
  titulo: z.string().trim().min(1).max(150),
  descripcion: z.string().trim().max(1_000),
  fecha: z.string().trim().min(1).max(120),
  orden: z.number().int().optional(),
});

const institutionSchema = z.object({
  nombre: z.string().trim().min(1).max(150),
  descripcion: z.string().trim().max(1_000),
  orden: z.number().int().optional(),
  logoDataUrl: z.string().max(4_200_000).optional(),
  removeLogo: z.boolean().optional(),
});

// z.discriminatedUnion exige que el valor del discriminador sea único por
// variante — aquí "date" e "institution" se repiten entre create/update/delete,
// así que usamos un union normal (cada variante ya es distinguible por su
// combinación de campos).
const requestSchema = z.union([
  z.object({ resource: z.literal("hero"), operation: z.literal("update"), hero: heroSchema }),

  z.object({ resource: z.literal("date"), operation: z.literal("create"), date: dateSchema }),
  z.object({ resource: z.literal("date"), operation: z.literal("update"), id: z.string().uuid(), date: dateSchema }),
  z.object({ resource: z.literal("date"), operation: z.literal("delete"), id: z.string().uuid() }),

  z.object({ resource: z.literal("institution"), operation: z.literal("create"), institution: institutionSchema }),
  z.object({
    resource: z.literal("institution"),
    operation: z.literal("update"),
    id: z.string().uuid(),
    institution: institutionSchema,
  }),
  z.object({ resource: z.literal("institution"), operation: z.literal("delete"), id: z.string().uuid() }),
]);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function decodeImage(dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) throw new Error("El logo debe ser JPG, PNG o WEBP.");

  const [, contentType, encoded] = match;
  const binary = atob(encoded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  if (bytes.byteLength > 3 * 1024 * 1024) throw new Error("El logo supera el límite de 3 MB.");

  return { bytes, contentType, extension: contentType === "image/jpeg" ? "jpg" : contentType.split("/")[1] };
}

async function uploadLogo(supabaseAdmin: ReturnType<typeof createClient>, dataUrl: string) {
  const { bytes, contentType, extension } = decodeImage(dataUrl);
  if (!imageMimeTypes.includes(contentType)) throw new Error("Tipo de imagen no permitido.");

  const path = `${crypto.randomUUID()}.${extension}`;
  const { error } = await supabaseAdmin.storage
    .from("institution-logos")
    .upload(path, bytes, { contentType, upsert: false });
  if (error) throw error;

  return supabaseAdmin.storage.from("institution-logos").getPublicUrl(path).data.publicUrl;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método no permitido." }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) throw new Error("No se recibió una sesión válida.");

    const url = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !serviceKey) throw new Error("La función no tiene configurados sus secretos de Supabase.");

    const supabaseAdmin = createClient(url, serviceKey);
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(authHeader.slice(7));
    if (userError || !user) throw new Error("Tu sesión no es válida.");

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profileError || profile?.role !== "admin") throw new Error("No tienes permisos de administrador.");

    const input = requestSchema.parse(await req.json());

    // ---------- hero ----------
    if (input.resource === "hero") {
      const { data, error } = await supabaseAdmin
        .from("site_settings")
        .update({
          hero_title: input.hero.title,
          hero_subtitle: input.hero.subtitle,
          updated_at: new Date().toISOString(),
        })
        .eq("id", "aspirantes")
        .select()
        .single();
      if (error) throw error;
      return json({ settings: data });
    }

    // ---------- date ----------
    if (input.resource === "date") {
      if (input.operation === "delete") {
        const { error } = await supabaseAdmin.from("key_dates").delete().eq("id", input.id);
        if (error) throw error;
        return json({ id: input.id });
      }

      const { date } = input;
      const payload: Record<string, unknown> = {
        titulo: date.titulo,
        descripcion: date.descripcion,
        fecha: date.fecha,
      };
      if (date.orden !== undefined) payload.orden = date.orden;

      if (input.operation === "create") {
        if (payload.orden === undefined) {
          const { count } = await supabaseAdmin
            .from("key_dates")
            .select("id", { count: "exact", head: true });
          payload.orden = count ?? 0;
        }
        const { data, error } = await supabaseAdmin.from("key_dates").insert(payload).select().single();
        if (error) throw error;
        return json({ date: data }, 201);
      }

      const { data, error } = await supabaseAdmin
        .from("key_dates")
        .update(payload)
        .eq("id", input.id)
        .select()
        .single();
      if (error) throw error;
      return json({ date: data });
    }

    // ---------- institution ----------
    if (input.resource === "institution") {
      if (input.operation === "delete") {
        const { error } = await supabaseAdmin.from("institutions").delete().eq("id", input.id);
        if (error) throw error;
        return json({ id: input.id });
      }

      const { institution } = input;
      const payload: Record<string, unknown> = {
        nombre: institution.nombre,
        descripcion: institution.descripcion,
      };
      if (institution.orden !== undefined) payload.orden = institution.orden;
      if (institution.logoDataUrl) payload.logo_url = await uploadLogo(supabaseAdmin, institution.logoDataUrl);
      if (institution.removeLogo) payload.logo_url = null;

      if (input.operation === "create") {
        if (payload.orden === undefined) {
          const { count } = await supabaseAdmin
            .from("institutions")
            .select("id", { count: "exact", head: true });
          payload.orden = count ?? 0;
        }
        const { data, error } = await supabaseAdmin.from("institutions").insert(payload).select().single();
        if (error) throw error;
        return json({ institution: data }, 201);
      }

      const { data, error } = await supabaseAdmin
        .from("institutions")
        .update(payload)
        .eq("id", input.id)
        .select()
        .single();
      if (error) throw error;
      return json({ institution: data });
    }

    return json({ error: "Recurso no reconocido." }, 400);
  } catch (error) {
    const message = error instanceof z.ZodError
      ? error.issues.map((issue) => issue.message).join(" ")
      : error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: unknown }).message)
          : "Ocurrió un error inesperado.";
    console.error(message, error);
    return json({ error: message }, 400);
  }
});