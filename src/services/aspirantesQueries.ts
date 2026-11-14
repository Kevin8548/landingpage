import { supabase } from "../lib/supabase";
import type { Institution, KeyDate } from "../data/aspirantes";

export interface HeroContent {
  title: string;
  subtitle: string;
}

async function callManageAspirantes(payload: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("manage-aspirantes", { body: payload });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

// ---------- lectura ----------

export async function getHeroFromSupabase(): Promise<HeroContent | null> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("hero_title, hero_subtitle")
    .eq("id", "aspirantes")
    .single();

  if (error) {
    console.error("Error cargando el hero de aspirantes:", error);
    return null;
  }

  return { title: data.hero_title, subtitle: data.hero_subtitle };
}

export async function getDatesFromSupabase(): Promise<KeyDate[]> {
  const { data, error } = await supabase
    .from("key_dates")
    .select("*")
    .order("orden", { ascending: true });

  if (error) {
    console.error("Error cargando fechas clave:", error);
    return [];
  }

  return data.map((row: { id: string; titulo: string; descripcion: string; fecha: string }): KeyDate => ({
    id: row.id,
    title: row.titulo,
    description: row.descripcion,
    date: row.fecha,
  }));
}

export async function getInstitutionsFromSupabase(): Promise<Institution[]> {
  const { data, error } = await supabase
    .from("institutions")
    .select("*")
    .order("orden", { ascending: true });

  if (error) {
    console.error("Error cargando instituciones:", error);
    return [];
  }

  return data.map((row: { id: string; nombre: string; descripcion: string; logo_url: string | null }): Institution => ({
    id: row.id,
    name: row.nombre,
    description: row.descripcion,
    logo: row.logo_url || undefined,
  }));
}

// ---------- mutaciones: hero ----------

export async function updateHeroInSupabase(hero: HeroContent): Promise<void> {
  await callManageAspirantes({ resource: "hero", operation: "update", hero });
}

// ---------- mutaciones: fechas clave ----------

export async function createDateInSupabase(date: Omit<KeyDate, "id">): Promise<string> {
  const data = await callManageAspirantes({
    resource: "date",
    operation: "create",
    date: { titulo: date.title, descripcion: date.description, fecha: date.date },
  });
  return data.date.id;
}

export async function updateDateInSupabase(id: string, date: Omit<KeyDate, "id">): Promise<void> {
  await callManageAspirantes({
    resource: "date",
    operation: "update",
    id,
    date: { titulo: date.title, descripcion: date.description, fecha: date.date },
  });
}

export async function deleteDateInSupabase(id: string): Promise<void> {
  await callManageAspirantes({ resource: "date", operation: "delete", id });
}

// ---------- mutaciones: instituciones ----------

export async function createInstitutionInSupabase(institution: Omit<Institution, "id">): Promise<string> {
  const data = await callManageAspirantes({
    resource: "institution",
    operation: "create",
    institution: { nombre: institution.name, descripcion: institution.description },
  });
  return data.institution.id;
}

export async function updateInstitutionInSupabase(
  id: string,
  institution: Omit<Institution, "id">,
  logoOptions?: { logoDataUrl?: string; removeLogo?: boolean }
): Promise<{ logo_url: string | null }> {
  const data = await callManageAspirantes({
    resource: "institution",
    operation: "update",
    id,
    institution: {
      nombre: institution.name,
      descripcion: institution.description,
      ...(logoOptions?.logoDataUrl ? { logoDataUrl: logoOptions.logoDataUrl } : {}),
      ...(logoOptions?.removeLogo ? { removeLogo: true } : {}),
    },
  });
  return { logo_url: data.institution?.logo_url ?? null };
}

export async function deleteInstitutionInSupabase(id: string): Promise<void> {
  await callManageAspirantes({ resource: "institution", operation: "delete", id });
}

// Prueba temporal HU-10 (Versión con error de ESLint)
export function testValidacionAdmision() {
  const variableSinUsar = "esto debe fallar en eslint";
}