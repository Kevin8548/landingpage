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
      // Mapeamos el 'tipo' de la DB a la 'categoría' de tu frontend
      category: (row.tipo === "Hackathon" || row.tipo === "Taller" || row.tipo === "Conferencia" 
        ? "academico" 
        : "cultural") as Category,
      image: row.imagen_url || undefined,
    };
  });
}