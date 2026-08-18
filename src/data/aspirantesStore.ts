import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_HERO_SUBTITLE,
  DEFAULT_HERO_TITLE,
  dates as seedDates,
  institutions as seedInstitutions,
  type Institution,
  type KeyDate,
} from "./aspirantes";

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

const genId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export type DateTextField = "title" | "description" | "date";
export type InstitutionTextField = "name" | "description";

export function useAspirantesStore() {
  const [data, setDataState] = useState<AspirantesData>(readStorage);

  const commit = useCallback((updater: (prev: AspirantesData) => AspirantesData) => {
    setDataState((prev) => {
      const next = updater(prev);
      writeStorage(next);
      return next;
    });
  }, []);

  // Sincroniza con cambios hechos desde otra pestaña.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      setDataState(readStorage());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setHeroTitle = useCallback(
    (value: string) => commit((prev) => ({ ...prev, heroTitle: value })),
    [commit]
  );

  const setHeroSubtitle = useCallback(
    (value: string) => commit((prev) => ({ ...prev, heroSubtitle: value })),
    [commit]
  );

  const updateDateField = useCallback(
    (id: string, field: DateTextField, value: string) => {
      commit((prev) => ({
        ...prev,
        dateItems: prev.dateItems.map((d) => (d.id === id ? { ...d, [field]: value } : d)),
      }));
    },
    [commit]
  );

  const addDate = useCallback((): KeyDate => {
    const newDate: KeyDate = {
      id: genId(),
      title: "Nueva etapa",
      description: "Describe esta etapa del proceso.",
      date: "Fecha por definir",
    };
    commit((prev) => ({ ...prev, dateItems: [...prev.dateItems, newDate] }));
    return newDate;
  }, [commit]);

  const deleteDate = useCallback(
    (id: string) => {
      commit((prev) => ({ ...prev, dateItems: prev.dateItems.filter((d) => d.id !== id) }));
    },
    [commit]
  );

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

  const updateInstitutionLogo = useCallback(
    (id: string, logo: string | undefined) => {
      commit((prev) => ({
        ...prev,
        institutionItems: prev.institutionItems.map((it) => (it.id === id ? { ...it, logo } : it)),
      }));
    },
    [commit]
  );

  const addInstitution = useCallback((): Institution => {
    const newInstitution: Institution = {
      id: genId(),
      name: "Nueva institución",
      description: "Describe el convenio con esta institución.",
    };
    commit((prev) => ({ ...prev, institutionItems: [...prev.institutionItems, newInstitution] }));
    return newInstitution;
  }, [commit]);

  const deleteInstitution = useCallback(
    (id: string) => {
      commit((prev) => ({
        ...prev,
        institutionItems: prev.institutionItems.filter((it) => it.id !== id),
      }));
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
    updateDateField,
    addDate,
    deleteDate,
    updateInstitutionField,
    updateInstitutionLogo,
    addInstitution,
    deleteInstitution,
  };
}