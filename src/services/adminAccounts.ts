import { supabase } from "../lib/supabase";

async function edgeFunctionError(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "context" in error && error.context instanceof Response) {
    try {
      const body = await error.context.clone().json();
      if (typeof body?.error === "string") return body.error;
    } catch { /* Conserva el mensaje seguro alternativo. */ }
  }
  return error instanceof Error ? error.message : fallback;
}

export type AdminAccountInput = {
  email: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
};

export type AdminAccount = AdminAccountInput & {
  id: string;
  created_at: string;
};

async function invokeAdminAccounts(body: Record<string, string>) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Tu sesión expiró. Inicia sesión otra vez.");
  const { data, error } = await supabase.functions.invoke("manage-admins", {
    body,
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  if (error || data?.error) throw new Error(data?.error ?? await edgeFunctionError(error, "No se pudo completar la operación."));
  return data;
}

export async function createAdminAccount(input: AdminAccountInput) {
  const { data, error } = await supabase.functions.invoke("create-admin", {
    body: input,
    headers: await getAuthorizationHeader(),
  });
  if (error || data?.error || !data?.temporaryPassword) throw new Error(data?.error ?? await edgeFunctionError(error, "No se pudo crear la cuenta administrativa."));
  return data as { email: string; nombre: string; apellido_paterno: string; apellido_materno: string; temporaryPassword: string };
}

async function getAuthorizationHeader() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Tu sesión expiró. Inicia sesión otra vez.");
  return { Authorization: `Bearer ${session.access_token}` };
}

export async function listAdminAccounts() {
  const data = await invokeAdminAccounts({ action: "list" });
  return data as { accounts: AdminAccount[]; primaryAdminId: string; currentAdminId: string };
}

export async function updateCurrentAdminName(input: Omit<AdminAccountInput, "email">) {
  return await invokeAdminAccounts({ action: "update-self", ...input }) as {
    success: boolean;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
  };
}

export async function deleteAdminAccount(id: string) {
  await invokeAdminAccounts({ action: "delete", id });
}
