import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { IconType } from "react-icons";
import { FiClock, FiMapPin, FiFilter, FiArrowRight, FiCalendar } from "react-icons/fi";
import { CATEGORY_META, CATEGORY_ORDER, type Category, type EventItem } from "../../data/eventos";
import { useEventosStore } from "../../data/eventosStore";

interface MonthGroup {
  key: string; // "2026-08"
  label: string; // "Agosto"
  year: string; // "2026"
  events: EventItem[];
}

// ---------- utilidades de fecha ----------

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const parseISO = (iso: string) => new Date(`${iso}T00:00:00`);

const isValidDate = (d: Date) => !Number.isNaN(d.getTime());

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const fmtDateShort = (iso: string) => {
  const d = parseISO(iso);
  if (!isValidDate(d)) return "";
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short" }).replace(".", "");
};

const dayNumber = (iso: string) => {
  const d = parseISO(iso);
  return isValidDate(d) ? d.getDate() : 0;
};

const monthShort = (iso: string) => {
  const d = parseISO(iso);
  if (!isValidDate(d)) return "";
  return d
    .toLocaleDateString("es-MX", { month: "short" })
    .replace(".", "")
    .toUpperCase();
};

const monthKey = (iso: string) => (iso && iso.length >= 7 ? iso.slice(0, 7) : "sin-fecha");

const monthLabel = (iso: string) => {
  const d = parseISO(iso);
  if (!isValidDate(d)) return "Sin fecha";
  return capitalize(d.toLocaleDateString("es-MX", { month: "long" }));
};

const weekdayLabel = (iso: string) => {
  const d = parseISO(iso);
  if (!isValidDate(d)) return "";
  return capitalize(d.toLocaleDateString("es-MX", { weekday: "long" }));
};

const daysUntil = (iso: string) => {
  const d = parseISO(iso);
  if (!isValidDate(d)) return Number.POSITIVE_INFINITY;
  return Math.round((d.getTime() - startOfToday().getTime()) / 86400000);
};

const daysLabel = (days: number) => {
  if (days === 0) return "Hoy";
  if (days === 1) return "Mañana";
  if (days > 1) return `En ${days} días`;
  if (days === -1) return "Ayer";
  return "Realizado";
};

// ---------- refs indexados por clave ----------

function useKeyedRefs<T extends HTMLElement>() {
  const elements = useRef<Map<string, T>>(new Map());
  const callbacks = useRef<Map<string, (el: T | null) => void>>(new Map());

  const getRef = (key: string) => {
    let cb = callbacks.current.get(key);
    if (!cb) {
      cb = (el: T | null) => {
        if (el) elements.current.set(key, el);
        else elements.current.delete(key);
      };
      callbacks.current.set(key, cb);
    }
    return cb;
  };

  return { elements, getRef };
}

// ---------- animación ----------

const sectionVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// ---------- piezas ----------

interface FilterPillProps {
  active: boolean;
  color: string;
  onClick: () => void;
  children: React.ReactNode;
}

const FilterPill = ({ active, color, onClick, children }: FilterPillProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] focus-visible:ring-[var(--teal)]"
    style={{
      borderColor: active ? color : "var(--line)",
      color: active ? color : "var(--muted)",
      backgroundColor: active
        ? `color-mix(in srgb, ${color} 14%, transparent)`
        : "transparent",
    }}
  >
    {children}
  </button>
);

interface EmptyBoardProps {
  title: string;
  message: string;
}

const EmptyBoard = ({ title, message }: EmptyBoardProps) => (
  <div className="relative mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-dashed border-[var(--line)] bg-[var(--glass)] px-8 py-14 text-center">
    <span
      className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)]"
      style={{
        background:
          "linear-gradient(135deg, color-mix(in srgb, var(--green) 22%, transparent), color-mix(in srgb, var(--orange) 22%, transparent))",
      }}
      aria-hidden="true"
    >
      <FiCalendar className="h-5 w-5 text-[var(--ink)]" />
    </span>
    <h3 className="font-display text-lg font-bold text-[var(--ink)]">{title}</h3>
    <p className="max-w-xs text-sm leading-relaxed text-[var(--muted)]">{message}</p>
  </div>
);

interface EventCardProps {
  event: EventItem;
  highlighted?: boolean;
}

// Tarjeta tipo "flyer", solo lectura: imagen/franja visual arriba con
// fecha y categoría sobrepuestas, y el texto abajo con la fecha integrada
// al contenido. Sin ningún control de edición.
const EventCard = ({ event, highlighted = false }: EventCardProps) => {
  const meta = CATEGORY_META[event.category];
  const Icon = meta.icon;
  const days = daysUntil(event.date);
  const isPast = days < 0;

  return (
    <article
      id={`evento-${event.id}`}
      className={`event-card-glow group relative flex h-full scroll-mt-28 flex-col overflow-hidden rounded-2xl border bg-[var(--glass)] shadow-sm transition-transform duration-300 hover:-translate-y-1 ${
        isPast ? "opacity-55" : ""
      } ${highlighted ? "event-card-highlight border-[var(--orange)]" : "border-[var(--line)]"}`}
    >
      <span
        className="absolute inset-x-0 top-0 z-20 h-[3px]"
        style={{ background: "linear-gradient(90deg, var(--green), var(--orange))" }}
        aria-hidden="true"
      />
      <span
        className="absolute left-6 top-0 z-20 hidden h-2 w-2 -translate-y-1/2 rounded-full border-2 border-[var(--bg)] sm:block"
        style={{ backgroundColor: meta.color }}
        aria-hidden="true"
      />

      <div className="relative h-40 w-full shrink-0 overflow-hidden">
        {event.image ? (
          <img
            src={event.image}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{
              background: `radial-gradient(circle at 25% 20%, color-mix(in srgb, ${meta.color} 30%, var(--bg)) 0%, var(--bg) 75%)`,
            }}
          >
            <Icon
              className="h-14 w-14 opacity-[0.16] transition-transform duration-500 group-hover:scale-110"
              style={{ color: meta.color }}
              aria-hidden="true"
            />
          </div>
        )}

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, transparent 45%, color-mix(in srgb, var(--bg) 65%, transparent) 100%)",
          }}
        />

        <div
          className="absolute left-3 top-3 flex items-baseline gap-1 rounded-lg px-2.5 py-1.5 backdrop-blur-md"
          style={{
            backgroundColor: "color-mix(in srgb, var(--bg) 78%, transparent)",
            border: "1px solid var(--line)",
          }}
        >
          <span className="font-display text-lg font-bold leading-none text-[var(--ink)]">
            {dayNumber(event.date)}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]">
            {monthShort(event.date)}
          </span>
        </div>

        <div
          className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide backdrop-blur-md"
          style={{
            color: meta.color,
            backgroundColor: `color-mix(in srgb, ${meta.color} 20%, var(--bg) 80%)`,
            border: `1px solid color-mix(in srgb, ${meta.color} 45%, transparent)`,
          }}
        >
          <Icon className="h-2.5 w-2.5" aria-hidden="true" />
          {meta.label}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 p-5">
        <span
          className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-wide"
          style={{ color: meta.color }}
        >
          <FiClock className="h-3 w-3 shrink-0" aria-hidden="true" />
          {fmtDateShort(event.date)} · {event.time} hrs
        </span>

        <h3 className="font-display text-lg font-bold leading-snug text-[var(--ink)]">
          {event.title}
        </h3>

        <p className="line-clamp-2 text-sm text-[var(--muted)]">{event.description}</p>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-[var(--line)] pt-2.5">
          <span className="inline-flex min-w-0 items-center gap-1 truncate font-mono text-[11px] text-[var(--muted)]/80">
            <FiMapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{event.location}</span>
          </span>
          <span
            className="shrink-0 font-mono text-[10px] uppercase tracking-wide"
            style={{ color: isPast ? "var(--muted)" : meta.color }}
          >
            {daysLabel(days)}
          </span>
        </div>
      </div>
    </article>
  );
};

interface HeroSpotlightProps {
  event: EventItem;
  onViewInBoard: () => void;
  reduceMotion: boolean;
}

const HeroSpotlight = ({ event, onViewInBoard, reduceMotion }: HeroSpotlightProps) => {
  const meta = CATEGORY_META[event.category];
  const Icon = meta.icon;
  const days = daysUntil(event.date);

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.1 }}
      className="relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--glass)] p-6 sm:p-8"
      style={{
        boxShadow:
          "0 30px 70px -30px color-mix(in srgb, var(--green) 35%, transparent), 0 22px 55px -28px color-mix(in srgb, var(--orange) 30%, transparent)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(circle at 85% -10%, color-mix(in srgb, var(--green) 20%, transparent) 0%, transparent 55%), radial-gradient(circle at 8% 115%, color-mix(in srgb, var(--orange) 16%, transparent) 0%, transparent 55%)",
        }}
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:items-start sm:gap-1">
          <span className="font-display text-6xl font-extrabold leading-none text-[var(--ink)] sm:text-7xl">
            {dayNumber(event.date)}
          </span>
          <div className="flex flex-col">
            <span
              className="font-mono text-sm uppercase tracking-widest"
              style={{ color: meta.color }}
            >
              {monthShort(event.date)}
            </span>
            <span className="font-mono text-[11px] text-[var(--muted)]">
              {event.date.slice(0, 4)}
            </span>
          </div>
        </div>

        <div className="h-px w-full bg-[var(--line)] sm:h-16 sm:w-px" aria-hidden="true" />

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="relative flex h-2 w-2 shrink-0">
              <span
                className="node-halo absolute inset-0 rounded-full"
                style={{ backgroundColor: meta.color }}
              />
              <span
                className="absolute inset-[2.5px] rounded-full"
                style={{ backgroundColor: meta.color }}
              />
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
              Próximo en el tablón
            </span>
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide"
              style={{
                color: meta.color,
                backgroundColor: `color-mix(in srgb, ${meta.color} 18%, var(--bg) 82%)`,
                border: `1px solid color-mix(in srgb, ${meta.color} 45%, transparent)`,
              }}
            >
              <Icon className="h-2.5 w-2.5" aria-hidden="true" />
              {meta.label}
            </span>
          </div>

          <h2 className="font-display text-2xl font-bold leading-snug text-[var(--ink)] sm:text-3xl">
            {event.title}
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
            {event.description}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
            <span className="inline-flex items-center gap-1.5 font-mono text-xs text-[var(--muted)]">
              <FiClock className="h-3.5 w-3.5" aria-hidden="true" />
              {weekdayLabel(event.date)} · {event.time} hrs
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono text-xs text-[var(--muted)]">
              <FiMapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {event.location}
            </span>
            <span
              className="font-mono text-xs font-semibold uppercase tracking-wide"
              style={{ color: meta.color }}
            >
              {daysLabel(days)}
            </span>

            <button
              type="button"
              onClick={onViewInBoard}
              className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] px-4 py-2 font-mono text-xs uppercase tracking-wide text-[var(--ink)] transition-colors hover:border-[var(--ink)]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] focus-visible:ring-[var(--teal)]"
            >
              Ver en el tablón
              <FiArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const Eventos = () => {
  const reduceMotion = !!useReducedMotion();

  // Solo lectura: el store se alimenta de localStorage y se sincroniza
  // solo cuando el admin edita en otra pestaña (evento "storage").
  const { eventItems } = useEventosStore();

  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [pendingScroll, setPendingScroll] = useState<string | null>(null);
  const [activeMonth, setActiveMonth] = useState<string | null>(null);

  // Bandera para distinguir el primer render (donde NO queremos que
  // ningún scroll automático toque la ventana) de los cambios de mes
  // que sí vienen de una interacción real del usuario.
  const hasMountedRef = useRef(false);

  const { elements: sectionRefs, getRef: getSectionRef } = useKeyedRefs<HTMLElement>();
  const { elements: mobileNavRefs, getRef: getMobileNavRef } = useKeyedRefs<HTMLButtonElement>();
  const { elements: desktopNavRefs, getRef: getDesktopNavRef } = useKeyedRefs<HTMLButtonElement>();

  const sorted = useMemo(
    () => [...eventItems].sort((a, b) => a.date.localeCompare(b.date)),
    [eventItems]
  );

  const upcoming = useMemo(() => sorted.filter((e) => daysUntil(e.date) >= 0), [sorted]);
  const nextEvent = upcoming[0];

  const counts = useMemo(() => {
    const map: Partial<Record<Category, number>> = {};
    sorted.forEach((e) => {
      map[e.category] = (map[e.category] ?? 0) + 1;
    });
    return map;
  }, [sorted]);

  const filtered = useMemo(
    () => (activeCategory ? sorted.filter((e) => e.category === activeCategory) : sorted),
    [sorted, activeCategory]
  );

  const groups = useMemo<MonthGroup[]>(() => {
    const map = new Map<string, MonthGroup>();
    filtered.forEach((e) => {
      const key = monthKey(e.date);
      if (!map.has(key)) {
        map.set(key, { key, label: monthLabel(e.date), year: e.date.slice(0, 4), events: [] });
      }
      map.get(key)!.events.push(e);
    });
    return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
  }, [filtered]);

  useEffect(() => {
    setActiveMonth((prev) => {
      if (groups.length === 0) return null;
      return prev && groups.some((g) => g.key === prev) ? prev : groups[0].key;
    });
  }, [groups]);

  // FIX: antes usaba `scrollIntoView({ block: "nearest" })` sobre el pill
  // del mes activo. Como el componente vive dentro de una sección de la
  // landing que puede estar fuera del viewport, scrollIntoView arrastraba
  // TODA la ventana hacia esa sección al montarse (aunque el objetivo real
  // solo era centrar el pill dentro de su propio contenedor horizontal).
  // Ahora movemos manualmente `scrollLeft` del contenedor padre, así el
  // scroll nunca sale de ese contenedor ni toca `window`.
  useEffect(() => {
    if (!activeMonth) return;

    const scrollWithinParent = (btn: HTMLButtonElement | undefined) => {
      if (!btn) return;
      const container = btn.parentElement;
      if (!container) return;

      const targetLeft =
        btn.offsetLeft - container.clientWidth / 2 + btn.clientWidth / 2;

      container.scrollTo({
        left: Math.max(0, targetLeft),
        behavior: reduceMotion ? "auto" : "smooth",
      });
    };

    scrollWithinParent(mobileNavRefs.current.get(activeMonth));
    scrollWithinParent(desktopNavRefs.current.get(activeMonth));
  }, [activeMonth, reduceMotion, mobileNavRefs, desktopNavRefs]);

  useEffect(() => {
    const targets = Array.from(sectionRefs.current.values());
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (observed) => {
        observed.forEach((entry) => {
          if (entry.isIntersecting) {
            const key = (entry.target as HTMLElement).dataset.monthKey;
            if (key) setActiveMonth(key);
          }
        });
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [groups, sectionRefs]);

  useEffect(() => {
    if (!pendingScroll) return;

    let attempts = 0;
    let rafId = 0;

    const tryScroll = () => {
      const el = document.getElementById(`evento-${pendingScroll}`);
      if (el) {
        el.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "center",
          inline: "nearest",
        });
        setPendingScroll(null);
        return;
      }
      attempts += 1;
      if (attempts < 30) {
        rafId = requestAnimationFrame(tryScroll);
      } else {
        setPendingScroll(null);
      }
    };

    rafId = requestAnimationFrame(tryScroll);
    return () => cancelAnimationFrame(rafId);
  }, [pendingScroll, activeCategory, reduceMotion]);

  useEffect(() => {
    hasMountedRef.current = true;
  }, []);

  const jumpToEvent = (id: string, date?: string) => {
    setActiveCategory(null);
    const resolvedDate = date ?? eventItems.find((e) => e.id === id)?.date;
    if (resolvedDate) setActiveMonth(monthKey(resolvedDate));
    setPendingScroll(id);
  };

  const scrollToMonth = (key: string) => {
    sectionRefs.current
      .get(key)
      ?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  };

  return (
    <div className="eventos-board relative min-h-screen bg-[var(--bg)]">
      <style>{`
        .font-display { font-family: "Unbounded", sans-serif; }
        .font-mono { font-family: "JetBrains Mono", monospace; }

        .event-card-glow {
          transition: box-shadow 0.35s ease, transform 0.35s ease;
          box-shadow: 0 1px 0 0 var(--line);
        }
        .event-card-glow:hover {
          box-shadow:
            0 22px 48px -22px color-mix(in srgb, var(--green) 48%, transparent),
            0 12px 28px -16px color-mix(in srgb, var(--orange) 42%, transparent);
        }

        @keyframes event-highlight-pulse {
          0% {
            box-shadow: 0 0 0 0 color-mix(in srgb, var(--orange) 55%, transparent);
          }
          100% {
            box-shadow: 0 0 0 12px color-mix(in srgb, var(--orange) 0%, transparent);
          }
        }
        .event-card-highlight {
          animation: event-highlight-pulse 1s ease-out 2;
        }
      `}</style>

      {sorted.length === 0 ? (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 py-32 sm:px-8">
          <EmptyBoard
            title="El tablón está vacío"
            message="Todavía no hay eventos publicados. Vuelve pronto — aquí aparecerá el próximo en cuanto se agregue."
          />
        </div>
      ) : (
        <>
          <section className="relative px-6 pt-16 pb-8 sm:px-8 sm:pt-20">
            <div className="mx-auto max-w-4xl">
              <div className="mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--muted)]">
                <span className="h-px w-6 bg-[var(--line)]" />
                Calendario del campus
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <motion.h1
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="font-display text-4xl font-extrabold tracking-tight text-[var(--ink)] sm:text-5xl"
                >
                  Eventos
                </motion.h1>
                <p className="max-w-sm text-sm leading-relaxed text-[var(--muted)] sm:text-right">
                  Conferencias, torneos, hackathons y actividades estudiantiles,
                  agrupadas por mes para encontrar rápido lo que sigue.
                </p>
              </div>
            </div>
          </section>

          {nextEvent && (
            <section className="relative px-6 pb-10 sm:px-8">
              <div className="mx-auto max-w-4xl">
                <HeroSpotlight
                  event={nextEvent}
                  onViewInBoard={() => jumpToEvent(nextEvent.id, nextEvent.date)}
                  reduceMotion={reduceMotion}
                />
              </div>
            </section>
          )}

          {upcoming.length > 0 && (
            <section className="relative px-6 pb-10 sm:px-8">
              <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--glass)]">
                <div className="flex items-center gap-2 border-b border-[var(--line)] px-4 py-2.5">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="node-halo absolute inset-0 rounded-full bg-[var(--green)]" />
                    <span className="absolute inset-[2.5px] rounded-full bg-[var(--green)]" />
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
                    En el tablón
                  </span>
                  <span className="ml-auto font-mono text-[10px] text-[var(--muted)]/60">
                    {upcoming.length} próximo{upcoming.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="relative h-40 overflow-hidden">
                  <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-6 bg-gradient-to-b from-[var(--bg)] to-transparent" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-6 bg-gradient-to-t from-[var(--bg)] to-transparent" />
                  <div
                    className={
                      reduceMotion ? "" : "animate-marquee-up hover:[animation-play-state:paused]"
                    }
                    style={
                      reduceMotion
                        ? undefined
                        : { animationDuration: `${upcoming.length * 3.2}s` }
                    }
                  >
                    {(reduceMotion ? upcoming : [...upcoming, ...upcoming]).map((e, i) => {
                      const meta = CATEGORY_META[e.category];
                      return (
                        <button
                          key={`${e.id}-${i}`}
                          type="button"
                          onClick={() => jumpToEvent(e.id, e.date)}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[var(--ink)]/5 focus-visible:outline-none focus-visible:bg-[var(--ink)]/5"
                        >
                          <span
                            className="w-14 shrink-0 font-mono text-[11px]"
                            style={{ color: meta.color }}
                          >
                            {fmtDateShort(e.date)}
                          </span>
                          <span className="flex-1 truncate text-sm text-[var(--ink)]">
                            {e.title}
                          </span>
                          <span className="hidden shrink-0 font-mono text-[10px] text-[var(--muted)] sm:inline">
                            {e.location}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className="relative px-6 pb-6 sm:px-8">
            <div className="mx-auto max-w-4xl">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
                  <FiFilter className="h-3 w-3" aria-hidden="true" /> Filtrar por área
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <FilterPill
                  active={activeCategory === null}
                  color="var(--ink)"
                  onClick={() => setActiveCategory(null)}
                >
                  Todos <span className="opacity-50">({sorted.length})</span>
                </FilterPill>
                {CATEGORY_ORDER.filter((cat) => counts[cat]).map((cat) => {
                  const meta = CATEGORY_META[cat];
                  const Icon = meta.icon;
                  return (
                    <FilterPill
                      key={cat}
                      active={activeCategory === cat}
                      color={meta.color}
                      onClick={() => setActiveCategory(cat)}
                    >
                      <Icon className="h-3 w-3" aria-hidden="true" />
                      {meta.label} <span className="opacity-50">({counts[cat]})</span>
                    </FilterPill>
                  );
                })}
              </div>
            </div>
          </section>

          {groups.length > 1 && (
            <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:hidden">
              <div className="-mx-1 mb-6 flex gap-2 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {groups.map((g) => {
                  const isActive = g.key === activeMonth;
                  return (
                    <button
                      key={g.key}
                      type="button"
                      ref={getMobileNavRef(g.key)}
                      onClick={() => scrollToMonth(g.key)}
                      aria-current={isActive ? "true" : undefined}
                      className="shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] focus-visible:ring-[var(--teal)]"
                      style={{
                        borderColor: isActive ? "var(--teal)" : "var(--line)",
                        color: isActive ? "var(--teal)" : "var(--muted)",
                        backgroundColor: isActive
                          ? "color-mix(in srgb, var(--teal) 14%, transparent)"
                          : "transparent",
                      }}
                    >
                      {g.label} <span className="opacity-50">({g.events.length})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <section className="relative px-6 pb-24 sm:px-8">
            <div className="mx-auto flex max-w-6xl gap-10">
              <div className="min-w-0 flex-1">
                {filtered.length === 0 ? (
                  <div className="py-10">
                    <EmptyBoard
                      title="Nada pegado en esta categoría"
                      message="Prueba con otro filtro o vuelve a “Todos” para ver el resto del calendario."
                    />
                  </div>
                ) : (
                  groups.map((group) => (
                    <section
                      key={group.key}
                      id={`mes-${group.key}`}
                      ref={getSectionRef(group.key)}
                      data-month-key={group.key}
                      className="relative scroll-mt-28 pb-14 last:pb-0"
                    >
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-3 left-0 select-none font-display text-[4.5rem] font-extrabold uppercase leading-none tracking-tight text-[var(--ink)] opacity-[0.05] sm:text-[6.5rem]"
                      >
                        {group.label}
                      </span>

                      <div className="relative mb-5 flex items-baseline gap-3 border-b border-[var(--line)] pb-3">
                        <h2 className="font-display text-xl font-bold text-[var(--ink)] sm:text-2xl">
                          {group.label}
                        </h2>
                        <span className="font-mono text-xs text-[var(--muted)]">
                          {group.year}
                        </span>
                        <span className="ml-auto font-mono text-[11px] uppercase tracking-wide text-[var(--muted)]">
                          {group.events.length} evento{group.events.length !== 1 ? "s" : ""}
                        </span>
                      </div>

                      <motion.div
                        variants={sectionVariants}
                        initial={reduceMotion ? false : "hidden"}
                        whileInView="show"
                        viewport={{ once: true, amount: 0.15 }}
                        className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                      >
                        {group.events.map((e) => (
                          <motion.div key={e.id} variants={cardVariants}>
                            <EventCard event={e} />
                          </motion.div>
                        ))}
                      </motion.div>
                    </section>
                  ))
                )}
              </div>

              {groups.length > 1 && (
                <aside className="hidden lg:block lg:w-44 lg:shrink-0" aria-label="Navegar por mes">
                  <nav className="sticky top-24 flex flex-col gap-1 border-l border-[var(--line)] pl-4">
                    <span className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
                      Ir al mes
                    </span>
                    {groups.map((g) => {
                      const isActive = g.key === activeMonth;
                      return (
                        <button
                          key={g.key}
                          type="button"
                          ref={getDesktopNavRef(g.key)}
                          onClick={() => scrollToMonth(g.key)}
                          aria-current={isActive ? "true" : undefined}
                          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left font-mono text-xs transition-colors hover:bg-[var(--ink)]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] focus-visible:ring-[var(--teal)]"
                          style={{ color: isActive ? "var(--ink)" : "var(--muted)" }}
                        >
                          <span className="relative flex h-1.5 w-1.5 shrink-0">
                            {isActive && (
                              <span
                                className="node-halo absolute inset-0 rounded-full"
                                style={{ backgroundColor: "var(--teal)" }}
                              />
                            )}
                            <span
                              className="absolute inset-0 rounded-full"
                              style={{ backgroundColor: isActive ? "var(--teal)" : "var(--line)" }}
                            />
                          </span>
                          <span className="truncate">{g.label}</span>
                          <span className="ml-auto opacity-50">{g.events.length}</span>
                        </button>
                      );
                    })}
                  </nav>
                </aside>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
};