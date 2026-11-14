import { useEffect, useState } from "react";
import { getAdminPrimaryStatus, setAdminPrimaryStatus } from "./adminAuth";
import { supabase } from "./supabase";

/** Client hint for navigation; privileged operations remain enforced by Edge Functions. */
export function usePrimaryAdmin() {
  const [isPrimaryAdmin, setIsPrimaryAdmin] = useState<boolean | null>(() => getAdminPrimaryStatus());

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setAdminPrimaryStatus(false);
        if (active) setIsPrimaryAdmin(false);
        return;
      }
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("is_primary_admin")
        .eq("id", user.id)
        .maybeSingle();
      const value = !error && profile?.is_primary_admin === true;
      setAdminPrimaryStatus(value);
      if (active) setIsPrimaryAdmin(value);
    })().catch(() => {
      setAdminPrimaryStatus(false);
      if (active) setIsPrimaryAdmin(false);
    });
    return () => { active = false; };
  }, []);

  return isPrimaryAdmin;
}
