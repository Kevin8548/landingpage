import { useCallback, useEffect, useState } from "react";
import { events as seedEvents, type Category, type EventItem } from "./eventos";

const STORAGE_KEY = "utt_eventos_v1";

function readStorage(): EventItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedEvents;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : seedEvents;
  } catch {
    return seedEvents;
  }
}

function writeStorage(items: EventItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage no disponible (modo privado, cuota llena, etc.) — se
    // ignora silenciosamente, el estado en memoria sigue funcionando en
    // esta pestaña aunque no persista ni se sincronice con otras.
  }
}

const genId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const todayISO = () => new Date().toISOString().slice(0, 10);

export type EventTextField = "title" | "description" | "location" | "date" | "time";

export function useEventosStore() {
  const [eventItems, setEventItemsState] = useState<EventItem[]>(readStorage);

  // Persiste cada cambio local a localStorage.
  const commit = useCallback((updater: (prev: EventItem[]) => EventItem[]) => {
    setEventItemsState((prev) => {
      const next = updater(prev);
      writeStorage(next);
      return next;
    });
  }, []);

  // Escucha cambios hechos desde OTRA pestaña (ej. el dashboard editando
  // mientras la landing pública está abierta en la pestaña de
  // "Previsualizar"). El evento "storage" solo se dispara en pestañas
  // distintas a la que hizo el cambio, nunca en la misma — por eso combinar
  // esto con `commit` cubre ambos casos.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      setEventItemsState(readStorage());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const updateEventField = useCallback(
    (id: string, field: EventTextField, value: string) => {
      commit((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
    },
    [commit]
  );

  const updateEventCategory = useCallback(
    (id: string, category: Category) => {
      commit((prev) => prev.map((e) => (e.id === id ? { ...e, category } : e)));
    },
    [commit]
  );

  const updateEventImage = useCallback(
    (id: string, image: string | undefined) => {
      commit((prev) => prev.map((e) => (e.id === id ? { ...e, image } : e)));
    },
    [commit]
  );

  const addEvent = useCallback((): EventItem => {
    const newEvent: EventItem = {
      id: genId(),
      title: "Nuevo evento",
      date: todayISO(),
      time: "09:00",
      location: "Ubicación por definir",
      category: "academico",
      description: "Describe este evento para que la comunidad sepa qué esperar.",
    };
    commit((prev) => [...prev, newEvent]);
    return newEvent;
  }, [commit]);

  const deleteEvent = useCallback(
    (id: string) => {
      commit((prev) => prev.filter((e) => e.id !== id));
    },
    [commit]
  );

  return {
    eventItems,
    addEvent,
    updateEventField,
    updateEventCategory,
    updateEventImage,
    deleteEvent,
  };
}