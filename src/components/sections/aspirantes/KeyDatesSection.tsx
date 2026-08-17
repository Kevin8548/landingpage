import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FiCheck, FiChevronRight } from "react-icons/fi";
import { dates } from "../../../data/aspirantes";

const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 30 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: -dir * 30 }),
};

const pad = (n: number) => String(n).padStart(2, "0");

export const KeyDatesSection = () => {
  const [activeDate, setActiveDate] = useState(0);
  const [direction, setDirection] = useState(1);

  const goTo = (i: number) => {
    setDirection(i > activeDate ? 1 : -1);
    setActiveDate(i);
  };

  // Autoplay del carrusel.
  useEffect(() => {
    if (dates.length <= 1) return;
    const interval = setInterval(() => {
      setDirection(1);
      setActiveDate((i) => (i === dates.length - 1 ? 0 : i + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
          {/* Navegador de pasos */}
          <div className="flex lg:flex-col gap-2 overflow-x-auto no-scrollbar pb-2 lg:pb-0 lg:overflow-visible">
            {dates.map((d, i) => (
              <div
                key={d.id}
                className={`group flex items-center shrink-0 lg:w-full rounded-xl border transition-colors ${
                  i === activeDate
                    ? "bg-[var(--ink)]/[0.06] border-[var(--orange)]/30"
                    : "border-transparent hover:bg-[var(--ink)]/[0.03]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  aria-current={i === activeDate}
                  className="flex items-center gap-3 flex-1 min-w-0 text-left px-4 py-3"
                >
                  <span
                    className={`font-data flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-medium shrink-0 transition-colors ${
                      i < activeDate
                        ? "bg-[var(--orange)]/20 text-[var(--orange)]"
                        : i === activeDate
                        ? "bg-[var(--orange)] text-[var(--bg)]"
                        : "bg-[var(--ink)]/5 text-[var(--muted)]"
                    }`}
                  >
                    {i < activeDate ? <FiCheck className="w-3.5 h-3.5" /> : i + 1}
                  </span>
                  <span className="flex flex-col min-w-0">
                    <span
                      className={`text-sm truncate whitespace-nowrap lg:whitespace-normal ${
                        i === activeDate
                          ? "text-[var(--ink)] font-medium"
                          : "text-[var(--muted)]"
                      }`}
                    >
                      {d.title}
                    </span>
                    <span
                      className={`font-data text-[10px] uppercase tracking-wide truncate ${
                        i === activeDate
                          ? "text-[var(--orange)]"
                          : "text-[var(--muted)]/70"
                      }`}
                    >
                      {d.date}
                    </span>
                  </span>
                  <FiChevronRight
                    className={`hidden lg:block ml-auto w-4 h-4 shrink-0 transition-opacity ${
                      i === activeDate ? "opacity-100 text-[var(--orange)]" : "opacity-0"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          {/* Panel de detalle */}
          <div className="relative rounded-2xl border border-[var(--line)] bg-[var(--glass)] backdrop-blur-sm p-8 md:p-12 overflow-hidden min-h-[22rem] flex flex-col justify-center">
            <span className="font-display pointer-events-none select-none absolute -right-4 -top-8 text-[8rem] md:text-[11rem] font-bold leading-none text-[var(--ink)]/[0.035]">
              {pad(activeDate + 1)}
            </span>

            <AnimatePresence initial={false} mode="wait" custom={direction}>
              <motion.div
                key={dates[activeDate].id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="relative"
              >
                <span className="font-data text-[var(--orange)] text-xs font-medium uppercase tracking-wider">
                  Paso {activeDate + 1} de {dates.length}
                </span>

                <div className="mt-3 mb-1">
                  <span className="font-data text-2xl md:text-3xl font-bold text-[var(--orange)] tracking-tight">
                    {dates[activeDate].date}
                  </span>
                </div>
                <h3 className="font-display text-2xl md:text-4xl font-semibold text-[var(--ink)] mt-1 mb-4 max-w-lg">
                  {dates[activeDate].title}
                </h3>
                <p className="text-[var(--muted)] leading-relaxed max-w-xl">
                  {dates[activeDate].description}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="relative mt-10 h-1 w-full max-w-md bg-[var(--ink)]/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[var(--orange)] rounded-full"
                animate={{ width: `${((activeDate + 1) / dates.length) * 100}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};