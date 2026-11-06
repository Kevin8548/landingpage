import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";
import { corsHeaders } from "../_shared/cors.ts";

const eventTypes = ["academico", "cultural", "deportivo"] as const;
const imageMimeTypes = ["image/jpeg", "image/png", "image/webp"];

const eventSchema = z.object({
  titulo: z.string().trim().min(1).max(150),
  descripcion: z.string().trim().max(2_000),
  fecha_inicio: z.string().datetime({ offset: true }),
  fecha_fin: z.string().datetime({ offset: true }),
  lugar: z.string().trim().min(1).max(200),
  audiencia: z.string().trim().max(200).nullable().optional(),
  link_registro: z.string().url().max(500).nullable().optional(),
  tipo: z.enum(eventTypes),
  modalidad: z.string().trim().max(60).nullable().optional(),
  imageDataUrl: z.string().max(4_200_000).optional(),
  removeImage: z.boolean().optional(),
});

const requestSchema = z.discriminatedUnion("operation", [
  z.object({ operation: z.literal("create"), event: eventSchema }),
  z.object({ operation: z.literal("update"), id: z.string().uuid(), event: eventSchema }),
  z.object({ operation: z.literal("delete"), id: z.string().uuid() }),
]);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function decodeImage(dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) throw new Error("La imagen debe ser JPG, PNG o WEBP.");

  const [, contentType, encoded] = match;
  const binary = atob(encoded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  if (bytes.byteLength > 3 * 1024 * 1024) throw new Error("La imagen supera el límite de 3 MB.");

  return { bytes, contentType, extension: contentType === "image/jpeg" ? "jpg" : contentType.split("/")[1] };
}

async function uploadImage(supabaseAdmin: ReturnType<typeof createClient>, dataUrl: string) {
  const { bytes, contentType, extension } = decodeImage(dataUrl);
  if (!imageMimeTypes.includes(contentType)) throw new Error("Tipo de imagen no permitido.");

  const path = `${crypto.randomUUID()}.${extension}`;
  const { error } = await supabaseAdmin.storage
    .from("event-images")
    .upload(path, bytes, { contentType, upsert: false });
  if (error) throw error;

  return supabaseAdmin.storage.from("event-images").getPublicUrl(path).data.publicUrl;
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
    if (input.operation === "delete") {
      const { error } = await supabaseAdmin.from("events").delete().eq("id", input.id);
      if (error) throw error;
      return json({ id: input.id });
    }

    const { event } = input;
    if (new Date(event.fecha_fin) < new Date(event.fecha_inicio)) throw new Error("La fecha final no puede ser anterior a la fecha inicial.");

    const eventData: Record<string, unknown> = {
      titulo: event.titulo,
      descripcion: event.descripcion,
      fecha_inicio: event.fecha_inicio,
      fecha_fin: event.fecha_fin,
      lugar: event.lugar,
      audiencia: event.audiencia ?? null,
      link_registro: event.link_registro ?? null,
      tipo: event.tipo,
      modalidad: event.modalidad ?? "Presencial",
    };
    if (event.imageDataUrl) eventData.imagen_url = await uploadImage(supabaseAdmin, event.imageDataUrl);
    if (event.removeImage) eventData.imagen_url = null;

    if (input.operation === "create") {
      const { data, error } = await supabaseAdmin.from("events").insert(eventData).select().single();
      if (error) throw error;
      return json({ event: data }, 201);
    }

    const { data, error } = await supabaseAdmin.from("events").update(eventData).eq("id", input.id).select().single();
    if (error) throw error;
    return json({ event: data });
  } catch (error) {
    const message = error instanceof z.ZodError
      ? error.issues.map((issue) => issue.message).join(" ")
      : error instanceof Error ? error.message : "Ocurrió un error inesperado.";
    console.error(message);
    return json({ error: message }, 400);
  }
});
