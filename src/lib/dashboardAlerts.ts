
import Swal, { type SweetAlertOptions } from "sweetalert2";

/** Muestra alertas con los colores del panel, en claro u oscuro. */
export function showDashboardAlert(options: SweetAlertOptions) {
const isDark = document.documentElement.classList.contains("dark");

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
    ...options,
    });
}
