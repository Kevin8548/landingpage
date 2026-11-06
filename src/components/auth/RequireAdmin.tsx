import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAdminAuthenticated, setAdminAuthenticated } from "../../lib/adminAuth";
import { supabase } from "../../lib/supabase";

export default function RequireAdmin({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [verified, setVerified] = useState(false);
  const [isAdmin, setIsAdmin] = useState(isAdminAuthenticated());

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setAdminAuthenticated(false); if (active) { setIsAdmin(false); setVerified(true); } return; }
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).maybeSingle();
      const valid = profile?.role === "admin";
      setAdminAuthenticated(valid);
      if (active) { setIsAdmin(valid); setVerified(true); }
    })().catch(() => { setAdminAuthenticated(false); if (active) { setIsAdmin(false); setVerified(true); } });
    return () => { active = false; };
  }, []);

  if (!verified) return <main className="min-h-dvh bg-[var(--bg,#f7f9f6)]" aria-busy="true" />;
  if (!isAdmin) {
    return <Navigate to="/acceso" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
