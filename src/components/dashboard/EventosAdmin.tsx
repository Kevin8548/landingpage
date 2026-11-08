import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FiClock,
  FiMapPin,
  FiFilter,
  FiArrowRight,
  FiArrowLeft,
  FiCalendar,
  FiEdit3,
  FiX,
  FiTrash2,
  FiPlus,
  FiSave,
  FiUpload,
} from "react-icons/fi";
import { CATEGORY_META, CATEGORY_ORDER, type Category, type EventItem } from "../../data/eventos";
import { useEventosStore, type EventTextField } from "../../data/eventosStore";
import { useConfirm } from "../ui/ConfirmDialog";
import PreviewMenu from "../ui/PreviewMenu";
import { showDashboardAlert } from "../../lib/dashboardAlerts";
import DashboardSelect from "./DashboardSelect";

interface MonthGroup {
  key: string;
  label: string;
  year: string;
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

type PickerPosition = { top: number; left: number };
function useInlinePickerPosition(
  open: boolean,
  setOpen: (value: boolean) => void,
  trigger: React.RefObject<HTMLButtonElement | null>,
  menu: React.RefObject<HTMLDivElement | null>,
  width: number,
  height: number,
) {
  const [position, setPosition] = useState<PickerPosition>({ top: 0, left: 0 });
  useEffect(() => {
    if (!open) return;
    const place = () => {
      const rect = trigger.current?.getBoundingClientRect();
      if (!rect) return;
      const left = Math.max(12, Math.min(rect.left, window.innerWidth - width - 12));
      const below = rect.bottom + 8;
      const top = below + height > window.innerHeight - 12
        ? Math.max(12, rect.top - height - 8)
        : below;
      setPosition({ top, left });
    };
    const closeFromOutside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!trigger.current?.contains(target) && !menu.current?.contains(target)) setOpen(false);
    };
    const closeOtherPicker = () => setOpen(false);
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    place();
    document.addEventListener("pointerdown", closeFromOutside, true);
    document.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    window.addEventListener("utt:close-event-picker", closeOtherPicker);
    return () => {
      document.removeEventListener("pointerdown", closeFromOutside, true);
      document.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("utt:close-event-picker", closeOtherPicker);
    };
  }, [height, open, setOpen, trigger, width, menu]);
  return position;
}

const dayNumber = (iso: string) => {
  const d = parseISO(iso);
  return isValidDate(d) ? d.getDate() : 0;
};

const monthShort = (iso: string) => {
  const d = parseISO(iso);
  if (!isValidDate(d)) return "";
  return d.toLocaleDateString("es-MX", { month: "short" }).replace(".", "").toUpperCase();
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
  children: ReactNode;
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
      backgroundColor: active ? `color-mix(in srgb, ${color} 14%, transparent)` : "transparent",
    }}
  >
    {children}
  </button>
);

const InlineDatePicker = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => parseISO(value));
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const position = useInlinePickerPosition(open, setOpen, trigger, menu, 262, 250);
  const first = (new Date(month.getFullYear(), month.getMonth(), 1).getDay() + 6) % 7;
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const today = startOfToday();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const todayIso = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const toggle = () => {
    const wasOpen = open;
    window.dispatchEvent(new Event("utt:close-event-picker"));
    const selected = parseISO(value);
    const firstAllowedMonth = new Date(currentYear, currentMonth, 1);
    setMonth(selected < firstAllowedMonth ? firstAllowedMonth : selected);
    setOpen(!wasOpen);
  };

  return <div className="event-inline-picker">
    <button ref={trigger} type="button" aria-expanded={open} className="event-inline-picker__trigger" onClick={toggle}>
      <FiCalendar size={13}/><span>{fmtDateShort(value)}</span><b>⌄</b>
    </button>
    {open && createPortal(<div ref={menu} className="event-inline-picker__menu event-inline-picker__menu--floating event-inline-calendar" style={{ top: position.top, left: position.left }}>
      <header>
        <button type="button" aria-label="Mes anterior" disabled={month.getFullYear() === currentYear && month.getMonth() <= currentMonth} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>‹</button>
        <strong>{capitalize(month.toLocaleDateString("es-MX", { month: "long" }))} {month.getFullYear()}</strong>
        <button type="button" aria-label="Mes siguiente" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>›</button>
      </header>
      <div className="event-inline-calendar__week">{["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"].map((day) => <span key={day}>{day}</span>)}</div>
      <div className="event-inline-calendar__days">{Array.from({ length: first + days }, (_, index) => {
        if (index < first) return <i key={`empty-${index}`}/>;
        const day = index - first + 1;
        const next = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const disabled = next < todayIso;
        return <button type="button" disabled={disabled} className={next === value && !disabled ? "is-selected" : ""} key={next} onClick={() => { onChange(next); setOpen(false); }}>{day}</button>;
      })}</div>
    </div>, document.body)}
  </div>;
};

const InlineTimePicker = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const position = useInlinePickerPosition(open, setOpen, trigger, menu, 188, 220);
  const options = Array.from({ length: 24 }, (_, hour) => ["00", "30"].map((minute) => `${String(hour).padStart(2,"0")}:${minute}`)).flat();
  const toggle = () => { const wasOpen = open; window.dispatchEvent(new Event("utt:close-event-picker")); setOpen(!wasOpen); };
  return <div className="event-inline-picker"><button ref={trigger} type="button" aria-expanded={open} className="event-inline-picker__trigger" onClick={toggle}><FiClock size={13} /><span>{value || "--:--"}</span><b>⌄</b></button>{open && createPortal(<div ref={menu} className="event-inline-picker__menu event-inline-picker__menu--floating event-inline-time-menu" style={{ top: position.top, left: position.left }}>{options.map((time) => <button type="button" className={time === value ? "is-selected" : ""} key={time} onClick={() => { onChange(time); setOpen(false); }}>{time}</button>)}</div>, document.body)}</div>;
};

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
  editMode: boolean;
  onUpdateField: (id: string, field: EventTextField, value: string) => void;
  onConfirmDate: (id: string, value: string) => void;
  onUpdateCategory: (id: string, category: Category) => void;
  onImageUpload: (id: string, file: File) => void;
  onImageRemove: (id: string) => void;
  onDelete: (id: string) => void;
  highlighted?: boolean;
}

const EventCard = ({
  event,
  editMode,
  onUpdateField,
  onConfirmDate,
  onUpdateCategory,
  onImageUpload,
  onImageRemove,
  onDelete,
  highlighted = false,
}: EventCardProps) => {
  const meta = CATEGORY_META[event.category];
  const Icon = meta.icon;
  const days = daysUntil(event.date);
  const isPast = days < 0;

  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);

  const [localDate, setLocalDate] = useState(event.date);
  const [isDateFocused, setIsDateFocused] = useState(false);

  useEffect(() => {
    if (!isDateFocused) setLocalDate(event.date);
  }, [event.date, isDateFocused]);

  const openPicker = (ref: typeof dateInputRef) => {
    const input = ref.current;
    if (!input) return;
    try {
      input.showPicker?.();
    } catch {
      input.focus();
    }
  };

  return (
    <article
      id={`evento-${event.id}`}
      className={`event-card-glow group relative flex h-full scroll-mt-28 flex-col overflow-hidden rounded-2xl border bg-[var(--glass)] shadow-sm transition-transform duration-300 hover:-translate-y-1 ${
        isPast && !editMode ? "opacity-55" : ""
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
          style={{ backgroundColor: "color-mix(in srgb, var(--bg) 78%, transparent)", border: "1px solid var(--line)" }}
        >
          <span className="font-display text-lg font-bold leading-none text-[var(--ink)]">{dayNumber(event.date)}</span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]">{monthShort(event.date)}</span>
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

        {editMode && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-[var(--bg)]/60 backdrop-blur-sm">
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-dashed border-[var(--line)] bg-[var(--bg)]/70 px-3 py-1.5 font-mono text-[11px] text-[var(--ink)] transition-colors hover:border-[var(--orange)] hover:text-[var(--orange)]">
              <FiUpload className="h-3 w-3" aria-hidden="true" />
              {event.image ? "Cambiar imagen" : "Subir imagen"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onImageUpload(event.id, file);
                }}
              />
            </label>
            {event.image && (
              <button
                type="button"
                onClick={() => onImageRemove(event.id)}
                className="font-mono text-[10px] text-[var(--muted)] hover:text-red-400"
              >
                Quitar imagen
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 p-5">
        {editMode ? (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <InlineDatePicker value={event.date} onChange={(value) => onConfirmDate(event.id, value)} />

              <InlineTimePicker value={event.time} onChange={(value) => onUpdateField(event.id, "time", value)} />

              <DashboardSelect
                value={event.category}
                onChange={(value) => onUpdateCategory(event.id, value as Category)}
                placeholder="Tipo de evento"
                ariaLabel="Tipo de evento"
                options={CATEGORY_ORDER.map((category) => ({
                  value: category,
                  label: CATEGORY_META[category].label,
                }))}
              />
              <button
                type="button"
                onClick={() => onDelete(event.id)}
                aria-label="Eliminar evento"
                className="ml-auto rounded-md p-1.5 text-[var(--muted)] transition-colors hover:bg-[var(--ink)]/5 hover:text-red-400"
              >
                <FiTrash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            <input
              type="text"
              value={event.title}
              onChange={(e) => onUpdateField(event.id, "title", e.target.value)}
              placeholder="Título del evento"
              className="font-display text-lg font-bold leading-snug text-[var(--ink)] bg-transparent border-b border-dashed border-[var(--line)] pb-1 focus:outline-none focus:border-[var(--orange)]"
            />

            <textarea
              value={event.description}
              onChange={(e) => onUpdateField(event.id, "description", e.target.value)}
              rows={2}
              placeholder="Descripción"
              className="resize-y rounded-lg border border-dashed border-[var(--line)] bg-transparent p-2 text-sm leading-relaxed text-[var(--muted)] focus:outline-none focus:border-[var(--orange)]/50"
            />

            <input
              type="text"
              value={event.location}
              onChange={(e) => onUpdateField(event.id, "location", e.target.value)}
              placeholder="Ubicación"
              className="font-mono text-[11px] text-[var(--muted)] bg-transparent border-b border-dashed border-[var(--line)] pb-1 focus:outline-none focus:border-[var(--orange)]"
            />
          </div>
        ) : (
          <>
            <span
              className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-wide"
              style={{ color: meta.color }}
            >
              <FiClock className="h-3 w-3 shrink-0" aria-hidden="true" />
              {fmtDateShort(event.date)} · {event.time} hrs
            </span>

            <h3 className="font-display text-lg font-bold leading-snug text-[var(--ink)]">{event.title}</h3>

            <p className="line-clamp-2 text-sm text-[var(--muted)]">{event.description}</p>
          </>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-[var(--line)] pt-2.5">
          {!editMode && (
            <span className="inline-flex min-w-0 items-center gap-1 truncate font-mono text-[11px] text-[var(--muted)]/80">
              <FiMapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{event.location}</span>
            </span>
          )}
          <span
            className={`shrink-0 font-mono text-[10px] uppercase tracking-wide ${editMode ? "ml-auto" : ""}`}
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
            <span className="font-mono text-sm uppercase tracking-widest" style={{ color: meta.color }}>
              {monthShort(event.date)}
            </span>
            <span className="font-mono text-[11px] text-[var(--muted)]">{event.date.slice(0, 4)}</span>
          </div>
        </div>

        <div className="h-px w-full bg-[var(--line)] sm:h-16 sm:w-px" aria-hidden="true" />

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="node-halo absolute inset-0 rounded-full" style={{ backgroundColor: meta.color }} />
              <span className="absolute inset-[2.5px] rounded-full" style={{ backgroundColor: meta.color }} />
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

          <h2 className="font-display text-2xl font-bold leading-snug text-[var(--ink)] sm:text-3xl">{event.title}</h2>

          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">{event.description}</p>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
            <span className="inline-flex items-center gap-1.5 font-mono text-xs text-[var(--muted)]">
              <FiClock className="h-3.5 w-3.5" aria-hidden="true" />
              {weekdayLabel(event.date)} · {event.time} hrs
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono text-xs text-[var(--muted)]">
              <FiMapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {event.location}
            </span>
            <span className="font-mono text-xs font-semibold uppercase tracking-wide" style={{ color: meta.color }}>
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

export default function EventosAdmin({ allowEditing = true }: { allowEditing?: boolean }) {
  const confirm = useConfirm();
  const reduceMotion = !!useReducedMotion();

  const {
    eventItems,
    eventsLoadError,
    addEvent: storeAddEvent,
    updateEventField,
    updateEventCategory,
    updateEventImage,
    deleteEvent: storeDeleteEvent,
    saveEvent,
    saveEvents,
    saveEventImage,
    reloadEvents,
  } = useEventosStore();

  const [editMode, setEditMode] = useState(false);
  const [dirtyEventIds, setDirtyEventIds] = useState<Set<string>>(new Set());
  const [isSavingChanges, setIsSavingChanges] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [pendingScroll, setPendingScroll] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [activeMonth, setActiveMonth] = useState<string | null>(null);

  const { elements: sectionRefs, getRef: getSectionRef } = useKeyedRefs<HTMLElement>();
  const { elements: mobileNavRefs, getRef: getMobileNavRef } = useKeyedRefs<HTMLButtonElement>();
  const { elements: desktopNavRefs, getRef: getDesktopNavRef } = useKeyedRefs<HTMLButtonElement>();

  const sorted = useMemo(() => [...eventItems].sort((a, b) => a.date.localeCompare(b.date)), [eventItems]);
  const upcoming = useMemo(() => sorted.filter((e) => daysUntil(e.date) >= 0), [sorted]);
  // El tablón es una agenda completa: no se limita al siguiente evento.
  const boardEvents = sorted;
  const nextEvent = upcoming[0];

  const counts = useMemo(() => {
    const map: Partial<Record<Category, number>> = {};
    sorted.forEach((e) => {
      map[e.category] = (map[e.category] ?? 0) + 1;
    });
    return map;
  }, [sorted]);

  const filtered = useMemo(
    () => (activeCategory && !editMode ? sorted.filter((e) => e.category === activeCategory) : sorted),
    [sorted, activeCategory, editMode]
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

  useEffect(() => {
    if (!activeMonth) return;
    const opts: ScrollIntoViewOptions = { behavior: reduceMotion ? "auto" : "smooth", inline: "center", block: "nearest" };
    mobileNavRefs.current.get(activeMonth)?.scrollIntoView(opts);
    desktopNavRefs.current.get(activeMonth)?.scrollIntoView(opts);
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
        el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center", inline: "nearest" });
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

  const jumpToEvent = (id: string, date?: string) => {
    setActiveCategory(null);
    const resolvedDate = date ?? eventItems.find((e) => e.id === id)?.date;
    if (resolvedDate) setActiveMonth(monthKey(resolvedDate));
    setPendingScroll(id);
  };

  useEffect(() => {
    if (!highlightedId) return;
    const timeout = setTimeout(() => setHighlightedId(null), 1600);
    return () => clearTimeout(timeout);
  }, [highlightedId]);

  const scrollToMonth = (key: string) => {
    sectionRefs.current.get(key)?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  };

  const handleAddEvent = async () => {
    try {
      const created = await storeAddEvent();
      jumpToEvent(created.id, created.date);
      setHighlightedId(created.id);
    } catch (err) {
      console.error("No se pudo crear el evento:", err);
      // aquí igual entraría un toast de error si tienen uno
    }
  };

  const handleDeleteEvent = async (id: string) => {
    const ok = await confirm({
      title: "¿Eliminar este evento?",
      description: "Esta acción no se puede deshacer.",
      confirmLabel: "Eliminar",
      destructive: true,
    });
    if (!ok) return;
    storeDeleteEvent(id);
    setPendingScroll((prev) => (prev === id ? null : prev));
    setHighlightedId((prev) => (prev === id ? null : prev));
  };

  const handleConfirmDate = (id: string, value: string) => {
    updateEventField(id, "date", value);
    setDirtyEventIds((current) => new Set(current).add(id));
    setActiveMonth(monthKey(value));
    setPendingScroll(id);
    setHighlightedId(id);
  };

  const handleCategoryChange = (id: string, category: Category) => {
    updateEventCategory(id, category);
    setDirtyEventIds((current) => new Set(current).add(id));
  };

  const handleUpdateField = (id: string, field: EventTextField, value: string) => {
    updateEventField(id, field, value);
    setDirtyEventIds((current) => new Set(current).add(id));
  };

  const savePendingChanges = async () => {
    const ids = [...dirtyEventIds];
    if (!ids.length) return;
    setIsSavingChanges(true);
    try {
      await saveEvents(ids);
      setDirtyEventIds(new Set());
      void showDashboardAlert({ icon: "success", title: "Cambios guardados", timer: 1500, showConfirmButton: false });
    } catch (error) {
      console.error("No se pudieron guardar los cambios:", error);
      void showDashboardAlert({ icon: "error", title: "No fue posible guardar los cambios", text: error instanceof Error ? error.message : "Inténtalo nuevamente." });
    } finally {
      setIsSavingChanges(false);
    }
  };

  const leaveEditMode = async () => {
    if (dirtyEventIds.size) {
      const discard = await confirm({
        title: "Hay cambios sin guardar",
        description: "Si sales ahora, esos cambios se descartarán.",
        confirmLabel: "Salir sin guardar",
        cancelLabel: "Seguir editando",
        destructive: true,
      });
      if (!discard) return;
      const refreshed = await reloadEvents();
      if (!refreshed) {
        void showDashboardAlert({ icon: "error", title: "No se pudo actualizar la lista", text: "Conservamos los datos actuales. Reintenta cuando vuelva la conexión antes de salir del modo de edición." });
        return;
      }
      setDirtyEventIds(new Set());
    }
    setEditMode(false);
  };

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleImageUpload = async (id: string, file: File) => {
    const dataUrl = await fileToDataUrl(file);
    updateEventImage(id, dataUrl); // preview inmediato mientras sube
    await saveEventImage(id, dataUrl);
  };

  const handleImageRemove = async (id: string) => {
    updateEventImage(id, undefined);
    await saveEventImage(id, undefined, true);
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

        .date-time-input { color-scheme: dark; }
        .date-time-input::-webkit-calendar-picker-indicator {
          cursor: pointer;
          border-radius: 4px;
          padding: 2px;
          margin-left: 2px;
          opacity: 0.8;
          transition: opacity 0.15s ease;
        }
        .date-time-input::-webkit-calendar-picker-indicator:hover { opacity: 1; }

        @keyframes event-highlight-pulse {
          0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--orange) 55%, transparent); }
          100% { box-shadow: 0 0 0 12px color-mix(in srgb, var(--orange) 0%, transparent); }
        }
        .event-card-highlight { animation: event-highlight-pulse 1s ease-out 2; }
      `}</style>

      {eventsLoadError && (
        <div className="dashboard-data-error mx-auto mt-5 w-[min(100%-2rem,1200px)]" role="alert">
          <div>
            <strong>No se pudo actualizar la lista de eventos</strong>
            <p>{eventsLoadError}</p>
          </div>
          <button type="button" onClick={() => void reloadEvents()}>Reintentar</button>
        </div>
      )}

      {editMode && (
        <div className="sticky top-0 z-40 bg-[var(--orange)] text-[var(--bg)] text-center text-[11px] font-mono uppercase tracking-wider py-2 px-4">
          Modo edición activo — guarda tus cambios cuando termines
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 py-32 sm:px-8">
          <EmptyBoard
            title="El tablón está vacío"
            message="Todavía no hay eventos publicados. Vuelve pronto — aquí aparecerá el próximo en cuanto se agregue."
          />
          {editMode && (
            <button
              type="button"
              onClick={handleAddEvent}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--orange)] px-5 py-2.5 font-mono text-xs uppercase tracking-wide text-[var(--bg)]"
            >
              <FiPlus className="h-4 w-4" /> Agregar el primer evento
            </button>
          )}
        </div>
      ) : (
        <>
          <section className="relative px-6 pt-16 pb-8 sm:px-8 sm:pt-20">
            <div className="mx-auto max-w-4xl">
              <div className="mb-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--muted)]">
                  <span className="h-px w-6 bg-[var(--line)]" />
                  Calendario del campus{allowEditing ? " · Admin" : ""}
                </div>
                {allowEditing && (
                  <div className="events-admin-preview-actions">
                    <Link to="/dashboard" className="events-dashboard-back">
                      <FiArrowLeft aria-hidden="true" />
                      Volver al dashboard
                    </Link>
                    <PreviewMenu />
                  </div>
                )}
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
                <div className="flex flex-col gap-3 sm:items-end">
                  <p className="max-w-sm text-sm leading-relaxed text-[var(--muted)] sm:text-right">
                    Conferencias, torneos, hackathons y actividades estudiantiles, agrupadas por mes.
                  </p>
                </div>
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
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">En el tablón</span>
                  <span className="ml-auto font-mono text-[10px] text-[var(--muted)]/60">
                    {upcoming.length} próximo{upcoming.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="relative h-40 overflow-hidden">
                  <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-6 bg-gradient-to-b from-[var(--bg)] to-transparent" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-6 bg-gradient-to-t from-[var(--bg)] to-transparent" />
                  <div
                    className={reduceMotion ? "" : "animate-marquee-up hover:[animation-play-state:paused]"}
                    style={reduceMotion ? undefined : { animationDuration: `${Math.max(boardEvents.length, 1) * 3.2}s` }}
                  >
                    {(reduceMotion ? boardEvents : [...boardEvents, ...boardEvents]).map((e, index) => {
                      const meta = CATEGORY_META[e.category];
                      return (
                        <button
                          key={`${e.id}-${index}`}
                          type="button"
                          onClick={() => jumpToEvent(e.id, e.date)}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[var(--ink)]/5 focus-visible:outline-none focus-visible:bg-[var(--ink)]/5"
                        >
                          <span className="w-14 shrink-0 font-mono text-[11px]" style={{ color: meta.color }}>
                            {fmtDateShort(e.date)}
                          </span>
                          <span className="flex-1 truncate text-sm text-[var(--ink)]">{e.title}</span>
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
                  {editMode && (
                    <span className="normal-case tracking-normal text-[var(--muted)]/60">
                      · desactivado en modo edición, se muestra todo
                    </span>
                  )}
                </div>
                {editMode && (
                  <button
                    type="button"
                    onClick={handleAddEvent}
                    className="inline-flex items-center gap-1.5 rounded-full border-2 border-dashed border-[var(--line)] px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-[var(--muted)] transition-colors hover:border-[var(--orange)]/50 hover:text-[var(--orange)]"
                  >
                    <FiPlus className="h-3 w-3" /> Agregar evento
                  </button>
                )}
              </div>
              <div
                className={`flex flex-wrap gap-2 transition-opacity ${editMode ? "pointer-events-none opacity-40" : ""}`}
                aria-hidden={editMode || undefined}
              >
                <FilterPill active={activeCategory === null} color="var(--ink)" onClick={() => setActiveCategory(null)}>
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
                        backgroundColor: isActive ? "color-mix(in srgb, var(--teal) 14%, transparent)" : "transparent",
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
                        <h2 className="font-display text-xl font-bold text-[var(--ink)] sm:text-2xl">{group.label}</h2>
                        <span className="font-mono text-xs text-[var(--muted)]">{group.year}</span>
                        <span className="ml-auto font-mono text-[11px] uppercase tracking-wide text-[var(--muted)]">
                          {group.events.length} evento{group.events.length !== 1 ? "s" : ""}
                        </span>
                      </div>

                      <motion.div
                        variants={sectionVariants}
                        initial={reduceMotion || editMode ? false : "hidden"}
                        animate="show"
                        className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                      >
                        {group.events.map((e) => (
                          <motion.div key={e.id} variants={cardVariants}>
                            <EventCard
                              event={e}
                              editMode={editMode}
                              onUpdateField={handleUpdateField}
                              onConfirmDate={handleConfirmDate}
                              onUpdateCategory={handleCategoryChange}
                              onImageUpload={handleImageUpload}
                              onImageRemove={handleImageRemove}
                              onDelete={handleDeleteEvent}
                              highlighted={e.id === highlightedId}
                            />
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
                    <span className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Ir al mes</span>
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
                              <span className="node-halo absolute inset-0 rounded-full" style={{ backgroundColor: "var(--teal)" }} />
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

      {allowEditing && <div className="fixed bottom-6 right-4 z-50 flex max-w-[calc(100vw-2rem)] flex-wrap justify-end gap-3 pointer-events-none sm:right-6">
        {editMode && dirtyEventIds.size > 0 && <button
          type="button"
          onClick={() => void savePendingChanges()}
          disabled={isSavingChanges}
          className="pointer-events-auto flex items-center gap-2 rounded-full bg-[var(--green)] px-5 py-3 font-mono text-xs font-medium uppercase tracking-wider text-[var(--bg)] shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiSave className="h-4 w-4" />
          {isSavingChanges ? "Guardando..." : `Guardar cambios (${dirtyEventIds.size})`}
        </button>}
        <button
          type="button"
          onClick={() => { if (editMode) void leaveEditMode(); else setEditMode(true); }}
          className={`pointer-events-auto flex items-center gap-2 px-5 py-3 rounded-full font-mono text-xs uppercase tracking-wider font-medium shadow-lg transition-colors ${
            editMode ? "bg-[var(--orange)] text-[var(--bg)]" : "bg-[var(--ink)] text-[var(--bg)] hover:bg-[var(--green)]"
          }`}
        >
          {editMode ? <FiX className="w-4 h-4" /> : <FiEdit3 className="w-4 h-4" />}
          {editMode ? "Salir de edición" : "Editar página"}
        </button>
      </div>}
    </div>
  );
}
