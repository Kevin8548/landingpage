// Bandera de sesión de admin, mientras no exista backend. Vive en
// sessionStorage (no localStorage) a propósito: se borra sola al cerrar la
// pestaña, así que no te quedas "logueado" para siempre en un equipo
// compartido. Cuando abres una pestaña nueva con window.open() desde la
// misma sesión, el navegador copia el sessionStorage automáticamente.
const ADMIN_SESSION_KEY = "utt_admin_session";

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
    }
  } catch {
    // sessionStorage no disponible — no persiste, pero la app sigue
    // funcionando (simplemente no va a quedar "logueado").
  }
}