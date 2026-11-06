import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";
import { corsHeaders } from "../_shared/cors.ts";

const imageMimeTypes = ["image/jpeg", "image/png", "image/webp"];
const projectSchema = z.object({ titulo: z.string().trim().min(1).max(150), descripcion: z.string().trim().min(1).max(2000), autores: z.string().trim().min(1).max(300), carrera: z.string().trim().max(160).nullable().optional(), categoria: z.string().trim().max(80).nullable().optional(), tecnologias: z.array(z.string().trim().min(1).max(50)).max(12), enlace: z.string().url().max(500).nullable().optional(), imageDataUrl: z.string().max(4200000).optional(), removeImage: z.boolean().optional() });
const requestSchema = z.discriminatedUnion("operation", [z.object({ operation: z.literal("create"), project: projectSchema }), z.object({ operation: z.literal("update"), id: z.string().uuid(), project: projectSchema }), z.object({ operation: z.literal("delete"), id: z.string().uuid() })]);
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

function decodeImage(dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) throw new Error("La imagen debe ser JPG, PNG o WEBP.");
  const [, contentType, encoded] = match;
  const bytes = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));
  if (bytes.byteLength > 3 * 1024 * 1024) throw new Error("La imagen supera el límite de 3 MB.");
  return { bytes, contentType, extension: contentType === "image/jpeg" ? "jpg" : contentType.split("/")[1] };
}
async function uploadImage(client: ReturnType<typeof createClient>, dataUrl: string) {
  const { bytes, contentType, extension } = decodeImage(dataUrl);
  if (!imageMimeTypes.includes(contentType)) throw new Error("Tipo de imagen no permitido.");
  const path = `${crypto.randomUUID()}.${extension}`;
  const { error } = await client.storage.from("project-images").upload(path, bytes, { contentType, upsert: false });
  if (error) throw error;
  return client.storage.from("project-images").getPublicUrl(path).data.publicUrl;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método no permitido." }, 405);
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) throw new Error("No se recibió una sesión válida.");
    const url = Deno.env.get("SUPABASE_URL"), serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !serviceKey) throw new Error("La función no tiene configurados sus secretos de Supabase.");
    const client = createClient(url, serviceKey);
    const { data: { user }, error: userError } = await client.auth.getUser(authHeader.slice(7));
    if (userError || !user) throw new Error("Tu sesión no es válida.");
    const { data: profile, error: profileError } = await client.from("profiles").select("role").eq("id", user.id).single();
    if (profileError || profile?.role !== "admin") throw new Error("No tienes permisos de administrador.");
    const input = requestSchema.parse(await req.json());
    if (input.operation === "delete") { const { error } = await client.from("projects").delete().eq("id", input.id); if (error) throw error; return json({ id: input.id }); }
    const { project } = input;
    const values: Record<string, unknown> = { titulo: project.titulo, descripcion: project.descripcion, autores: project.autores, carrera: project.carrera ?? null, categoria: project.categoria ?? null, tecnologias: project.tecnologias, enlace: project.enlace ?? null };
    if (project.imageDataUrl) values.imagen_url = await uploadImage(client, project.imageDataUrl);
    if (project.removeImage) values.imagen_url = null;
    if (input.operation === "create") { const { data, error } = await client.from("projects").insert(values).select().single(); if (error) throw error; return json({ project: data }, 201); }
    const { data, error } = await client.from("projects").update(values).eq("id", input.id).select().single();
    if (error) throw error;
    return json({ project: data });
  } catch (error) {
    // Los errores que devuelven PostgREST y Storage suelen ser objetos planos,
    // no instancias de Error. Conservamos su message para que el frontend y los
    // logs indiquen qué parte de Supabase requiere atención.
    console.error("manage-projects failed:", error);
    const message = error instanceof z.ZodError
      ? error.issues.map((issue) => issue.message).join(" ")
      : error instanceof Error
        ? error.message
        : error && typeof error === "object" && "message" in error && typeof error.message === "string"
          ? error.message
          : "Ocurrió un error inesperado.";
    return json({ error: message }, 400);
  }
});
