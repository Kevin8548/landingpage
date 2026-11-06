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
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsLoadError, setEventsLoadError] = useState("");

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
      // La persistencia puede ocurrir inmediatamente después de onChange.
      // Actualizamos la ref en este mismo instante para que saveEvent nunca
      // lea el valor anterior mientras React aún programa el re-render.
      eventItemsRef.current = next;
      writeStorage(next);
      return next;
    });
  }, []);

  const reloadEvents = useCallback(async () => {
    setEventsLoading(true);
    try {
      const realEvents = await getEventsFromSupabase();
      eventItemsRef.current = realEvents;
      setEventItemsState(realEvents);
      writeStorage(realEvents);
      setEventsLoadError("");
      return true;
    } catch (reason) {
      const message = reason && typeof reason === "object" && "message" in reason && typeof reason.message === "string"
        ? reason.message
        : "No se pudieron consultar los eventos.";
      console.error("No se pudo actualizar la lista de eventos:", reason);
      setEventsLoadError(message);
      return false;
    } finally {
      setEventsLoading(false);
    }
  }, []);

  // Supabase es la fuente de verdad, aun cuando la lista esté vacía.
  useEffect(() => {
    void reloadEvents();
  }, [reloadEvents]);

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
      throw err;
    }
  }, []);

  const saveEvents = useCallback(async (ids: string[]) => {
    await Promise.all(ids.map((id) => saveEvent(id)));
  }, [saveEvent]);

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
    eventsLoading,
    eventsLoadError,
    addEvent,
    updateEventField,
    updateEventCategory,
    updateEventImage,
    deleteEvent,
    saveEvent,
    saveEvents,
    saveEventImage,
    reloadEvents,
  };
}
