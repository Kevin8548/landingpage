import { studentSupabase, supabase } from "../lib/supabase";

export type Workshop = {
  id: string;
  event_id: string;
  titulo: string;
  descripcion: string;
  ponente: string;
  lugar: string;
  inicia_en: string;
  termina_en: string;
  capacidad: number;
  ocupados: number;
  mi_inscripcion: string | null;
};

export type WorkshopInput = Omit<Workshop, "id" | "ocupados" | "mi_inscripcion"> & { id?: string };

async function manageWorkshop(body: Record<string, unknown>) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Tu sesión expiró. Inicia sesión nuevamente.");
  const { data, error } = await supabase.functions.invoke<{ error?: string }>("manage-workshops", {
    body,
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  if (error) {
    let message = data?.error;
    if (error.context instanceof Response) {
      try { message = (await error.context.clone().json()).error ?? message; } catch { /* conserva el mensaje del SDK */ }
    }
    const fallback = /failed to send a request|non-2xx|functionerror/i.test(error.message)
      ? "No se pudo guardar el taller. Comprueba tu conexión y vuelve a intentarlo."
      : error.message;
    throw new Error(message ?? fallback ?? "No se pudo completar la operación del taller.");
  }
  if (data?.error) throw new Error(data.error);
  return data;
}

export async function listEventWorkshops(eventId: string): Promise<Workshop[]> {
  const { data, error } = await studentSupabase.rpc("list_event_workshops", { p_event_id: eventId });
  if (error) throw new Error(explainWorkshopError(error.message));
  return (data ?? []) as Workshop[];
}

export async function listAdminEventWorkshops(eventId: string): Promise<Workshop[]> {
  const { data, error } = await supabase.rpc("list_event_workshops", { p_event_id: eventId });
  if (error) throw new Error(explainWorkshopError(error.message));
  return (data ?? []) as Workshop[];
}

export async function saveWorkshop(workshop: WorkshopInput) {
  const { id, ...values } = workshop;
  await manageWorkshop(id
    ? { operation: "update", id, workshop: values }
    : { operation: "create", workshop: values });
}

export async function removeWorkshop(workshopId: string) {
  await manageWorkshop({ operation: "delete", id: workshopId });
}

export async function enrollInWorkshop(workshopId: string) {
  const { error } = await studentSupabase.rpc("enroll_in_workshop", { p_workshop_id: workshopId });
  if (error) throw new Error(explainWorkshopError(error.message));
}

export async function cancelWorkshopRegistration(registrationId: string) {
  const { error } = await studentSupabase.rpc("cancel_workshop_registration", { p_registration_id: registrationId });
  if (error) throw new Error(explainWorkshopError(error.message));
}

export async function getMyEventRegistration(eventId: string) {
  const { data, error } = await studentSupabase
    .from("workshop_registrations")
    .select("id, workshop_id")
    .eq("event_id", eventId)
    .maybeSingle();
  if (error) throw new Error(explainWorkshopError(error.message));
  return data as { id: string; workshop_id: string } | null;
}

export async function listMyWorkshopRegistrations() {
  const { data, error } = await studentSupabase
    .from("workshop_registrations")
    .select("id, workshop_id, event_id, created_at, event_workshops(titulo,lugar,inicia_en,termina_en), events(titulo)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(explainWorkshopError(error.message));
  return (data ?? []).map((row) => ({ ...row, event_workshops: Array.isArray(row.event_workshops) ? row.event_workshops[0] ?? null : row.event_workshops, events: Array.isArray(row.events) ? row.events[0] ?? null : row.events }));
}

export async function listWorkshopAttendees(workshopId: string) {
  const { data, error } = await supabase
    .from("workshop_registrations")
    .select("id, created_at, profiles(matricula,nombre,apellido_paterno,apellido_materno,carrera)")
    .eq("workshop_id", workshopId)
    .order("created_at");
  if (error) throw new Error(explainWorkshopError(error.message));
  return (data ?? []).map((row) => ({ ...row, profiles: Array.isArray(row.profiles) ? row.profiles[0] ?? null : row.profiles }));
}

function explainWorkshopError(message: string) {
  if (/not found|schema cache|does not exist|could not find the function|relation .* does not exist/i.test(message)) {
    return "No está disponible el servicio de talleres en Supabase. Comprueba que la migración de talleres esté aplicada y vuelve a cargar la página.";
  }
  return message;
}
