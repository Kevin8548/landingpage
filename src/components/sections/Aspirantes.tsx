import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowRight, FiDownload, FiCheck, FiChevronRight } from "react-icons/fi";
import { CAREERS, heroImg, paseDirectoImg } from "../../data/aspirantes";
import { useAspirantesStore } from "../../data/aspirantesStore";

const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 30 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: -dir * 30 }),
};

const pad = (n: number) => String(n).padStart(2, "0");

const SectionDivider = () => (
  <div className="h-px w-full bg-gradient-to-r from-transparent via-[var(--line)] to-transparent" />
);

export const Aspirantes = () => {
  const { heroTitle, heroSubtitle, dateItems, institutionItems } = useAspirantesStore();

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

  // Autoplay del carrusel.
  useEffect(() => {
    if (dateItems.length <= 1) return;
    const interval = setInterval(() => {
      setDirection(1);
      setActiveDate((i) => (i === dateItems.length - 1 ? 0 : i + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [activeDate, dateItems.length]);

  return (
    <div className="bg-[var(--bg)] antialiased">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .bg-noise {
          background-image: radial-gradient(rgba(247, 245, 238, 0.045) 1px, transparent 1px);
          background-size: 26px 26px;
        }
        .font-display { font-family: "Unbounded", sans-serif; }
        .font-data { font-family: "JetBrains Mono", monospace; }
      `}</style>

      {/* ---------- Hero ---------- */}
      <section className="relative min-h-screen flex items-end lg:items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Universidad Tecnológica de Tlaxcala" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/65 to-[var(--bg)]/25" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg)]/90 via-[var(--bg)]/45 to-transparent" />
          <div className="absolute inset-0 bg-noise opacity-20" />
        </div>

        <motion.div
          className="relative z-10 max-w-2xl px-6 md:px-16 py-24 lg:py-0"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="font-data text-[11px] font-medium uppercase tracking-[0.3em] text-[var(--muted)] mb-5"
          >
            Universidad Tecnológica de Tlaxcala
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-[var(--green)]/25 bg-[var(--green)]/[0.08] backdrop-blur-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] animate-pulse" />
            <span className="font-data text-xs font-medium uppercase tracking-[0.15em] text-[var(--green)]">
              Admisión abierta
            </span>
          </motion.div>

          <motion.h1
            className="font-display text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight mb-7 text-[var(--ink)]"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
          >
            {heroTitle.split(" ").map((word, i) => (
              <motion.span
                key={i}
                className="inline-block mr-[0.3ch]"
                variants={{
                  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
                  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: "easeOut" } },
                }}
              >
                {word}
              </motion.span>
            ))}
          </motion.h1>

          <p className="text-[var(--ink)]/70 text-lg md:text-xl mb-10 max-w-lg leading-relaxed">{heroSubtitle}</p>

          <p className="text-xs text-[var(--ink)]/40">Campus Universidad Tecnológica de Tlaxcala</p>
        </motion.div>
      </section>

      {/* ---------- Franja de ingenierías ---------- */}
      <div className="relative bg-[var(--bg)] border-y border-[var(--line)]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[var(--line)]">
          {CAREERS.map(({ id, name, shortName, img, iconBg, border, bg, text, path }) => (
            <div key={id} className="flex flex-col items-center text-center gap-4 py-10 px-6 h-full">
              <div className={`shrink-0 w-36 aspect-[4/3] rounded-2xl flex items-center justify-center shadow-lg shadow-black/20 p-3 ${iconBg}`}>
                <img src={img} alt={name} className="w-full h-full object-contain" />
              </div>
              <div className="flex items-center justify-center min-h-[3.5rem] md:min-h-[3.25rem]">
                <span className="font-display text-sm md:text-base font-medium text-[var(--ink)] leading-snug max-w-[240px]">
                  {name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  // TODO: CONEXIÓN PENDIENTE — navegar a `path` cuando exista routing de carreras.
                  console.log("Ir a carrera (pendiente de conectar):", path);
                }}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-data uppercase tracking-wider font-medium transition-opacity hover:opacity-80 ${border} ${bg} ${text}`}
              >
                {shortName}
                <FiChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ---------- Fechas clave ---------- */}
      <section id="fechas" className="relative py-28 px-6 bg-[var(--bg)]">
        <div className="pointer-events-none absolute inset-0 bg-noise opacity-25" />
        <div className="relative max-w-6xl mx-auto">
          <div className="max-w-xl mb-14">
            <span className="font-data text-xs font-medium uppercase tracking-[0.2em] text-[var(--orange)]">
              Proceso de admisión
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--ink)] mt-3">Fechas clave</h2>
            <p className="text-[var(--muted)] mt-3 leading-relaxed">
              Sigue cada etapa del proceso, desde la convocatoria hasta tu inscripción.
            </p>
          </div>

          {dateItems.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-[var(--line)] p-12 text-center">
              <p className="text-[var(--muted)]">Todavía no hay fechas registradas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
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
                  </div>
                ))}
              </div>

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

      <SectionDivider />

      {/* ---------- Pase directo ---------- */}
      <section id="pase-directo" className="relative py-28 px-6 bg-[var(--bg)]">
        <div className="pointer-events-none absolute inset-0 bg-noise opacity-25" />
        <div className="relative max-w-6xl mx-auto">
          <div className="max-w-xl mb-12">
            <span className="font-data text-xs font-medium uppercase tracking-[0.2em] text-[var(--green)]">
              Convenios institucionales
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--ink)] mt-2">Pase directo</h2>
            <p className="text-[var(--muted)] mt-3 leading-relaxed">
              Ingreso preferente para egresados de instituciones aliadas.
            </p>
          </div>

          <motion.div
            className="relative rounded-2xl overflow-hidden ring-1 ring-[var(--line)] shadow-2xl shadow-[var(--bg)]/60 mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <img src={paseDirectoImg} alt="Plantel" className="w-full h-56 md:h-72 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)]/70 via-[var(--bg)]/10 to-transparent pointer-events-none" />
            <div className="absolute bottom-5 left-6 text-xs font-medium text-[var(--ink)]/80">Plantel principal</div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {institutionItems.map(({ id, name, description, logo }, i) => (
              <motion.div
                key={id}
                className="group relative flex flex-col items-start gap-4 p-6 rounded-2xl border border-[var(--line)] bg-[var(--ink)]/[0.02] hover:bg-[var(--ink)]/[0.04] hover:border-[var(--green)]/20 transition-colors"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <span className="font-data absolute top-5 right-6 text-[11px] text-[var(--muted)] group-hover:text-[var(--green)]/60 transition-colors">
                  0{i + 1}
                </span>

                {logo ? (
                  <motion.img
                    src={logo}
                    alt={name}
                    whileHover={{ scale: 1.1, rotate: -6 }}
                    transition={{ type: "spring", stiffness: 300, damping: 12 }}
                    className="w-14 h-14 rounded-full object-contain border border-[var(--line)] bg-[var(--ink)]/5 p-2"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full border-2 border-dashed border-[var(--muted)]/40 flex items-center justify-center">
                    <FiArrowRight className="w-5 h-5 text-[var(--green)]" />
                  </div>
                )}

                <div className="w-full">
                  <h3 className="font-display text-xl font-semibold text-[var(--ink)] mb-1.5 group-hover:text-[var(--green)] transition-colors">
                    {name}
                  </h3>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">{description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ---------- Cierre: CTA final ---------- */}
      <section className="relative py-20 px-6 overflow-hidden bg-[var(--bg)]">
        <div className="pointer-events-none absolute inset-0 bg-noise opacity-10" />
        <div className="relative max-w-5xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-8 text-center md:text-left">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--ink)] mb-3">
              ¿Listo para dar el siguiente paso?
            </h2>
            <p className="text-[var(--ink)]/70 max-w-md mx-auto md:mx-0">
              Inicia tu proceso de admisión y asegura tu lugar para el ciclo 2026.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 shrink-0">
            <motion.button
              type="button"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-[var(--ink)] text-[var(--bg)] text-sm font-semibold shadow-lg shadow-black/20"
            >
              Ver oferta educativa
              <FiArrowRight className="w-4 h-4" />
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="flex items-center gap-2 px-7 py-3.5 rounded-full border border-[var(--ink)]/40 text-[var(--ink)] text-sm font-medium hover:bg-[var(--ink)]/10 transition-colors"
            >
              <FiDownload className="w-4 h-4" />
              Descargar información
            </motion.button>
          </div>
        </div>
      </section>
    </div>
  );
};