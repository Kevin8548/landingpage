import { supabase } from "../lib/supabase";

export type ManagedProject = {
  id: string;
  titulo: string;
  descripcion: string;
  autores: string;
  carrera: string | null;
  categoria: string | null;
  tecnologias: string[];
  enlace: string | null;
  imagen_url: string | null;
  created_at: string;
};

export type ProjectPayload = Omit<ManagedProject, "id" | "imagen_url" | "created_at"> & { imageDataUrl?: string; removeImage?: boolean };
const projectFields = "id, titulo, descripcion, autores, carrera, categoria, tecnologias, enlace, imagen_url, created_at";

export async function listManagedProjects(): Promise<ManagedProject[]> {
  const { data, error } = await supabase.from("projects").select(projectFields).order("created_at", { ascending: false });
  if (error) throw error;
  return data as ManagedProject[];
}

export const listPublicProjects = listManagedProjects;

async function invokeManageProjects<T>(body: Record<string, unknown>) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("No hay una sesión activa. Inicia sesión nuevamente.");
  const { data, error } = await supabase.functions.invoke<T>("manage-projects", { body, headers: { Authorization: `Bearer ${session.access_token}` } });
  if (error) {
    // Supabase devuelve los errores HTTP de una Edge Function en `context`.
    // Leemos su JSON para que el admin vea el mensaje de la función y no el
    // genérico “non-2xx status code”.
    const response = "context" in error ? error.context : undefined;
    if (response instanceof Response) {
      const payload = await response.clone().json().catch(() => null) as { error?: string } | null;
      if (payload?.error) throw new Error(payload.error);
    }
    throw error;
  }
  if (data && typeof data === "object" && "error" in data && typeof data.error === "string") {
    throw new Error(data.error);
  }
  if (!data) throw new Error("La función no devolvió información del proyecto.");
  return data;
}

export async function createManagedProject(project: ProjectPayload) {
  const response = await invokeManageProjects<{ project: ManagedProject }>({ operation: "create", project });
  if (!response.project) throw new Error("No se recibió el proyecto creado.");
  return response.project;
}

export async function updateManagedProject(id: string, project: ProjectPayload) {
  const response = await invokeManageProjects<{ project: ManagedProject }>({ operation: "update", id, project });
  if (!response.project) throw new Error("No se recibió el proyecto actualizado.");
  return response.project;
}
export async function deleteManagedProject(id: string) { await invokeManageProjects<{ id: string }>({ operation: "delete", id }); }
