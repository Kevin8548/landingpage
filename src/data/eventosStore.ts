import { useCallback, useEffect, useRef, useState } from "react";
import {
  getEventsFromSupabase,
  createEventInSupabase,
  updateEventInSupabase,
  deleteEventInSupabase,
} from "../services/queries";
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

const todayISO = () => new Date().toISOString().slice(0, 10);

export type EventTextField = "title" | "description" | "location" | "date" | "time";

export function useEventosStore() {
  const [eventItems, setEventItemsState] = useState<EventItem[]>(readStorage);

  // Ref sincronizado con el estado más reciente, para que saveEvent /
  // saveEventImage / deleteEvent lean el valor actual sin quedarse pegados
  // a un closure viejo.
  const eventItemsRef = useRef(eventItems);
  useEffect(() => {
    eventItemsRef.current = eventItems;
  }, [eventItems]);

  // Persiste cada cambio local a localStorage (edición en vivo, antes de
  // guardar de verdad en Supabase).
  const commit = useCallback((updater: (prev: EventItem[]) => EventItem[]) => {
    setEventItemsState((prev) => {
      const next = updater(prev);
      writeStorage(next);
      return next;
    });
  }, []);

  // Carga los eventos reales desde Supabase al montar. Mientras tanto se
  // muestra lo que haya en localStorage (o la data semilla) para que no
  // se vea vacío.
  useEffect(() => {
    let mounted = true;
    async function loadRealEvents() {
      const realEvents = await getEventsFromSupabase();
      if (mounted && realEvents.length > 0) {
        setEventItemsState(realEvents);
      }
    }
    loadRealEvents();

    return () => {
      mounted = false;
    };
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

  // Preview local inmediato (antes de que termine de subir a Supabase).
  const updateEventImage = useCallback(
    (id: string, image: string | undefined) => {
      commit((prev) => prev.map((e) => (e.id === id ? { ...e, image } : e)));
    },
    [commit]
  );

  // Manda a Supabase el estado actual del evento `id` (sin tocar imagen).
  // Se llama en los momentos "discretos" de la edición (onBlur de texto,
  // cambio de fecha, hora o categoría) para no disparar una llamada por
  // cada tecla.
  const saveEvent = useCallback(async (id: string) => {
    const current = eventItemsRef.current.find((e) => e.id === id);
    if (!current) return;
    try {
      const { id: _omit, ...rest } = current;
      await updateEventInSupabase(id, rest);
    } catch (err) {
      console.error("No se pudo guardar el evento:", err);
      // aquí podrías disparar un toast de error si tienen uno
    }
  }, []);

  // Sube (o quita) la imagen de verdad a Supabase Storage y actualiza el
  // estado local con la URL pública real que regresa la función, para que
  // ya no dependa de un blob local que se pierde al recargar.
  const saveEventImage = useCallback(
    async (id: string, imageDataUrl?: string, removeImage?: boolean) => {
      const current = eventItemsRef.current.find((e) => e.id === id);
      if (!current) return;
      try {
        const { id: _omit, ...rest } = current;
        const { imagen_url } = await updateEventInSupabase(id, rest, { imageDataUrl, removeImage });
        commit((prev) => prev.map((e) => (e.id === id ? { ...e, image: imagen_url ?? undefined } : e)));
      } catch (err) {
        console.error("No se pudo guardar la imagen del evento:", err);
      }
    },
    [commit]
  );

  const addEvent = useCallback(async (): Promise<EventItem> => {
    const draft: Omit<EventItem, "id"> = {
      title: "Nuevo evento",
      date: todayISO(),
      time: "09:00",
      location: "Ubicación por definir",
      category: "academico",
      description: "Describe este evento para que la comunidad sepa qué esperar.",
    };

    const id = await createEventInSupabase(draft); // si truena, se propaga el error
    const newEvent: EventItem = { id, ...draft };
    commit((prev) => [...prev, newEvent]);
    return newEvent;
  }, [commit]);

  const deleteEvent = useCallback(
    async (id: string) => {
      const previous = eventItemsRef.current;
      commit((prev) => prev.filter((e) => e.id !== id)); // optimista
      try {
        await deleteEventInSupabase(id);
      } catch (err) {
        console.error("No se pudo eliminar el evento:", err);
        setEventItemsState(previous); // rollback si falla
      }
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
    saveEvent,
    saveEventImage,
  };
}