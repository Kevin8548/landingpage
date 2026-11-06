import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";
import { corsHeaders } from "../_shared/cors.ts";

const workshopFields = z.object({
  event_id: z.string().uuid(),
  titulo: z.string().trim().min(1, "Escribe el nombre del taller.").max(120),
  descripcion: z.string().trim().max(1200).default(""),
  ponente: z.string().trim().max(160).default(""),
  lugar: z.string().trim().min(1, "Escribe el lugar del taller.").max(200),
  inicia_en: z.string().datetime({ offset: true }),
  termina_en: z.string().datetime({ offset: true }),
  capacidad: z.number().int().min(1).max(10000),
});
const schema = z.discriminatedUnion("operation", [
  z.object({ operation: z.literal("create"), workshop: workshopFields }),
  z.object({ operation: z.literal("update"), id: z.string().uuid(), workshop: workshopFields }),
  z.object({ operation: z.literal("delete"), id: z.string().uuid() }),
]);
const response = (body: unknown, status = 200) => Response.json(body, { status, headers: corsHeaders });

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return response({ error: "Método no permitido." }, 405);
  try {
    const authorization = request.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) return response({ error: "Inicia sesión como administrador." }, 401);
    const url = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const userClient = createClient(url, anonKey, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false } });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) return response({ error: "La sesión expiró. Vuelve a iniciar sesión." }, 401);
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
    const { data: profile, error: roleError } = await admin.from("profiles").select("role").eq("id", user.id).maybeSingle();
    if (roleError || profile?.role !== "admin") return response({ error: "No tienes permisos para gestionar talleres." }, 403);

    const input = schema.parse(await request.json());
    if (input.operation === "delete") {
      const { error } = await admin.from("event_workshops").delete().eq("id", input.id);
      if (error) throw error;
      return response({ id: input.id });
    }

    const { workshop } = input;
    if (new Date(workshop.termina_en) <= new Date(workshop.inicia_en)) return response({ error: "La hora de término debe ser posterior al inicio." }, 400);
    const { data: parentEvent, error: eventError } = await admin.from("events").select("id").eq("id", workshop.event_id).maybeSingle();
    if (eventError || !parentEvent) return response({ error: "No encontramos el evento al que pertenece este taller. Recarga el dashboard e inténtalo de nuevo." }, 404);

    if (input.operation === "update") {
      const { count, error: countError } = await admin.from("workshop_registrations").select("id", { count: "exact", head: true }).eq("workshop_id", input.id);
      if (countError) throw countError;
      if (workshop.capacidad < (count ?? 0)) return response({ error: `La capacidad no puede ser menor que los ${count} alumnos ya inscritos.` }, 409);
      const { data, error } = await admin.from("event_workshops").update(workshop).eq("id", input.id).select("id").maybeSingle();
      if (error) throw error;
      if (!data) return response({ error: "El taller ya no existe. Actualiza la lista e inténtalo otra vez." }, 404);
      return response({ id: data.id });
    }

    const { data, error } = await admin.from("event_workshops").insert(workshop).select("id").single();
    if (error) throw error;
    return response({ id: data.id }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) return response({ error: error.issues.map((issue) => issue.message).join(" ") }, 400);
    const detail = error && typeof error === "object" && "message" in error && typeof error.message === "string"
      ? error.message
      : "No fue posible guardar el taller.";
    const hint = error && typeof error === "object" && "hint" in error && typeof error.hint === "string" ? error.hint : "";
    console.error("Error gestionando taller:", error);
    return response({ error: [detail, hint].filter(Boolean).join(" ") }, 400);
  }
});
