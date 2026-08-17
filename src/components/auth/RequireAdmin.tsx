import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAdminAuthenticated } from "../../lib/adminAuth";

export default function RequireAdmin({ children }: { children: ReactNode }) {
  const location = useLocation();

  if (!isAdminAuthenticated()) {
    return <Navigate to="/acceso" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}