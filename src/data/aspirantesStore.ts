import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_HERO_SUBTITLE,
  DEFAULT_HERO_TITLE,
  dates as seedDates,
  institutions as seedInstitutions,
  type Institution,
  type KeyDate,
} from "./aspirantes";
import {
  getHeroFromSupabase,
  getDatesFromSupabase,
  getInstitutionsFromSupabase,
  updateHeroInSupabase,
  createDateInSupabase,
  updateDateInSupabase,
  deleteDateInSupabase,
  createInstitutionInSupabase,
  updateInstitutionInSupabase,
  deleteInstitutionInSupabase,
} from "../services/aspirantesQueries";
import { omitKeys } from "../lib/omitKeys";

const STORAGE_KEY = "utt_aspirantes_v1";

interface AspirantesData {
  heroTitle: string;
  heroSubtitle: string;
  dateItems: KeyDate[];
  institutionItems: Institution[];
}

const defaults = (): AspirantesData => ({
  heroTitle: DEFAULT_HERO_TITLE,
  heroSubtitle: DEFAULT_HERO_SUBTITLE,
  dateItems: seedDates,
  institutionItems: seedInstitutions,
});

function readStorage(): AspirantesData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults();
    const parsed = JSON.parse(raw);
    const fallback = defaults();
    return {
      heroTitle: typeof parsed.heroTitle === "string" ? parsed.heroTitle : fallback.heroTitle,
      heroSubtitle: typeof parsed.heroSubtitle === "string" ? parsed.heroSubtitle : fallback.heroSubtitle,
      dateItems: Array.isArray(parsed.dateItems) ? parsed.dateItems : fallback.dateItems,
      institutionItems: Array.isArray(parsed.institutionItems) ? parsed.institutionItems : fallback.institutionItems,
    };
  } catch {
    return defaults();
  }
}

function writeStorage(data: AspirantesData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage no disponible — se ignora, el estado en memoria sigue
    // funcionando en esta pestaña aunque no persista ni se sincronice.
  }
}

export type DateTextField = "title" | "description" | "date";
export type InstitutionTextField = "name" | "description";

export function useAspirantesStore() {
  const [data, setDataState] = useState<AspirantesData>(readStorage);

  // Ref sincronizado con el estado más reciente, para que las funciones de
  // guardado lean el valor actual sin quedarse pegadas a un closure viejo.
  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const commit = useCallback((updater: (prev: AspirantesData) => AspirantesData) => {
    setDataState((prev) => {
      const next = updater(prev);
      writeStorage(next);
      return next;
    });
  }, []);

  // Carga el contenido real desde Supabase al montar. Mientras tanto se
  // muestra lo que haya en localStorage (o la data semilla).
  useEffect(() => {
    let mounted = true;
    async function loadRealContent() {
      const [hero, realDates, realInstitutions] = await Promise.all([
        getHeroFromSupabase(),
        getDatesFromSupabase(),
        getInstitutionsFromSupabase(),
      ]);
      if (!mounted) return;
      setDataState((prev) => ({
        heroTitle: hero?.title ?? prev.heroTitle,
        heroSubtitle: hero?.subtitle ?? prev.heroSubtitle,
        dateItems: realDates.length > 0 ? realDates : prev.dateItems,
        institutionItems: realInstitutions.length > 0 ? realInstitutions : prev.institutionItems,
      }));
    }
    loadRealContent();

    return () => {
      mounted = false;
    };
  }, []);

  // ---------- hero ----------

  const setHeroTitle = useCallback(
    (value: string) => commit((prev) => ({ ...prev, heroTitle: value })),
    [commit]
  );

  const setHeroSubtitle = useCallback(
    (value: string) => commit((prev) => ({ ...prev, heroSubtitle: value })),
    [commit]
  );

  const saveHero = useCallback(async () => {
    const current = dataRef.current;
    try {
      await updateHeroInSupabase({ title: current.heroTitle, subtitle: current.heroSubtitle });
    } catch (err) {
      console.error("No se pudo guardar el hero:", err);
    }
  }, []);

  // ---------- fechas clave ----------

  const updateDateField = useCallback(
    (id: string, field: DateTextField, value: string) => {
      commit((prev) => ({
        ...prev,
        dateItems: prev.dateItems.map((d) => (d.id === id ? { ...d, [field]: value } : d)),
      }));
    },
    [commit]
  );

  const saveDate = useCallback(async (id: string) => {
    const current = dataRef.current.dateItems.find((d) => d.id === id);
    if (!current) return;
    try {
      const rest = omitKeys(current, "id");
      await updateDateInSupabase(id, rest);
    } catch (err) {
      console.error("No se pudo guardar la fecha:", err);
    }
  }, []);

  const addDate = useCallback(async (): Promise<KeyDate> => {
    const draft: Omit<KeyDate, "id"> = {
      title: "Nueva etapa",
      description: "Describe esta etapa del proceso.",
      date: "Fecha por definir",
    };
    const id = await createDateInSupabase(draft);
    const newDate: KeyDate = { id, ...draft };
    commit((prev) => ({ ...prev, dateItems: [...prev.dateItems, newDate] }));
    return newDate;
  }, [commit]);

  const deleteDate = useCallback(
    async (id: string) => {
      const previous = dataRef.current;
      commit((prev) => ({ ...prev, dateItems: prev.dateItems.filter((d) => d.id !== id) })); // optimista
      try {
        await deleteDateInSupabase(id);
      } catch (err) {
        console.error("No se pudo eliminar la fecha:", err);
        setDataState(previous); // rollback si falla
      }
    },
    [commit]
  );

  // ---------- instituciones ----------

  const updateInstitutionField = useCallback(
    (id: string, field: InstitutionTextField, value: string) => {
      commit((prev) => ({
        ...prev,
        institutionItems: prev.institutionItems.map((it) =>
          it.id === id ? { ...it, [field]: value } : it
        ),
      }));
    },
    [commit]
  );

  const saveInstitution = useCallback(async (id: string) => {
    const current = dataRef.current.institutionItems.find((it) => it.id === id);
    if (!current) return;
    try {
      const rest = omitKeys(current, "id");
      await updateInstitutionInSupabase(id, rest);
    } catch (err) {
      console.error("No se pudo guardar la institución:", err);
    }
  }, []);

  // Preview local inmediato del logo (antes de que termine de subir).
  const updateInstitutionLogo = useCallback(
    (id: string, logo: string | undefined) => {
      commit((prev) => ({
        ...prev,
        institutionItems: prev.institutionItems.map((it) => (it.id === id ? { ...it, logo } : it)),
      }));
    },
    [commit]
  );

  // Sube (o quita) el logo de verdad y actualiza el estado con la URL real.
  const saveInstitutionLogo = useCallback(
    async (id: string, logoDataUrl?: string, removeLogo?: boolean) => {
      const current = dataRef.current.institutionItems.find((it) => it.id === id);
      if (!current) return;
      try {
        const rest = omitKeys(current, "id");
        const { logo_url } = await updateInstitutionInSupabase(id, rest, { logoDataUrl, removeLogo });
        commit((prev) => ({
          ...prev,
          institutionItems: prev.institutionItems.map((it) =>
            it.id === id ? { ...it, logo: logo_url ?? undefined } : it
          ),
        }));
      } catch (err) {
        console.error("No se pudo guardar el logo:", err);
      }
    },
    [commit]
  );

  const addInstitution = useCallback(async (): Promise<Institution> => {
    const draft: Omit<Institution, "id"> = {
      name: "Nueva institución",
      description: "Describe el convenio con esta institución.",
    };
    const id = await createInstitutionInSupabase(draft);
    const newInstitution: Institution = { id, ...draft };
    commit((prev) => ({ ...prev, institutionItems: [...prev.institutionItems, newInstitution] }));
    return newInstitution;
  }, [commit]);

  const deleteInstitution = useCallback(
    async (id: string) => {
      const previous = dataRef.current;
      commit((prev) => ({
        ...prev,
        institutionItems: prev.institutionItems.filter((it) => it.id !== id),
      })); // optimista
      try {
        await deleteInstitutionInSupabase(id);
      } catch (err) {
        console.error("No se pudo eliminar la institución:", err);
        setDataState(previous); // rollback si falla
      }
    },
    [commit]
  );

  return {
    heroTitle: data.heroTitle,
    heroSubtitle: data.heroSubtitle,
    dateItems: data.dateItems,
    institutionItems: data.institutionItems,
    setHeroTitle,
    setHeroSubtitle,
    saveHero,
    updateDateField,
    saveDate,
    addDate,
    deleteDate,
    updateInstitutionField,
    saveInstitution,
    updateInstitutionLogo,
    saveInstitutionLogo,
    addInstitution,
    deleteInstitution,
  };
}
