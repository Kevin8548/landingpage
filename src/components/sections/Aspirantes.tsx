import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowRight, FiDownload, FiCheck, FiChevronRight } from "react-icons/fi";
import heroImg from "../../assets/A-1.jpg";
import paseDirectoImg from "../../assets/A-2.jpeg";
import cbtisLogo from "../../assets/cbtis.png";
import cobatLogo from "../../assets/cobat.png";

interface KeyDate {
  title: string;
  description: string;
}

// Puedes agregar o quitar fechas libremente: el tracker y el panel de
// detalle se ajustan solos a cualquier cantidad de elementos.
const dates: KeyDate[] = [
  {
    title: "Publicación de convocatoria",
    description:
      "Se libera la convocatoria oficial con los requisitos y el calendario completo del proceso.",
  },
  {
    title: "Apertura de registro",
    description:
      "Comienza el registro en línea. Consulta los requisitos y prepara tu documentación.",
  },
  {
    title: "Curso propedéutico",
    description:
      "Sesiones de preparación para el examen de admisión, dirigidas a los aspirantes registrados.",
  },
  {
    title: "Cierre de registro",
    description:
      "Última fecha para entregar tu documentación y confirmar tu lugar en el proceso.",
  },
  {
    title: "Examen de admisión",
    description:
      "Presenta tu examen en la fecha y sede asignadas durante tu proceso de registro.",
  },
  {
    title: "Publicación de resultados",
    description:
      "Consulta el resultado de tu proceso de admisión con tu número de folio.",
  },
  {
    title: "Inscripción",
    description:
      "Los aspirantes aceptados formalizan su inscripción y quedan listos para iniciar el semestre.",
  },
];

interface Institution {
  name: string;
  description: string;
  logo?: string;
}

const institutions: Institution[] = [
  {
    name: "CBTIs",
    logo: cbtisLogo,
    description:
      "Egresados del Centro de Bachillerato Tecnológico Industrial y de Servicios acceden a pase directo cumpliendo los requisitos académicos.",
  },
  {
    name: "Cobat",
    logo: cobatLogo,
    description:
      "Estudiantes del Colegio de Bachilleres de Tlaxcala cuentan con convenio de ingreso directo a la institución.",
  },
  {
    name: "El Valle",
    description:
      "Egresados de preparatoria El Valle tienen acceso preferente mediante el convenio institucional vigente.",
  },
];

const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 30 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: -dir * 30 }),
};

const pad = (n: number) => String(n).padStart(2, "0");

const SectionDivider = () => (
  <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
);

export const Aspirantes = () => {
  const [activeDate, setActiveDate] = useState(0);
  const [direction, setDirection] = useState(1);

  const goTo = (i: number) => {
    setDirection(i > activeDate ? 1 : -1);
    setActiveDate(i);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setActiveDate((i) => (i === dates.length - 1 ? 0 : i + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [activeDate]);

  const stats = [
    { value: "3", label: "Ingenierías" },
    { value: pad(dates.length), label: "Etapas del proceso" },
    { value: pad(institutions.length), label: "Convenios institucionales" },
  ];

  return (
    <div className="bg-neutral-950 antialiased">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .bg-noise {
          background-image: radial-gradient(rgba(255,255,255,0.045) 1px, transparent 1px);
          background-size: 26px 26px;
        }
      `}</style>

      {/* ---------- Hero: full-bleed, texto sobre la imagen ---------- */}
      <section className="relative min-h-screen flex items-end lg:items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Universidad Tecnológica de Tlaxcala"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-black/25" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/45 to-transparent" />
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
            className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400 mb-5"
          >
            Universidad Tecnológica de Tlaxcala
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/[0.08] backdrop-blur-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium uppercase tracking-[0.15em] text-emerald-400">
              Admisión abierta
            </span>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl font-bold leading-[1.05] tracking-tight mb-7 text-white"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
          >
            {"Inscríbete en tu mejor opción para tu futuro"
              .split(" ")
              .map((word, i) => (
                <motion.span
                  key={i}
                  className="inline-block mr-[0.3ch]"
                  variants={{
                    hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
                    visible: {
                      opacity: 1,
                      y: 0,
                      filter: "blur(0px)",
                      transition: { duration: 0.5, ease: "easeOut" },
                    },
                  }}
                >
                  {word}
                </motion.span>
              ))}
          </motion.h1>

          <p className="text-slate-300 text-lg md:text-xl mb-10 max-w-lg leading-relaxed">
            Tres ingenierías con un gran impacto que el día de hoy manejan la industria.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <motion.button
              type="button"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="group flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600 hover:to-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-500/25 ring-1 ring-inset ring-white/20 transition-colors"
            >
              Ver oferta educativa
              <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="group flex items-center gap-2 px-7 py-3.5 rounded-full border border-white/20 text-slate-200 hover:text-white hover:border-white/40 hover:bg-white/[0.06] text-sm font-medium transition-colors"
            >
              <FiDownload className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
              Descargar información
            </motion.button>
          </div>

          <p className="mt-8 text-xs text-white/40">
            Campus Universidad Tecnológica de Tlaxcala
          </p>
        </motion.div>
      </section>

      {/* ---------- Franja de indicadores ---------- */}
      <div className="relative bg-black border-y border-white/10">
        <div className="max-w-6xl mx-auto grid grid-cols-3 divide-x divide-white/10">
          {stats.map((s) => (
            <div key={s.label} className="py-8 px-3 text-center">
              <div className="text-2xl md:text-4xl font-bold text-white">{s.value}</div>
              <div className="text-[11px] md:text-sm text-slate-500 mt-1 uppercase tracking-wide">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ---------- Fechas clave: navegador vertical + panel de detalle ---------- */}
      <section id="fechas" className="relative py-28 px-6 bg-neutral-950">
        <div className="pointer-events-none absolute inset-0 bg-noise opacity-25" />
        <div className="relative max-w-6xl mx-auto">
          <div className="max-w-xl mb-14">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-amber-400">
              Proceso de admisión
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-3">Fechas clave</h2>
            <p className="text-slate-400 mt-3 leading-relaxed">
              Sigue cada etapa del proceso, desde la convocatoria hasta tu inscripción.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
            {/* Navegador de pasos */}
            <div className="flex lg:flex-col gap-2 overflow-x-auto no-scrollbar pb-2 lg:pb-0 lg:overflow-visible">
              {dates.map((d, i) => (
                <button
                  key={d.title}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-current={i === activeDate}
                  className={`group flex items-center gap-3 shrink-0 lg:w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                    i === activeDate
                      ? "bg-white/[0.06] border-amber-400/30"
                      : "border-transparent hover:bg-white/[0.03]"
                  }`}
                >
                  <span
                    className={`flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-semibold shrink-0 transition-colors ${
                      i < activeDate
                        ? "bg-amber-400/20 text-amber-400"
                        : i === activeDate
                        ? "bg-amber-400 text-slate-950"
                        : "bg-white/5 text-slate-500"
                    }`}
                  >
                    {i < activeDate ? <FiCheck className="w-3.5 h-3.5" /> : i + 1}
                  </span>
                  <span
                    className={`text-sm whitespace-nowrap lg:whitespace-normal ${
                      i === activeDate ? "text-white font-medium" : "text-slate-400"
                    }`}
                  >
                    {d.title}
                  </span>
                  <FiChevronRight
                    className={`hidden lg:block ml-auto w-4 h-4 transition-opacity ${
                      i === activeDate ? "opacity-100 text-amber-400" : "opacity-0"
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Panel de detalle */}
            <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 md:p-12 overflow-hidden min-h-[22rem] flex flex-col justify-center">
              <span className="pointer-events-none select-none absolute -right-4 -top-8 text-[8rem] md:text-[11rem] font-bold leading-none text-white/[0.035]">
                {pad(activeDate + 1)}
              </span>

              <AnimatePresence initial={false} mode="wait" custom={direction}>
                <motion.div
                  key={activeDate}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="relative"
                >
                  <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">
                    Paso {activeDate + 1} de {dates.length}
                  </span>
                  <h3 className="text-2xl md:text-4xl font-semibold text-white mt-3 mb-4 max-w-lg">
                    {dates[activeDate].title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed max-w-xl">
                    {dates[activeDate].description}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="relative mt-10 h-1 w-full max-w-md bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-amber-400 rounded-full"
                  animate={{ width: `${((activeDate + 1) / dates.length) * 100}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ---------- Pase directo: banner + tarjetas en fila ---------- */}
      <section id="pase-directo" className="relative py-28 px-6 bg-neutral-950">
        <div className="pointer-events-none absolute inset-0 bg-noise opacity-25" />
        <div className="relative max-w-6xl mx-auto">
          <div className="max-w-xl mb-12">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-400">
              Convenios institucionales
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">Pase directo</h2>
            <p className="text-slate-400 mt-3 leading-relaxed">
              Ingreso preferente para egresados de instituciones aliadas.
            </p>
          </div>

          <motion.div
            className="relative rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl shadow-black/60 mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src={paseDirectoImg}
              alt="Plantel"
              className="w-full h-56 md:h-72 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />
            <div className="absolute bottom-5 left-6 text-xs font-medium text-white/80">
              Plantel principal
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {institutions.map(({ name, description, logo }, i) => (
              <motion.div
                key={name}
                className="group relative flex flex-col items-start gap-4 p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-emerald-500/20 transition-colors"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <span className="absolute top-5 right-6 text-[11px] font-mono text-slate-600 group-hover:text-emerald-500/60 transition-colors">
                  0{i + 1}
                </span>

                {logo ? (
                  <motion.img
                    src={logo}
                    alt={name}
                    whileHover={{ scale: 1.1, rotate: -6 }}
                    transition={{ type: "spring", stiffness: 300, damping: 12 }}
                    className="w-14 h-14 rounded-full object-contain border border-slate-700 bg-white/5 p-2"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center">
                    <FiArrowRight className="w-5 h-5 text-emerald-400" />
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-semibold text-white mb-1.5 group-hover:text-emerald-300 transition-colors">
                    {name}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Cierre: CTA final ---------- */}
      <section className="relative py-20 px-6 overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800">
        <div className="pointer-events-none absolute inset-0 bg-noise opacity-10" />
        <div className="relative max-w-5xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-8 text-center md:text-left">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              ¿Listo para dar el siguiente paso?
            </h2>
            <p className="text-emerald-50/80 max-w-md mx-auto md:mx-0">
              Inicia tu proceso de admisión y asegura tu lugar para el ciclo 2026.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 shrink-0">
            <motion.button
              type="button"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-emerald-700 text-sm font-semibold shadow-lg shadow-black/20"
            >
              Ver oferta educativa
              <FiArrowRight className="w-4 h-4" />
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="flex items-center gap-2 px-7 py-3.5 rounded-full border border-white/40 text-white text-sm font-medium hover:bg-white/10 transition-colors"
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