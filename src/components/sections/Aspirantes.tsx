import { useEffect, useState } from "react";
import {
  FiMonitor,
  FiShield,
  FiSettings,
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import type { IconType } from "react-icons";

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
}

const institutions: Institution[] = [
  {
    name: "CBTIs",
    description:
      "Egresados del Centro de Bachillerato Tecnológico Industrial y de Servicios acceden a pase directo cumpliendo los requisitos académicos.",
  },
  {
    name: "Cobat",
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

  const goPrev = () =>
    setActiveDate((i) => (i === 0 ? dates.length - 1 : i - 1));
  const goNext = () =>
    setActiveDate((i) => (i === dates.length - 1 ? 0 : i + 1));

  // Autoplay: avanza cada 5s, se reinicia cada vez que el usuario cambia de fecha manualmente
  useEffect(() => {
    const interval = setInterval(() => {
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
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-6">
              Inscríbete en tu mejor opción para tu futuro
            </h1>

            <p className="text-slate-500 text-base md:text-lg mb-8 max-w-md">
              Tres ingenierías con un gran impacto que el día de hoy manejan
              la industria.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                className="px-6 py-3 rounded-full bg-emerald-400 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
              >
                Ver oferta educativa
              </button>

              <button
                type="button"
                className="px-6 py-3 rounded-full border border-emerald-400 text-emerald-600 hover:bg-emerald-50 text-sm font-medium transition-colors"
              >
                Descargar información
              </button>
            </div>
          </div>

          {/* Placeholder de imagen: reemplazar con la imagen real del plantel */}
          <div className="w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-sm">
            Imagen del plantel aquí
          </div>
        </div>
      </section>

      {/* ---------- Carreras disponibles ---------- */}
      <section id="carreras" className="py-14 px-6 bg-white">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-10">
          Carreras disponibles
        </h2>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {careers.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col items-center text-center p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-emerald-50 mb-5">
                <Icon className="w-8 h-8 text-emerald-500" />
              </div>

              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                {title}
              </h3>

              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                {description}
              </p>

              <button
                type="button"
                className="mt-auto px-5 py-2.5 rounded-full bg-emerald-400 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
              >
                Consultar más información
              </button>
            </div>
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
            <button
              type="button"
              aria-label="Fecha anterior"
              onClick={goPrev}
              className="shrink-0 w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-500 hover:text-emerald-500 transition-colors"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>

            {/* Pista deslizante */}
            <div className="overflow-hidden flex-1">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${activeDate * 100}%)` }}
              >
                {dates.map(({ title, description }) => (
                  <div key={title} className="w-full shrink-0">
                    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm min-h-[150px]">
                      <h3 className="font-semibold text-slate-900 mb-2">
                        {title}
                      </h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Flecha derecha */}
            <button
              type="button"
              aria-label="Fecha siguiente"
              onClick={goNext}
              className="shrink-0 w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-500 hover:text-emerald-500 transition-colors"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Puntos */}
          <div className="flex justify-center gap-2 mt-5">
            {dates.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Ver fecha ${i + 1}`}
                onClick={() => setActiveDate(i)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  i === activeDate ? "bg-orange-500" : "bg-orange-300/60"
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
          {/* Placeholder de imagen: reemplazar con la imagen real del plantel */}
          <div className="w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-sm">
            Imagen del plantel aquí
          </div>

          <div className="flex flex-col gap-6">
            {institutions.map(({ name, description }) => (
              <div key={name} className="flex items-start gap-4">
                {/* Placeholder de logo: reemplazar con el logo real */}
                <div className="w-12 h-12 shrink-0 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center">
                  <FiArrowRight className="w-5 h-5 text-emerald-500" />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">
                    {name}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};