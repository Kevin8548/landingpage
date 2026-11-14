// Bandera de sesión de admin, mientras no exista backend. Vive en
// sessionStorage (no localStorage) a propósito: se borra sola al cerrar la
// pestaña, así que no te quedas "logueado" para siempre en un equipo
// compartido. Cuando abres una pestaña nueva con window.open() desde la
// misma sesión, el navegador copia el sessionStorage automáticamente.
const ADMIN_SESSION_KEY = "utt_admin_session";
const ADMIN_GREETING_NAME_KEY = "utt_admin_greeting_name";
const ADMIN_FULL_NAME_KEY = "utt_admin_full_name";

export function getAdminFullName(): string | null {
  try {
    const name = sessionStorage.getItem(ADMIN_FULL_NAME_KEY)?.trim();
    return name || null;
  } catch {
    return null;
  }
}

export function setAdminFullName(value: unknown) {
  try {
    const fullName = typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
    if (fullName) {
      sessionStorage.setItem(ADMIN_FULL_NAME_KEY, fullName);
      const firstName = fullName.split(" ")[0];
      sessionStorage.setItem(ADMIN_GREETING_NAME_KEY, firstName);
    } else {
      sessionStorage.removeItem(ADMIN_FULL_NAME_KEY);
      sessionStorage.removeItem(ADMIN_GREETING_NAME_KEY);
    }
  } catch {
    // El nombre se resolverá desde el perfil si sessionStorage no está disponible.
  }
}
const ADMIN_PRIMARY_STATUS_KEY = "utt_admin_primary_status";

export function getAdminPrimaryStatus(): boolean | null {
  try {
    const status = sessionStorage.getItem(ADMIN_PRIMARY_STATUS_KEY);
    return status === null ? null : status === "true";
  } catch {
    return null;
  }
}

export function setAdminPrimaryStatus(value: boolean | null) {
  try {
    if (value === null) sessionStorage.removeItem(ADMIN_PRIMARY_STATUS_KEY);
    else sessionStorage.setItem(ADMIN_PRIMARY_STATUS_KEY, String(value));
  } catch {
    // La navegación seguirá protegida por la comprobación del servidor.
  }
}

export function getAdminGreetingName(): string | null {
  try {
    const name = sessionStorage.getItem(ADMIN_GREETING_NAME_KEY)?.trim();
    return name || null;
  } catch {
    return null;
  }
}

export function setAdminGreetingName(value: unknown) {
  try {
    const firstName = typeof value === "string" ? value.trim().split(/\s+/)[0] : "";
    if (firstName) sessionStorage.setItem(ADMIN_GREETING_NAME_KEY, firstName);
    else sessionStorage.removeItem(ADMIN_GREETING_NAME_KEY);
  } catch {
    // El saludo se resolverá desde el perfil si sessionStorage no está disponible.
  }
}

export function isAdminAuthenticated(): boolean {
  try {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
  } catch {
    return false;
  }
}

export function setAdminAuthenticated(value: boolean) {
  try {
    if (value) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
    } else {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      sessionStorage.removeItem(ADMIN_GREETING_NAME_KEY);
      sessionStorage.removeItem(ADMIN_FULL_NAME_KEY);
      sessionStorage.removeItem(ADMIN_PRIMARY_STATUS_KEY);
    }
  } catch {
    // sessionStorage no disponible — no persiste, pero la app sigue
    // funcionando (simplemente no va a quedar "logueado").
  }
}
