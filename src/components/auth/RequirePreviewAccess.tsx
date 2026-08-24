import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAdminAuthenticated } from "../../lib/adminAuth";

interface PreviewNavigationState {
  fromDashboard?: boolean;
}

// Guard más estricto que RequireAdmin: se usa en rutas de "previsualización"
// (como /eventos) que NO deben quedarse abiertas solo porque exista una
// sesión de admin en sessionStorage. Aquí exigimos ADEMÁS que la navegación
// haya ocurrido desde dentro de la app (un click en el dashboard), nunca
// por URL escrita a mano ni por un refresh de la página — ambos casos
// pierden el `location.state` de React Router, así que caen aquí y se
// mandan a /acceso.
export default function RequirePreviewAccess({ children }: { children: ReactNode }) {
  const location = useLocation();
  const state = location.state as PreviewNavigationState | null;

  const cameFromDashboard = state?.fromDashboard === true;

  if (!isAdminAuthenticated() || !cameFromDashboard) {
    return <Navigate to="/acceso" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}