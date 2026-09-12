import { supabase } from "../lib/supabase";
import type { EventItem, Category } from "../data/eventos";

export async function getEventsFromSupabase(): Promise<EventItem[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("fecha_inicio", { ascending: true });

  if (error) {
    console.error("Error cargando eventos:", error);
    return [];
  }

  // Transformamos los datos de Supabase al formato que espera tu Landing Page
  return data.map((row: any): EventItem => {
    let dateStr = "2026-01-01";
    let timeStr = "12:00";

    if (row.fecha_inicio) {
      try {
        const fecha = new Date(row.fecha_inicio);
        if (!isNaN(fecha.getTime())) {
          dateStr = fecha.toISOString().split("T")[0];
          timeStr = fecha.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
        }
      } catch (e) {
        console.error("Fecha inválida en evento:", row.id);
      }
    }

    return {
      id: row.id,
      title: row.titulo || "Sin título",
      description: row.descripcion || "Sin descripción",
      date: dateStr,
      time: timeStr,
      location: row.lugar,
      category: (row.tipo === "academico"
        ? "academico"
        : row.tipo === "deportivo"
          ? "comunidad"
          : "cultural") as Category,
      image: row.imagen_url || undefined,
    };
  });
}

// ---------- mutaciones vía la Edge Function manage-events ----------

function categoryToTipo(category: Category): "academico" | "cultural" | "deportivo" {
  if (category === "academico") return "academico";
  if (category === "comunidad") return "deportivo";
  return "cultural";
}

function buildFechaISO(date: string, time: string): string {
  return new Date(`${date}T${time}:00`).toISOString();
}

async function callManageEvents(payload: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("manage-events", { body: payload });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

export async function createEventInSupabase(item: Omit<EventItem, "id">): Promise<string> {
  const fechaInicio = buildFechaISO(item.date, item.time);
  const data = await callManageEvents({
    operation: "create",
    event: {
      titulo: item.title,
      descripcion: item.description,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaInicio,
      lugar: item.location,
      tipo: categoryToTipo(item.category),
    },
  });
  return data.event.id;
}

export async function updateEventInSupabase(
  id: string,
  item: Omit<EventItem, "id">,
  imageOptions?: { imageDataUrl?: string; removeImage?: boolean }
): Promise<{ imagen_url: string | null }> {
  const fechaInicio = buildFechaISO(item.date, item.time);
  const data = await callManageEvents({
    operation: "update",
    id,
    event: {
      titulo: item.title,
      descripcion: item.description,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaInicio,
      lugar: item.location,
      tipo: categoryToTipo(item.category),
      ...(imageOptions?.imageDataUrl ? { imageDataUrl: imageOptions.imageDataUrl } : {}),
      ...(imageOptions?.removeImage ? { removeImage: true } : {}),
    },
  });
  return { imagen_url: data.event?.imagen_url ?? null };
}

export async function deleteEventInSupabase(id: string): Promise<void> {
  await callManageEvents({ operation: "delete", id });
}