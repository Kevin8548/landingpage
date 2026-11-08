const networkFailure = /failed to fetch|fetch failed|failed to send a request|networkerror|network error|load failed|err_name_not_resolved|name_not_resolved|connection (?:refused|reset|timed out)|timed? ?out|timeout|internet disconnected/i;
const technicalFailure = /typeerror|supabase|postgrest|postgres(?:ql)?|sqlstate|schema cache|row level security|\brls\b|permission denied|jwt|http\s*[45]\d\d|non-2xx|edge function|failed to invoke|relation .* does not exist|column .* does not exist|could not find the function|violates .* constraint|duplicate key|\b(pgrst|[0-9a-z]{5})\d{2,}\b/i;
const spanishMessage = /^(?:no |la |el |tu |esta |este |ese |selecciona |completa |ingresa |correo |contraseña|contraseñas|matrícula|fecha |horario|cupo|ya |se |escribe |debes |necesitas |intenta |revisa |la nueva |el servicio |esta cuenta|no encontramos|no pudimos|el taller|el evento)/i;

function extractMessage(error: unknown): string {
  if (typeof error === "string") return error.trim();
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message.trim();
  }
  return "";
}

/** Convierte errores técnicos de red o backend a texto claro para la interfaz. */
export function userFacingError(error: unknown, fallback: string): string {
  const message = extractMessage(error);
  if (!message) return fallback;
  if (networkFailure.test(message)) return "Revisa tu conexión a internet e inténtalo de nuevo.";
  if (technicalFailure.test(message)) return fallback;
  return spanishMessage.test(message) ? message : fallback;
}
