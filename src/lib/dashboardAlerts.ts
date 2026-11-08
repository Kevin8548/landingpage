
import Swal, { type SweetAlertOptions } from "sweetalert2";
import { userFacingError } from "./userFacingErrors";

/** Muestra alertas con los colores del panel, en claro u oscuro. */
export function showDashboardAlert(options: SweetAlertOptions) {
const isDark = document.documentElement.classList.contains("dark");
const safeOptions = typeof options.text === "string"
    ? { ...options, text: userFacingError(options.text, "No se pudo completar la operación. Inténtalo de nuevo.") }
    : options;

return Swal.fire({
    confirmButtonText: "Aceptar",
    buttonsStyling: false,
    background: isDark ? "#15181d" : "#ffffff",
    color: isDark ? "#f1f3f5" : "#17231d",
    customClass: {
        popup: "dashboard-swal",
        confirmButton: "dashboard-swal__confirm",
        cancelButton: "dashboard-swal__cancel",
    },
    ...safeOptions,
    });
}
