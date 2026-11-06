import { supabase } from "../lib/supabase";

export async function createAdminAccount(email: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Tu sesión expiró. Inicia sesión otra vez.");
  const { data, error } = await supabase.functions.invoke("create-admin", {
    body: { email },
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  if (error || !data?.temporaryPassword) throw new Error(data?.error ?? error?.message ?? "No se pudo crear la cuenta.");
  return data as { email: string; temporaryPassword: string };
}
