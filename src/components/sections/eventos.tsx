import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { IconType } from "react-icons";
import {
  FiBookOpen,
  FiMusic,
  FiUsers,
  FiClock,
  FiMapPin,
  FiFilter,
  FiArrowRight,
  FiCalendar,
  FiEdit3,
  FiX,
  FiTrash2,
  FiPlus,
  FiUpload,
} from "react-icons/fi";
import { useConfirm } from "../ui/ConfirmDialog";

type Category = "academico" | "cultural" | "comunidad";

interface EventItem {
  id: string;
  title: string;
  date: string; // ISO yyyy-mm-dd
  time: string; // "09:00"
  location: string;
  category: Category;
  description: string;
  image?: string; // URL opcional. Sin imagen, se usa un fondo generado por categoría.
}

interface CategoryMeta {
  label: string;
  icon: IconType;
  color: string; // referencia a variable CSS del tema (index.css)
}

interface MonthGroup {
  key: string; // "2026-08"
  label: string; // "Agosto"
  year: string; // "2026"
  events: EventItem[];
}

// Contenido semilla. Una vez que exista backend, esto puede pasar a ser el
// estado inicial que se usa mientras carga la data real. No hace falta tocar
// nada más al agregar eventos: se agrupan solos por mes y aparecen
// automáticamente en la navegación (lateral en desktop, en pastillas arriba
// en móvil), así que la vista escala sin volverse tediosa.
const events: EventItem[] = [
  {
    id: "hackathon-tic",
    title: "Hackathon TIC 2026",
    date: "2026-08-22",
    time: "09:00",
    location: "Explanada principal",
    category: "academico",
    description:
      "24 horas para construir un proyecto desde cero. Equipos de hasta 4 integrantes, mentores en sitio y premios para los tres primeros lugares.",
  },
  {
    id: "semana-ciencia",
    title: "Semana de la Ciencia y la Tecnología",
    date: "2026-09-08",
    time: "10:00",
    location: "Auditorio central",
    category: "academico",
    description:
      "Cinco días de conferencias, talleres y demostraciones con investigadores invitados de distintas industrias.",
  },
  {
    id: "torneo-voleibol",
    title: "Torneo Intramuros de Voleibol",
    date: "2026-09-16",
    time: "12:00",
    location: "Canchas deportivas",
    category: "cultural",
    description:
      "Fase de grupos entre todas las carreras. Inscribe a tu equipo en Servicios Escolares antes del cierre de convocatoria.",
  },
  {
    id: "noche-talentos",
    title: "Noche de Talentos UTT",
    date: "2026-09-25",
    time: "18:00",
    location: "Explanada principal",
    category: "cultural",
    description:
      "Música, danza y stand-up hecho por estudiantes. Convocatoria para participar abierta dos semanas antes.",
  },
  {
    id: "feria-ingenierias",
    title: "Feria de Ingenierías y Vinculación Empresarial",
    date: "2026-10-07",
    time: "09:30",
    location: "Domo institucional",
    category: "academico",
    description:
      "Empresas del corredor industrial de Tlaxcala presentan vacantes, retos y proyectos de residencia profesional.",
  },
  {
    id: "conferencia-ia",
    title: "IA aplicada a la industria",
    date: "2026-10-15",
    time: "17:00",
    location: "Sala audiovisual",
    category: "academico",
    description:
      "Conferencia abierta sobre casos reales de automatización e inteligencia artificial en manufactura local.",
  },
  {
    id: "brigada-comunitaria",
    title: "Brigada de Servicio Social Comunitario",
    date: "2026-10-24",
    time: "08:00",
    location: "Salida desde el campus",
    category: "comunidad",
    description:
      "Jornada de apoyo con una comunidad vecina: talleres para niños y mantenimiento de espacios públicos.",
  },
  {
    id: "dia-muertos",
    title: "Festival de Día de Muertos",
    date: "2026-11-02",
    time: "11:00",
    location: "Plaza central del campus",
    category: "cultural",
    description:
      "Concurso de ofrendas por carrera, comida tradicional y proyección de cortometrajes al caer la tarde.",
  },
  {
    id: "graduacion-2026",
    title: "Ceremonia de Graduación — Generación 2026",
    date: "2026-12-11",
    time: "10:00",
    location: "Auditorio central",
    category: "comunidad",
    description:
      "Entrega de reconocimientos para egresados de las tres ingenierías. Cupo limitado por invitación.",
  },
];

const CATEGORY_META: Record<Category, CategoryMeta> = {
  academico: { label: "Académico", icon: FiBookOpen, color: "var(--green)" },
  cultural: { label: "Cultural", icon: FiMusic, color: "var(--orange)" },
  comunidad: { label: "Comunidad", icon: FiUsers, color: "var(--teal)" },
};

const CATEGORY_ORDER: Category[] = ["academico", "cultural", "comunidad"];

const genId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// ---------- utilidades de fecha ----------

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const todayISO = () => new Date().toISOString().slice(0, 10);

const parseISO = (iso: string) => new Date(`${iso}T00:00:00`);

// Los inputs nativos <input type="date"> disparan onChange en cada
// segmento que se teclea (día/mes/año), no solo cuando la fecha ya está
// completa. Mientras se edita, el valor puede llegar vacío o incompleto
// por un instante. new Date(...) no truena con eso, pero
// .toLocaleDateString() SÍ truena con un RangeError si la fecha es
// inválida — y eso es lo que rompía el render y hacía "desaparecer" la
// tarjeta a medio editar. isValidDate() nos deja detectar esos casos y
// las funciones de abajo devuelven un valor de reserva en vez de crashear.
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

// Pequeño helper para no repetir tres veces el mismo patrón de "un ref por
// cada elemento de una lista dinámica" (secciones de mes, pastillas de
// navegación en móvil, navegación lateral en desktop).
//
// Antes, cada uno se resolvía con una función tipo `(key) => (el) => {...}`
// creada de nuevo en cada render. React ve una identidad de función
// distinta en cada renderizado y hace un detach + attach del ref aunque la
// clave no haya cambiado. Eso disparaba de más al IntersectionObserver del
// scrollspy (su efecto depende de la lista de refs) justo en los momentos
// en que más se necesitaba estabilidad: al mover un evento de un mes a
// otro durante la edición. Cacheando la función de callback por clave, el
// ref real del DOM solo se vuelve a adjuntar cuando el elemento en
// cuestión realmente aparece o desaparece.
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

// Estado vacío con la misma identidad visual del mural: en vez de un texto
// suelto, es un espacio del tablón sin nada pegado todavía (borde
// punteado, como el hueco de una tachuela). Se reutiliza tanto para "no
// hay eventos publicados" como para "ningún evento coincide con el filtro".
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

type EventTextField = "title" | "description" | "location" | "date" | "time";

interface EventCardProps {
  event: EventItem;
  editMode: boolean;
  onUpdateField: (id: string, field: EventTextField, value: string) => void;
  onUpdateCategory: (id: string, category: Category) => void;
  onUpdateImage: (id: string, image: string | undefined) => void;
  onDelete: (id: string) => void;
  highlighted?: boolean;
}

// Tarjeta tipo "flyer": imagen/franja visual arriba con fecha y categoría
// sobrepuestas, y el texto abajo con la fecha integrada al contenido.
// El filo superior y el glow al hacer hover usan siempre los colores
// institucionales (verde/naranja), independientes de la categoría.
// En modo edición, el bloque de texto se cambia por campos editables y la
// imagen recibe una cubierta con el control de subida — el resto (badges
// de fecha/categoría) sigue leyendo el estado en vivo, así que refleja los
// cambios al instante.
const EventCard = ({
  event,
  editMode,
  onUpdateField,
  onUpdateCategory,
  onUpdateImage,
  onDelete,
  highlighted = false,
}: EventCardProps) => {
  const meta = CATEGORY_META[event.category];
  const Icon = meta.icon;
  const days = daysUntil(event.date);
  const isPast = days < 0;

  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);

  // Abre el selector nativo del navegador (calendario / reloj) al hacer
  // click en cualquier parte de la casilla, no solo en el ícono diminuto
  // que dibuja el navegador. showPicker() no existe en todos los
  // navegadores todavía, así que si falla simplemente se deja el foco en
  // el campo (el usuario puede escribir la fecha/hora a mano).
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
      {/* Filo institucional (verde → naranja) + pin, guiño al mural de anuncios */}
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

      {/* Visual */}
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

        {/* Badge de fecha */}
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

        {/* Categoría */}
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

        {/* Cubierta de edición de imagen */}
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
                  if (file) onUpdateImage(event.id, URL.createObjectURL(file));
                }}
              />
            </label>
            {event.image && (
              <button
                type="button"
                onClick={() => onUpdateImage(event.id, undefined)}
                className="font-mono text-[10px] text-[var(--muted)] hover:text-red-400"
              >
                Quitar imagen
              </button>
            )}
          </div>
        )}
      </div>

      {/* Texto */}
      <div className="flex min-w-0 flex-1 flex-col gap-2 p-5">
        {editMode ? (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {/* Casilla de fecha: ícono de calendario en un cuadrito propio +
                  input nativo. Al hacer click en cualquier parte de la
                  casilla se abre el selector de fecha del navegador. */}
              <div
                onClick={() => openPicker(dateInputRef)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-dashed border-[var(--line)] bg-transparent px-2 py-1 transition-colors hover:border-[var(--orange)]/60 focus-within:border-[var(--orange)]"
              >
                <FiCalendar
                  className="h-3 w-3 shrink-0 text-[var(--muted)]"
                  aria-hidden="true"
                />
                <input
                  ref={dateInputRef}
                  type="date"
                  value={event.date}
                  onChange={(e) => onUpdateField(event.id, "date", e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="date-time-input w-[6.4rem] bg-transparent font-mono text-[11px] text-[var(--ink)] focus:outline-none"
                />
              </div>

              {/* Casilla de hora: mismo patrón, con ícono de reloj. */}
              <div
                onClick={() => openPicker(timeInputRef)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-dashed border-[var(--line)] bg-transparent px-2 py-1 transition-colors hover:border-[var(--orange)]/60 focus-within:border-[var(--orange)]"
              >
                <FiClock
                  className="h-3 w-3 shrink-0 text-[var(--muted)]"
                  aria-hidden="true"
                />
                <input
                  ref={timeInputRef}
                  type="time"
                  value={event.time}
                  onChange={(e) => onUpdateField(event.id, "time", e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="date-time-input w-[4.4rem] bg-transparent font-mono text-[11px] text-[var(--ink)] focus:outline-none"
                />
              </div>

              <select
                value={event.category}
                onChange={(e) => onUpdateCategory(event.id, e.target.value as Category)}
                className="rounded-md border border-dashed border-[var(--line)] bg-[var(--bg)] px-1.5 py-1 font-mono text-[10px] uppercase tracking-wide text-[var(--ink)] focus:outline-none focus:border-[var(--orange)]"
              >
                {CATEGORY_ORDER.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_META[cat].label}
                  </option>
                ))}
              </select>
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

            <h3 className="font-display text-lg font-bold leading-snug text-[var(--ink)]">
              {event.title}
            </h3>

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
            className={`shrink-0 font-mono text-[10px] uppercase tracking-wide ${
              editMode ? "ml-auto" : ""
            }`}
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

// Bloque destacado del próximo evento: es el primer contacto visual de la
// página (el "thesis" de la vista), separado del resto del mural. El glow
// y el fondo radial usan los colores institucionales (verde/naranja).
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
        {/* Fecha grande */}
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

        {/* Contenido */}
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
  const confirm = useConfirm();
  const reduceMotion = !!useReducedMotion();

  // ---------- Modo edición ----------
  const [editMode, setEditMode] = useState(false);

  // ---------- Eventos ----------
  const [eventItems, setEventItems] = useState<EventItem[]>(events);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [pendingScroll, setPendingScroll] = useState<string | null>(null);
  // Tarjeta que se acaba de agregar o mover de fecha/categoría, para
  // resaltarla un instante y que quede claro que sí se agregó / sí se
  // movió, en vez de que parezca que se perdió en el tablón.
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [activeMonth, setActiveMonth] = useState<string | null>(null);

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

  // En modo edición ignoramos el filtro de categoría activo: si alguien
  // cambia la categoría de un evento (o edita cualquier otro campo)
  // mientras el filtro "Académico" está seleccionado, por ejemplo, no
  // queremos que la tarjeta desaparezca de la vista solo porque ya no
  // coincide con ese filtro. El filtro sigue funcionando normalmente en
  // la vista pública (fuera de modo edición).
  const filtered = useMemo(
    () => (activeCategory && !editMode ? sorted.filter((e) => e.category === activeCategory) : sorted),
    [sorted, activeCategory, editMode]
  );

  // Agrupar por mes es lo que reemplaza el scroll horizontal infinito: en
  // vez de arrastrar tarjeta por tarjeta, se navega por mes (rail en
  // desktop, pastillas en móvil) y dentro de cada mes el scroll vertical es
  // corto y predecible sin importar cuántos eventos se agreguen.
  const groups = useMemo<MonthGroup[]>(() => {
    const map = new Map<string, MonthGroup>();
    filtered.forEach((e) => {
      const key = monthKey(e.date);
      if (!map.has(key)) {
        map.set(key, { key, label: monthLabel(e.date), year: e.date.slice(0, 4), events: [] });
      }
      map.get(key)!.events.push(e);
    });
    // `filtered` ya viene ordenado por fecha (hereda el orden de `sorted`),
    // así que en la práctica el Map ya inserta las claves en orden
    // cronológico. Lo ordenamos de forma explícita de todas formas: así,
    // sin importar cómo se recalculen los grupos, un evento nuevo o
    // recién editado con una fecha muy temprana (un mes que todavía no
    // existía) siempre termina ubicado cronológicamente — o sea, a la
    // izquierda si es el mes más próximo — en vez de depender de un
    // detalle de implementación del Map.
    return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
  }, [filtered]);

  // Mantiene un mes activo válido cuando cambia el filtro.
  useEffect(() => {
    setActiveMonth((prev) => {
      if (groups.length === 0) return null;
      return prev && groups.some((g) => g.key === prev) ? prev : groups[0].key;
    });
  }, [groups]);

  // Cuando el mes activo cambia — por scroll normal, por click en la
  // navegación, o porque se acaba de agregar/editar un evento hacia un mes
  // que antes no aparecía en pantalla — nos aseguramos de que su
  // pastilla/entrada de navegación quede visible. Sin esto, un mes nuevo
  // podía terminar seleccionado pero fuera de cuadro en el riel horizontal
  // de pastillas (por ejemplo a la izquierda de lo que ya se veía, si el
  // nuevo evento es más temprano que los meses visibles), y no había
  // ninguna pista visual de que el mes había cambiado.
  useEffect(() => {
    if (!activeMonth) return;
    const opts: ScrollIntoViewOptions = {
      behavior: reduceMotion ? "auto" : "smooth",
      inline: "center",
      block: "nearest",
    };
    mobileNavRefs.current.get(activeMonth)?.scrollIntoView(opts);
    desktopNavRefs.current.get(activeMonth)?.scrollIntoView(opts);
  }, [activeMonth, reduceMotion, mobileNavRefs, desktopNavRefs]);

  // Resalta el mes visible mientras se hace scroll (scrollspy) para que la
  // navegación lateral / de pastillas siga el contexto real de la pantalla.
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

  // Salta al evento pendiente (por ejemplo, uno recién agregado). Usamos
  // requestAnimationFrame en lugar de un solo intento inmediato: justo
  // después de agregar un evento nuevo, React todavía puede estar aplicando
  // los cambios de estado relacionados (quitar el filtro activo, crear el
  // grupo de mes si no existía) y el nodo con ese id puede no estar en el
  // DOM en el primer frame. Reintentar unos cuantos frames evita que el
  // scroll "no jale" de forma intermitente.
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
        // Se agotaron los intentos; no dejamos pendingScroll pegado.
        setPendingScroll(null);
      }
    };

    rafId = requestAnimationFrame(tryScroll);
    return () => cancelAnimationFrame(rafId);
  }, [pendingScroll, activeCategory, reduceMotion]);

  // Salta a un evento y sincroniza de inmediato la navegación por mes con
  // su fecha real, en vez de esperar a que el scrollspy la detecte solo.
  // Si ya se conoce la fecha (por ejemplo, se acaba de crear el evento y
  // el estado todavía no se actualiza) se puede pasar explícitamente;
  // si no, se busca en los eventos actuales como respaldo.
  const jumpToEvent = (id: string, date?: string) => {
    setActiveCategory(null);
    const resolvedDate = date ?? eventItems.find((e) => e.id === id)?.date;
    if (resolvedDate) setActiveMonth(monthKey(resolvedDate));
    setPendingScroll(id);
  };

  // El resalte se apaga solo después de un momento.
  useEffect(() => {
    if (!highlightedId) return;
    const timeout = setTimeout(() => setHighlightedId(null), 1600);
    return () => clearTimeout(timeout);
  }, [highlightedId]);

  const scrollToMonth = (key: string) => {
    sectionRefs.current
      .get(key)
      ?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  };

  // ---------- CRUD de eventos ----------
  const updateEventField = (id: string, field: EventTextField, value: string) => {
    if (field === "date") {
      // El <input type="date"> dispara onChange por cada segmento que se
      // teclea (día/mes/año), incluso antes de que la fecha esté completa
      // — en esos momentos el valor llega vacío. Si lo guardáramos tal
      // cual, el evento se movía a un grupo "sin fecha" a medio teclear y
      // rompía el render. Ignoramos esos valores intermedios y solo
      // confirmamos el cambio con una fecha completa y válida.
      if (!value || Number.isNaN(parseISO(value).getTime())) return;

      // La fecha nueva puede mover el evento a otro mes (incluso a uno que
      // todavía no existía) o a otra posición dentro del mismo mes (se
      // reordenan por fecha). Sincronizamos el mes activo de inmediato en
      // vez de esperar al scrollspy, y seguimos la tarjeta hasta su nueva
      // posición resaltándola un instante, para que quede claro que se
      // movió — no que desapareció.
      setActiveMonth(monthKey(value));
      setPendingScroll(id);
      setHighlightedId(id);
    }
    setEventItems((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const updateEventCategory = (id: string, category: Category) => {
    setEventItems((prev) => prev.map((e) => (e.id === id ? { ...e, category } : e)));
    // Igual que al mover la fecha: un pulso breve confirma que el cambio
    // sí se aplicó. Es sobre todo útil ahora que el filtro por área se
    // ignora en modo edición, así que la tarjeta no se mueve de posición
    // visualmente al cambiar de categoría.
    setHighlightedId(id);
  };

  const updateEventImage = (id: string, image: string | undefined) => {
    setEventItems((prev) => prev.map((e) => (e.id === id ? { ...e, image } : e)));
  };

  const addEvent = () => {
    const id = genId();
    const newEvent: EventItem = {
      id,
      title: "Nuevo evento",
      date: todayISO(),
      time: "09:00",
      location: "Ubicación por definir",
      category: "academico",
      description: "Describe este evento para que la comunidad sepa qué esperar.",
    };
    setEventItems((prev) => [...prev, newEvent]);
    // Se pasa la fecha explícitamente: el estado `eventItems` todavía no
    // se actualizó en este punto (setEventItems es asíncrono), así que
    // buscar el evento recién creado dentro de jumpToEvent no lo
    // encontraría todavía. Con la fecha conocida de antemano, el mes
    // activo (y por lo tanto su pastilla de navegación) se sincroniza
    // igual, incluso si el nuevo evento forma un mes que antes no existía.
    jumpToEvent(id, newEvent.date);
    setHighlightedId(id);
  };

  const deleteEvent = async (id: string) => {
    const ok = await confirm({
      title: "¿Eliminar este evento?",
      description: "Esta acción no se puede deshacer.",
      confirmLabel: "Eliminar",
      destructive: true,
    });
    if (!ok) return;
    setEventItems((prev) => prev.filter((e) => e.id !== id));
    // Si el evento eliminado era el que estaba pendiente de scroll o de
    // resaltado, cancelamos esas acciones: de lo contrario pendingScroll
    // seguiría buscando en el DOM un id que ya no existe hasta agotar sus
    // reintentos, y el pulso de highlightedId quedaría "encendido" sin
    // ninguna tarjeta a la cual aplicarse.
    setPendingScroll((prev) => (prev === id ? null : prev));
    setHighlightedId((prev) => (prev === id ? null : prev));
  };

  return (
    <div className="eventos-board relative min-h-screen bg-[var(--bg)]">
      <style>{`
        .font-display { font-family: "Unbounded", sans-serif; }
        .font-mono { font-family: "JetBrains Mono", monospace; }

        /* Brillo institucional (verde/naranja) en el borde de las tarjetas */
        .event-card-glow {
          transition: box-shadow 0.35s ease, transform 0.35s ease;
          box-shadow: 0 1px 0 0 var(--line);
        }
        .event-card-glow:hover {
          box-shadow:
            0 22px 48px -22px color-mix(in srgb, var(--green) 48%, transparent),
            0 12px 28px -16px color-mix(in srgb, var(--orange) 42%, transparent);
        }

        /* Los inputs nativos de fecha/hora dibujan su propio ícono de
           calendario/reloj. color-scheme: dark hace que ese ícono se pinte
           en tono claro para que se vea sobre el fondo oscuro del tema en
           vez de perderse (negro sobre negro). El resto solo agranda un
           poco el área de click del ícono y lo resalta al pasar el mouse. */
        .date-time-input {
          color-scheme: dark;
        }
        .date-time-input::-webkit-calendar-picker-indicator {
          cursor: pointer;
          border-radius: 4px;
          padding: 2px;
          margin-left: 2px;
          opacity: 0.8;
          transition: opacity 0.15s ease;
        }
        .date-time-input::-webkit-calendar-picker-indicator:hover {
          opacity: 1;
        }

        /* Pulso breve para la tarjeta recién agregada o recién movida de
           fecha: confirma visualmente que sí se agregó / sí se movió, en
           vez de que parezca que se perdió en el tablón. */
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

      {editMode && (
        <div className="sticky top-0 z-40 bg-[var(--orange)] text-[var(--bg)] text-center text-[11px] font-mono uppercase tracking-wider py-2 px-4">
          Modo edición activo — los cambios solo viven en esta sesión, todavía no hay base de datos conectada
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
              onClick={addEvent}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--orange)] px-5 py-2.5 font-mono text-xs uppercase tracking-wide text-[var(--bg)]"
            >
              <FiPlus className="h-4 w-4" /> Agregar el primer evento
            </button>
          )}
        </div>
      ) : (
        <>
          {/* ---------- Encabezado ---------- */}
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

          {/* ---------- Spotlight: próximo evento ---------- */}
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

          {/* ---------- Tablón: próximos eventos en rotación ---------- */}
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

          {/* ---------- Filtros por área ---------- */}
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
                    onClick={addEvent}
                    className="inline-flex items-center gap-1.5 rounded-full border-2 border-dashed border-[var(--line)] px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-[var(--muted)] transition-colors hover:border-[var(--orange)]/50 hover:text-[var(--orange)]"
                  >
                    <FiPlus className="h-3 w-3" /> Agregar evento
                  </button>
                )}
              </div>
              {/* En modo edición el filtro por categoría no se aplica (ver
                  `filtered` más arriba): se deshabilitan visualmente las
                  pastillas para que no parezca que deberían estar
                  recortando la lista mientras se edita. */}
              <div
                className={`flex flex-wrap gap-2 transition-opacity ${
                  editMode ? "pointer-events-none opacity-40" : ""
                }`}
                aria-hidden={editMode || undefined}
              >
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

          {/* ---------- Navegación de meses (móvil) ---------- */}
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

          {/* ---------- Calendario agrupado por mes + navegación lateral ---------- */}
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
                      {/* Marca de agua tipográfica: firma visual de esta sección */}
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

                      {/* En modo edición no dependemos de que la sección
                          entre en el viewport para volverse visible
                          (`whileInView` + `once: true`). Si mueves un
                          evento a otro mes — o se crea un mes nuevo —
                          mientras editas, la tarjeta se renderiza visible
                          de inmediato en vez de quedar en opacity:0
                          esperando un scroll que quizá ya no vuelva a
                          disparar el observer (esa era la causa de que un
                          evento "desapareciera" al cambiarle la fecha).
                          Fuera de modo edición se conserva el efecto de
                          aparición al hacer scroll. */}
                      <motion.div
                        variants={sectionVariants}
                        initial={reduceMotion || editMode ? false : "hidden"}
                        animate={editMode ? "show" : undefined}
                        whileInView={editMode ? undefined : "show"}
                        viewport={{ once: true, amount: 0.15 }}
                        className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                      >
                        {group.events.map((e) => (
                          <motion.div key={e.id} variants={cardVariants}>
                            <EventCard
                              event={e}
                              editMode={editMode}
                              onUpdateField={updateEventField}
                              onUpdateCategory={updateEventCategory}
                              onUpdateImage={updateEventImage}
                              onDelete={deleteEvent}
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

      {/* ---------- Botón: activar/salir de edición ----------
          Sticky (no fixed) para que solo se mantenga visible mientras el
          scroll está dentro de este componente, y desaparezca con el resto
          del contenido al salir de Eventos. */}
      <div className="sticky bottom-6 z-50 flex justify-end px-6 pointer-events-none">
        <button
          type="button"
          onClick={() => setEditMode((v) => !v)}
          className={`pointer-events-auto flex items-center gap-2 px-5 py-3 rounded-full font-mono text-xs uppercase tracking-wider font-medium shadow-lg transition-colors ${
            editMode
              ? "bg-[var(--orange)] text-[var(--bg)]"
              : "bg-[var(--ink)] text-[var(--bg)] hover:bg-[var(--green)]"
          }`}
        >
          {editMode ? <FiX className="w-4 h-4" /> : <FiEdit3 className="w-4 h-4" />}
          {editMode ? "Salir de edición" : "Editar página"}
        </button>
      </div>
    </div>
  );
};