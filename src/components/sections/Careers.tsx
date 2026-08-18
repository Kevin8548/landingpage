import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { careers } from "../../data/careers";
import { CareerItem } from "../cards/CareerItem";
import { TimelinePath } from "../ui/TimelinePath";

export function Careers() {
  const targetRef = useRef<HTMLDivElement>(null);
  const firstCardRef = useRef<HTMLDivElement>(null);
  const [sectionWidth, setSectionWidth] = useState(1200);
  const visibleCareers = careers.filter((c) => c.slug !== "ingenieria-ti");
  const totalSlides = visibleCareers.length;
  const horizontalSteps = Math.max(totalSlides - 1, 0);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 25,
    restDelta: 0.001,
  });

  const x = useTransform(
    smoothProgress,
    [0, 1],
    ["0vw", `-${horizontalSteps * 100}vw`]
  );

  useEffect(() => {
    const el = firstCardRef.current;
    if (!el) return;

    setSectionWidth(el.offsetWidth);

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setSectionWidth(width);
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={targetRef}
      className="relative"
      style={{ height: `calc(100vh + ${horizontalSteps * 100}vh)` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden flex items-center">
        {/* Fondo: degradado base + glows + grid técnico enmascarado */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background:
              // "linear-gradient(to bottom, #080d16 0%, #0c1422 50%, #080d16 100%)",
              // "linear-gradient(to bottom, #0C0C0D 0%, #0C0C0D 50%, #0C0C0D 100%)",
              "linear-gradient(to bottom, #000 0%, #000 50%, #000 100%)",
          }}
        >
          {/* Glow verde arriba-izquierda */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 0% 0%, rgba(34,197,94,0.09) 0%, transparent 75%)",
            }}
          />
          {/* Glow naranja abajo-derecha */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 100% 100%, rgba(255, 183, 3,0.09) 0%, transparent 65%)",
            }}
          />
          {/* Grid técnico 56x56 con máscara radial */}
          {/* Grid técnico: patrón hexagonal con máscara radial */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='150' viewBox='0 0 140 140'%3E%3Cg fill='none' stroke='rgba(218, 218, 221,0.1)' stroke-width='1'%3E%3Cpath d='M15 15L55 35'/%3E%3Cpath d='M55 35L110 20'/%3E%3Cpath d='M55 35L40 85'/%3E%3Cpath d='M40 85L15 15'/%3E%3Cpath d='M40 85L95 100'/%3E%3Cpath d='M95 100L110 20'/%3E%3Cpath d='M110 20L140 60'/%3E%3Cpath d='M95 100L120 135'/%3E%3Cpath d='M15 15L0 60'/%3E%3Cpath d='M0 60L40 85'/%3E%3C/g%3E%3Cg fill='rgba(140,165,200,0.2)'%3E%3Ccircle cx='15' cy='15' r='2.5'/%3E%3Ccircle cx='55' cy='35' r='1.8'/%3E%3Ccircle cx='110' cy='20' r='2.5'/%3E%3Ccircle cx='40' cy='85' r='2.5'/%3E%3Ccircle cx='95' cy='100' r='1.8'/%3E%3Ccircle cx='140' cy='60' r='1.8'/%3E%3Ccircle cx='120' cy='135' r='1.8'/%3E%3Ccircle cx='0' cy='60' r='1.8'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "190px 190px",
            maskImage:
              "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 75%)",
          }}
        />
        </div>

        <h2 className="absolute top-8 left-4 z-10 pb-8 text-3xl font-bold italic leading-tight text-naranja sm:top-12 sm:left-6 sm:text-4xl sm:pb-10 md:top-16 md:left-8 md:text-5xl md:pb-12">
          Conoce nuestras <br /> carreras
        </h2>

        <motion.div className="flex relative" style={{ x, willChange: "transform" }}>
          <TimelinePath
            sections={totalSlides}
            sectionWidth={sectionWidth}
            sectionLabels={[...visibleCareers.map((c) => c.title)]}
            branchLabels={[
              ["Código", "Sistema"],
              ["Infraestructura", "Seguridad"],
              ["Experiencias XR", "Negocios digitales"],
            ]}
            progress={smoothProgress}
            className="left-4 top-[300px] z-0 pointer-events-none sm:left-10 sm:top-[380px] md:left-20 md:top-[400px]"
          />

          {visibleCareers.map((career, index) => (
            <div
              key={career.slug}
              ref={index === 0 ? firstCardRef : undefined}
              className={`relative z-10 h-screen w-screen flex-shrink-0 px-4 pt-64 sm:px-6 md:px-8 md:pt-72 ${index === 0 ? "md:pl-28" : ""}`}
            >
              <CareerItem
                career={career}
                priority={index === 0}
                progress={smoothProgress}
                index={index}
                total={visibleCareers.length}
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function TechnologyFinale() {
  return (
    <article className="relative z-10 flex h-screen w-screen flex-shrink-0 items-center px-6 pt-20 sm:px-10 md:px-24 lg:px-32">
      <div className="max-w-4xl rounded-2xl border border-dark-green-primary/45 bg-[#080d16]/10 p-6 shadow-2xl shadow-black/15 backdrop-blur-md md:rounded-3xl md:p-12">
        <p className="mb-4 font-mono text-[0.65rem] font-semibold tracking-[0.2em] text-verde uppercase md:mb-5 md:text-xs md:tracking-[0.24em]">
          Próximo destino
        </p>
        <h3 className="max-w-3xl text-3xl font-extrabold italic leading-[1.04] text-naranja sm:text-4xl md:text-6xl">
          Tecnologías de la Información e Innovación Digital
        </h3>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-300 sm:text-base md:mt-6 md:text-lg">
          Sigue explorando las herramientas, experiencias y soluciones que definen el futuro digital.
        </p>
      </div>
    </article>
  );
}
