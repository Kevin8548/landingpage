import { useCallback, useEffect, useState } from "react";
import { getAdminFullName, getAdminGreetingName, setAdminFullName } from "./adminAuth";
import { supabase } from "./supabase";

export function useAdminName() {
  const [adminName, setAdminNameState] = useState<string | null>(() => getAdminGreetingName());
  const [fullName, setFullNameState] = useState<string | null>(() => getAdminFullName());

  const setAdminName = useCallback((value: unknown) => {
    const full = typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
    const firstName = full.split(/\s+/)[0] ?? "";
    const formatted = firstName ? firstName.charAt(0).toLocaleUpperCase("es-MX") + firstName.slice(1) : "";
    const formattedFull = full ? full.charAt(0).toLocaleUpperCase("es-MX") + full.slice(1) : "";
    setAdminFullName(formattedFull);
    setAdminNameState(formatted || null);
    setFullNameState(formattedFull || null);
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return;
      const { data: profile } = await supabase.from("profiles").select("nombre,apellido_paterno,apellido_materno").eq("id", user.id).maybeSingle();
      const metadata = user.user_metadata ?? {};
      const identityNames = user.identities?.flatMap((identity) => [
        identity.identity_data?.given_name,
        identity.identity_data?.first_name,
        identity.identity_data?.full_name,
        identity.identity_data?.name,
      ]) ?? [];
      const profileName = [profile?.nombre, profile?.apellido_paterno, profile?.apellido_materno].filter(Boolean).join(" ");
      const name = [profileName, metadata.full_name, metadata.name, metadata.display_name, metadata.given_name, metadata.first_name, ...identityNames]
        .find((value): value is string => typeof value === "string" && value.trim().length > 0 && !value.includes("@"));
      if (name) {
        const normalizedName = name.trim().replace(/\s+/g, " ");
        const firstName = normalizedName.split(/\s+/)[0];
        const formatted = firstName.charAt(0).toLocaleUpperCase("es-MX") + firstName.slice(1);
        const formattedFull = normalizedName.charAt(0).toLocaleUpperCase("es-MX") + normalizedName.slice(1);
        setAdminFullName(formattedFull);
        if (active) {
          setAdminNameState(formatted);
          setFullNameState(formattedFull);
        }
      }
    })().catch((error) => console.error("No se pudo consultar el nombre del administrador:", error));
    return () => { active = false; };
  }, []);

  return { adminName, fullName, setAdminName };
}
