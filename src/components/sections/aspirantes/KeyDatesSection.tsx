import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FiCheck, FiChevronRight, FiPlus, FiTrash2 } from "react-icons/fi";
import type { KeyDate } from "../../../data/aspirantes";

const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 30 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: -dir * 30 }),
};

const pad = (n: number) => String(n).padStart(2, "0");

export type DateTextField = "title" | "description" | "date";

interface KeyDatesSectionProps {
  dateItems: KeyDate[];
  editMode?: boolean;
  onUpdateField?: (id: string, field: DateTextField, value: string) => void;
  onAddDate?: () => void;
  onDeleteDate?: (id: string) => void;
}

export const KeyDatesSection = ({
  dateItems,
  editMode = false,
  onUpdateField,
  onAddDate,
  onDeleteDate,
}: KeyDatesSectionProps) => {
  const [activeDate, setActiveDate] = useState(0);
  const [direction, setDirection] = useState(1);
  const safeActiveDate = dateItems.length ? Math.min(activeDate, dateItems.length - 1) : 0;

  const goTo = (i: number) => {
    setDirection(i > activeDate ? 1 : -1);
    setActiveDate(i);
  };

  useEffect(() => {
    if (dateItems.length > 0 && activeDate > dateItems.length - 1) {
      setActiveDate(dateItems.length - 1);
    }
  }, [dateItems.length, activeDate]);

  // Autoplay del carrusel (pausado mientras se edita).
  useEffect(() => {
    if (editMode || dateItems.length <= 1) return;
    const interval = setInterval(() => {
      setDirection(1);
      setActiveDate((i) => (i === dateItems.length - 1 ? 0 : i + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [activeDate, editMode, dateItems.length]);

  const handleAddDate = () => {
    setDirection(1);
    setActiveDate(dateItems.length);
    onAddDate?.();
  };

  return (
    <section id="fechas" className="relative py-28 px-6 bg-[var(--bg)]">
      <div className="pointer-events-none absolute inset-0 bg-noise opacity-25" />
      <div className="relative max-w-6xl mx-auto">
        <div className="max-w-xl mb-14">
          <span className="font-data text-xs font-medium uppercase tracking-[0.2em] text-[var(--orange)]">
            Proceso de admisión
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--ink)] mt-3">
            Fechas clave
          </h2>
          <p className="text-[var(--muted)] mt-3 leading-relaxed">
            Sigue cada etapa del proceso, desde la convocatoria hasta tu inscripción.
          </p>
        </div>

        {dateItems.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-[var(--line)] p-12 text-center">
            <p className="text-[var(--muted)] mb-4">Todavía no hay fechas registradas.</p>
            {editMode && (
              <button
                type="button"
                onClick={handleAddDate}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--orange)] text-[var(--bg)] text-sm font-semibold"
              >
                <FiPlus className="w-4 h-4" /> Agregar la primera fecha
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
            {/* Navegador de pasos */}
            <div className="flex lg:flex-col gap-2 overflow-x-auto no-scrollbar pb-2 lg:pb-0 lg:overflow-visible">
              {dateItems.map((d, i) => (
                <div
                  key={d.id}
                  className={`group flex items-center shrink-0 lg:w-full rounded-xl border transition-colors ${
                    i === safeActiveDate
                      ? "bg-[var(--ink)]/[0.06] border-[var(--orange)]/30"
                      : "border-transparent hover:bg-[var(--ink)]/[0.03]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={i === safeActiveDate}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left px-4 py-3"
                  >
                    <span
                      className={`font-data flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-medium shrink-0 transition-colors ${
                        i < safeActiveDate
                          ? "bg-[var(--orange)]/20 text-[var(--orange)]"
                          : i === safeActiveDate
                          ? "bg-[var(--orange)] text-[var(--bg)]"
                          : "bg-[var(--ink)]/5 text-[var(--muted)]"
                      }`}
                    >
                      {i < safeActiveDate ? <FiCheck className="w-3.5 h-3.5" /> : i + 1}
                    </span>
                    <span className="flex flex-col min-w-0">
                      <span
                        className={`text-sm truncate whitespace-nowrap lg:whitespace-normal ${
                          i === safeActiveDate ? "text-[var(--ink)] font-medium" : "text-[var(--muted)]"
                        }`}
                      >
                        {d.title}
                      </span>
                      <span
                        className={`font-data text-[10px] uppercase tracking-wide truncate ${
                          i === safeActiveDate ? "text-[var(--orange)]" : "text-[var(--muted)]/70"
                        }`}
                      >
                        {d.date}
                      </span>
                    </span>
                    <FiChevronRight
                      className={`hidden lg:block ml-auto w-4 h-4 shrink-0 transition-opacity ${
                        i === safeActiveDate ? "opacity-100 text-[var(--orange)]" : "opacity-0"
                      }`}
                    />
                  </button>

                  {editMode && (
                    <button
                      type="button"
                      onClick={() => onDeleteDate?.(d.id)}
                      aria-label="Eliminar fecha"
                      className="shrink-0 p-2 mr-2 rounded-md text-[var(--muted)] hover:text-red-400 hover:bg-[var(--ink)]/5 transition-colors"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}

              {editMode && (
                <button
                  type="button"
                  onClick={handleAddDate}
                  className="flex items-center justify-center gap-2 shrink-0 lg:w-full px-4 py-3 rounded-xl border-2 border-dashed border-[var(--line)] text-[var(--muted)] hover:border-[var(--orange)]/40 hover:text-[var(--orange)] transition-colors text-sm font-medium"
                >
                  <FiPlus className="w-4 h-4" /> Agregar fecha
                </button>
              )}
            </div>

            {/* Panel de detalle */}
            <div className="relative rounded-2xl border border-[var(--line)] bg-[var(--glass)] backdrop-blur-sm p-8 md:p-12 overflow-hidden min-h-[22rem] flex flex-col justify-center">
              <span className="font-display pointer-events-none select-none absolute -right-4 -top-8 text-[8rem] md:text-[11rem] font-bold leading-none text-[var(--ink)]/[0.035]">
                {pad(safeActiveDate + 1)}
              </span>

              <AnimatePresence initial={false} mode="wait" custom={direction}>
                <motion.div
                  key={dateItems[safeActiveDate].id}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="relative"
                >
                  <span className="font-data text-[var(--orange)] text-xs font-medium uppercase tracking-wider">
                    Paso {safeActiveDate + 1} de {dateItems.length}
                  </span>

                  {editMode ? (
                    <div className="mt-3 space-y-3">
                      <input
                        type="text"
                        value={dateItems[safeActiveDate].date}
                        onChange={(e) => onUpdateField?.(dateItems[safeActiveDate].id, "date", e.target.value)}
                        placeholder="Fecha de la etapa (ej. 15 de agosto de 2026)"
                        className="font-data text-xl md:text-2xl font-bold text-[var(--orange)] bg-transparent border-b border-dashed border-[var(--orange)]/50 focus:outline-none focus:border-[var(--orange)] w-full max-w-lg pb-1"
                      />
                      <input
                        type="text"
                        value={dateItems[safeActiveDate].title}
                        onChange={(e) => onUpdateField?.(dateItems[safeActiveDate].id, "title", e.target.value)}
                        placeholder="Título de la etapa"
                        className="font-display text-2xl md:text-4xl font-semibold text-[var(--ink)] bg-transparent border-b border-dashed border-[var(--orange)]/50 focus:outline-none focus:border-[var(--orange)] w-full max-w-lg pb-1"
                      />
                      <textarea
                        value={dateItems[safeActiveDate].description}
                        onChange={(e) => onUpdateField?.(dateItems[safeActiveDate].id, "description", e.target.value)}
                        placeholder="Descripción de la etapa"
                        rows={3}
                        className="text-[var(--muted)] leading-relaxed max-w-xl w-full bg-transparent border border-dashed border-[var(--line)] rounded-lg p-3 focus:outline-none focus:border-[var(--orange)]/50 resize-y"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="mt-3 mb-1">
                        <span className="font-data text-2xl md:text-3xl font-bold text-[var(--orange)] tracking-tight">
                          {dateItems[safeActiveDate].date}
                        </span>
                      </div>
                      <h3 className="font-display text-2xl md:text-4xl font-semibold text-[var(--ink)] mt-1 mb-4 max-w-lg">
                        {dateItems[safeActiveDate].title}
                      </h3>
                      <p className="text-[var(--muted)] leading-relaxed max-w-xl">
                        {dateItems[safeActiveDate].description}
                      </p>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="relative mt-10 h-1 w-full max-w-md bg-[var(--ink)]/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[var(--orange)] rounded-full"
                  animate={{ width: `${((safeActiveDate + 1) / dateItems.length) * 100}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};