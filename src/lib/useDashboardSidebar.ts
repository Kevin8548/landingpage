import { useEffect, useState } from "react";

const STORAGE_KEY = "utt_dashboard_sidebar_collapsed";

export function useDashboardSidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === "true"; }
    catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, String(collapsed)); }
    catch { /* El menú sigue funcionando aunque el almacenamiento esté bloqueado. */ }
  }, [collapsed]);

  return [collapsed, setCollapsed] as const;
}
