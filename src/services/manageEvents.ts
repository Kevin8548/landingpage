import { supabase } from "../lib/supabase";

export type EventType = "academico" | "cultural" | "deportivo";

export type ManagedEvent = {
  id: string;
  titulo: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  lugar: string;
  audiencia: string | null;
  link_registro: string | null;
  imagen_url: string | null;
  tipo: EventType;
  modalidad: string | null;
};

export type EventPayload = Omit<ManagedEvent, "id" | "imagen_url"> & {
  imageDataUrl?: string;
  removeImage?: boolean;
};

export async function listManagedEvents(): Promise<ManagedEvent[]> {
  const { data, error } = await supabase
    .from("events")
    .select("id, titulo, descripcion, fecha_inicio, fecha_fin, lugar, audiencia, link_registro, imagen_url, tipo, modalidad")
    .order("fecha_inicio", { ascending: true });
  if (error) throw error;
  return data as ManagedEvent[];
}

async function invokeManageEvents<T>(body: Record<string, unknown>) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("No hay una sesión activa. Inicia sesión nuevamente.");

  const { data, error } = await supabase.functions.invoke<T>("manage-events", {
    body,
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  if (error) throw error;
  if (!data) throw new Error("La función no devolvió información del evento.");
  return data;
}

export async function createManagedEvent(event: EventPayload) {
  const response = await invokeManageEvents<{ event: ManagedEvent }>({ operation: "create", event });
  if (!response.event) throw new Error("No se recibió el evento creado.");
  return response.event;
}

export async function updateManagedEvent(id: string, event: EventPayload) {
  const response = await invokeManageEvents<{ event: ManagedEvent }>({ operation: "update", id, event });
  if (!response.event) throw new Error("No se recibió el evento actualizado.");
  return response.event;
}

export async function deleteManagedEvent(id: string) {
  await invokeManageEvents<{ id: string }>({ operation: "delete", id });
}
