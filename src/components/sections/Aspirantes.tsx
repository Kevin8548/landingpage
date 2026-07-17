import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMonitor,
  FiShield,
  FiSettings,
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import heroImg from "../../assets/A-1.jpg";
import paseDirectoImg from "../../assets/A-2.jpeg";
import cbtisLogo from "../../assets/cbtis.png";
import cobatLogo from "../../assets/cobat.png";

/* ---------- Datos ---------- */

interface Career {
  icon: IconType;
  title: string;
  description: string;
}

const careers: Career[] = [
  {
    icon: FiMonitor,
    title: "Entornos virtuales",
    description:
      "Diseña y desarrolla experiencias inmersivas para educación, entretenimiento e industria.",
  },
  {
    icon: FiShield,
    title: "Redes y ciberseguridad",
    description:
      "Protege infraestructuras digitales y gestiona redes seguras para empresas e instituciones.",
  },
  {
    icon: FiSettings,
    title: "Desarrollo y gestión de software multiplataforma",
    description:
      "Crea soluciones de software funcionales para web, escritorio y dispositivos móviles.",
  },
];

interface KeyDate {
  title: string;
  description: string;
}

const dates: KeyDate[] = [
  {
    title: "Apertura de convocatoria",
    description:
      "Consulta los requisitos y comienza tu proceso de inscripción en la fecha indicada.",
  },
  {
    title: "Cierre de registro",
    description:
      "Última fecha para entregar tu documentación y confirmar tu lugar en el proceso.",
  },
  {
    title: "Examen de admisión",
    description:
      "Presenta tu examen y conoce el resultado de tu proceso de admisión.",
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

/* ---------- Componente único ---------- */

export const Aspirantes = () => {
  const [activeDate, setActiveDate] = useState(0);
  const [direction, setDirection] = useState(1);

  const goPrev = () => {
    setDirection(-1);
    setActiveDate((i) => (i === 0 ? dates.length - 1 : i - 1));
  };
  const goNext = () => {
    setDirection(1);
    setActiveDate((i) => (i === dates.length - 1 ? 0 : i + 1));
  };
  const goTo = (i: number) => {
    setDirection(i > activeDate ? 1 : -1);
    setActiveDate(i);
  };

  // Autoplay: avanza cada 5s, se reinicia cada vez que el usuario cambia de fecha manualmente
  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setActiveDate((i) => (i === dates.length - 1 ? 0 : i + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [activeDate]);

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section
        id="hero"
        className="relative min-h-screen flex items-center px-6 md:px-16 py-16"
      >
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.h1
              className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-6"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.07 } },
              }}
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

            <p className="text-slate-500 text-base md:text-lg mb-8 max-w-md">
              Tres ingenierías con un gran impacto que el día de hoy manejan
              la industria.
            </p>

            <div className="flex flex-wrap gap-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="px-6 py-3 rounded-full bg-emerald-400 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
              >
                Ver oferta educativa
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="px-6 py-3 rounded-full border border-emerald-400 text-emerald-600 hover:bg-emerald-50 text-sm font-medium transition-colors"
              >
                Descargar información
              </motion.button>
            </div>
          </motion.div>

          <motion.img
            src={heroImg}
            alt="Universidad Tecnológica de Tlaxcala"
            className="w-full aspect-[4/3] object-cover rounded-2xl cursor-pointer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: [0, -10, 0],
            }}
            whileHover={{ scale: 1.03, rotate: 1 }}
            transition={{
              opacity: { duration: 0.6, ease: "easeOut", delay: 0.15 },
              scale: { duration: 0.6, ease: "easeOut", delay: 0.15 },
              y: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.8,
              },
            }}
          />
        </div>
      </section>

      {/* ---------- Carreras disponibles ---------- */}
      <section id="carreras" className="py-14 px-6 bg-white">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-10">
          Carreras disponibles
        </h2>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {careers.map(({ icon: Icon, title, description }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              whileHover={{ y: -10 }}
              className="group flex flex-col items-center text-center p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-shadow"
            >
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300, damping: 12 }}
                className="w-16 h-16 flex items-center justify-center rounded-full bg-emerald-50 mb-5 group-hover:bg-emerald-100"
              >
                <Icon className="w-8 h-8 text-emerald-500" />
              </motion.div>

              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                {title}
              </h3>

              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                {description}
              </p>

              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="mt-auto px-5 py-2.5 rounded-full bg-emerald-400 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
              >
                Consultar más información
              </motion.button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------- Fechas clave (carrusel) ---------- */}
      <section id="fechas" className="py-14 px-6 bg-white">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-10">
          Fechas clave
        </h2>

        <div className="max-w-5xl mx-auto rounded-3xl bg-orange-200/70 p-6 md:p-10">
          <div className="flex items-center gap-3 md:gap-5">
            {/* Flecha izquierda: fuera de la tarjeta blanca, dentro del recuadro naranja */}
            <motion.button
              type="button"
              aria-label="Fecha anterior"
              onClick={goPrev}
              whileHover={{ scale: 1.15, x: -2 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="shrink-0 w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-500 hover:text-emerald-500 transition-colors"
            >
              <FiChevronLeft className="w-5 h-5" />
            </motion.button>

            {/* Pista animada */}
            <div className="overflow-hidden flex-1 relative min-h-[150px]">
              <AnimatePresence initial={false} mode="wait" custom={direction}>
                <motion.div
                  key={activeDate}
                  custom={direction}
                  initial={(dir: number) => ({ opacity: 0, x: dir * 40 })}
                  animate={{ opacity: 1, x: 0 }}
                  exit={(dir: number) => ({ opacity: 0, x: -dir * 40 })}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                >
                  <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm min-h-[150px]">
                    <h3 className="font-semibold text-slate-900 mb-2">
                      {dates[activeDate].title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {dates[activeDate].description}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Flecha derecha */}
            <motion.button
              type="button"
              aria-label="Fecha siguiente"
              onClick={goNext}
              whileHover={{ scale: 1.15, x: 2 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="shrink-0 w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-500 hover:text-emerald-500 transition-colors"
            >
              <FiChevronRight className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Puntos */}
          <div className="flex justify-center gap-2 mt-5">
            {dates.map((_, i) => (
              <motion.button
                key={i}
                type="button"
                aria-label={`Ver fecha ${i + 1}`}
                onClick={() => goTo(i)}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  i === activeDate
                    ? "w-6 bg-orange-500"
                    : "w-2.5 bg-orange-300/60"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Pase directo ---------- */}
      <section id="pase-directo" className="py-14 px-6 bg-white">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-10">
          Pase directo
        </h2>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <motion.img
            src={paseDirectoImg}
            alt="Plantel"
            className="w-full aspect-[4/3] object-cover rounded-2xl"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          />

          <div className="flex flex-col gap-6">
            {institutions.map(({ name, description, logo }, i) => (
              <motion.div
                key={name}
                className="flex items-start gap-4"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                whileHover={{ x: 6 }}
              >
                {logo ? (
                  <motion.img
                    src={logo}
                    alt={name}
                    whileHover={{ scale: 1.15, rotate: -6 }}
                    transition={{ type: "spring", stiffness: 300, damping: 12 }}
                    className="w-12 h-12 shrink-0 rounded-full object-contain border border-slate-200 p-1.5"
                  />
                ) : (
                  // Placeholder de logo: reemplazar cuando tengas la imagen
                  <div className="w-12 h-12 shrink-0 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center">
                    <FiArrowRight className="w-5 h-5 text-emerald-500" />
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">
                    {name}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};