// components/sections/StudyPlanSection.tsx
import { memo, useMemo, useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { ChevronDown } from "lucide-react";
import type { Cuatrimestre, Materia } from "../../../data/careerDetails";

interface StudyPlanSectionProps {
  cuatrimestres: Cuatrimestre[];
  studyPlanImages: string[];
}

function chunkInPairs<T>(items: T[]): T[][] {
  const pairs: T[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    pairs.push(items.slice(i, i + 2));
  }
  return pairs;
}

// Cuatrimestres 1-6 pertenecen a TSU, 7-10 a Ingeniería.
function getPrograma(pair: Cuatrimestre[]): string {
  return pair[0].numero <= 6 ? "TSU" : "ING";
}

const MateriaItem = memo(function MateriaItem({ materia }: { materia: Materia }) {
  return (
    <li className="border-b border-dark-border pb-2 last:border-0">
      <div className="flex items-start gap-2">
        <span
          className={
            materia.clave
              ? "text-sm font-semibold text-amber"
              : "text-sm text-dark-text-muted"
          }
        >
          {materia.nombre}
        </span>
        {materia.clave && (
          <span className="shrink-0 rounded-full bg-amber/55 px-2 py-0.5 text-[10px] font-medium text-dark-bg">
            Clave
          </span>
        )}
      </div>
      {materia.clave && materia.descripcion && (
        <p className="mt-1 text-xs text-dark-text-muted leading-snug">
          {materia.descripcion}
        </p>
      )}
    </li>
  );
});

const CuatrimestreCard = memo(function CuatrimestreCard({ cuatri }: { cuatri: Cuatrimestre }) {
  return (
    <div
      className="w-full lg:w-[min(32%,380px)] h-full rounded-2xl bg-dark-bg-alt/90
                 border border-amber/25 p-6 flex flex-col overflow-hidden
                 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]"
    >
      <span className="text-xl tracking-[0.2em] uppercase text-amber font-semibold">
        {cuatri.numero}° Cuatrimestre
      </span>
      <span className="text-sm text-dark-text-muted mb-4">{cuatri.nivel}</span>
      <ul className="space-y-2 overflow-y-auto pr-1">
        {cuatri.materias.map((materia) => (
          <MateriaItem key={materia.nombre} materia={materia} />
        ))}
      </ul>
    </div>
  );
});

const StudyImagePanel = memo(function StudyImagePanel({ src }: { src?: string }) {
  if (!src) return null;

  return (
    <div
      className="w-full lg:w-[min(24%,280px)] h-40 lg:h-full shrink-0 rounded-2xl overflow-hidden
                 border border-amber/25 relative"
    >
      <img
        src={src}
        alt="Estudiantes en actividades del plan de estudios"
        loading="lazy"
        decoding="async"
        fetchPriority="low"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-dark-bg-alt via-transparent to-transparent" />
    </div>
  );
});

interface StackedCardProps {
  pair: Cuatrimestre[];
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
  image?: string;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const mapRange = (
  value: number,
  inputStart: number,
  inputEnd: number,
  outputStart: number,
  outputEnd: number,
) => {
  const progress = clamp((value - inputStart) / (inputEnd - inputStart), 0, 1);
  return outputStart + (outputEnd - outputStart) * progress;
};

function MobileStudyPlan({
  pairs,
  studyPlanImages,
}: {
  pairs: Cuatrimestre[][];
  studyPlanImages: string[];
}) {
  return (
    <section className="lg:hidden relative overflow-hidden bg-dark-bg-alt px-4 py-16 sm:px-6">
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(244,244,245,0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(244,244,245,0.3) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />
      <div className="relative mx-auto max-w-xl space-y-8">
        {pairs.map((pair, index) => (
          <article
            key={index}
            className="relative overflow-hidden rounded-[1.75rem] border border-amber/30 bg-dark-bg p-5 shadow-[0_20px_50px_-28px_rgba(0,0,0,0.9)] sm:p-7"
          >
            {/* watermark de nivel (TSU / ING) */}
            <span
              className="absolute -top-2 -right-2 text-[5rem] font-black leading-none
                        text-dark-text/[0.09] tracking-[0.2em] select-none pointer-events-none"
              aria-hidden="true"
            >
              {getPrograma(pair)}
            </span>

            <div className="relative mb-6">
              <span className="text-4xl font-black leading-none text-dark-green-secondary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber">
                Plan de Estudios
              </p>
              <h3 className="mt-1 text-xl font-black uppercase leading-tight text-dark-text sm:text-2xl">
                {pair.length === 2
                  ? `Cuatrimestres ${pair[0].numero} - ${pair[1].numero}`
                  : `Cuatrimestre ${pair[0].numero}`}
              </h3>
            </div>

            <div className="relative space-y-4">
              {pair.map((cuatri) => (
                <MobileCuatrimestreCard key={cuatri.numero} cuatri={cuatri} />
              ))}
              <StudyImagePanel src={studyPlanImages[index]} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function MobileCuatrimestreCard({ cuatri }: { cuatri: Cuatrimestre }) {
  return (
    <details className="group rounded-2xl border border-amber/25 bg-dark-bg/60">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 [&::-webkit-details-marker]:hidden">
        <span>
          <span className="block text-xs font-semibold uppercase tracking-wider text-amber">
            {cuatri.numero}° Cuatrimestre
          </span>
          <span className="mt-1 block text-sm text-dark-text-muted">{cuatri.nivel}</span>
        </span>
        <ChevronDown className="shrink-0 text-amber transition-transform duration-200 group-open:rotate-180" size={20} />
      </summary>
      <div className="border-t border-dark-border px-5 pb-5 pt-4">
        <ul className="space-y-2">
          {cuatri.materias.map((materia) => (
            <MateriaItem key={materia.nombre} materia={materia} />
          ))}
        </ul>
      </div>
    </details>
  );
}

function StackedCard({ pair, index, total, scrollYProgress, image }: StackedCardProps) {
  const start = index / total;
  const end = (index + 1) / total;
  const isLast = index === total - 1;

  const nextStart = isLast ? 0 : end;
  const nextEnd = isLast ? 1 : Math.min((index + 2) / total, 1);

  // Una sola suscripción por tarjeta para las propiedades de composición. Antes
  // x y scale se calculaban como MotionValues independientes en cada frame.
  const transform = useTransform(scrollYProgress, (progress) => {
    const x = index === 0 ? 0 : mapRange(progress, start, end, 100, 0);
    const scale = isLast ? 1 : mapRange(progress, nextStart, nextEnd, 1, 0.93);

    return `translateX(${x}%) scale(${scale})`;
  });
  return (
    // Wrapper con gradiente naranja -> verde como "marco" (efecto glow-border)
    <motion.div
      style={{ transform, zIndex: index + 1, willChange: "transform" }}
        className="absolute inset-6 md:inset-16 rounded-[2rem] md:rounded-[2.5rem]
                  shadow-[0_16px_40px_-20px_rgba(0,0,0,0.1)]"
      >
      <div
        className="absolute inset-0 rounded-[2rem] md:rounded-[2.5rem] bg-amber pointer-events-none"
        style={{
          padding: "1.5px",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />

      <div className="relative w-full h-full rounded-[2rem] md:rounded-[2.5rem] bg-dark-bg-alt
                      flex flex-col p-8 md:p-12 overflow-hidden">
        {/* watermark de nivel (TSU / ING) */}
        <span
        className="absolute -top-4 -right-4 md:-top-8 md:-right-6 text-[8rem] md:text-[11rem]
                    font-black leading-none text-dark-text/[0.09] select-none pointer-events-none
                    tracking-[0.2em]"
        aria-hidden="true"
        >
        {getPrograma(pair)}
        </span>

        <div className="mb-8 relative">
          <span
            className="text-6xl md:text-7xl font-black leading-none bg-clip-text text-transparent
                       bg-dark-green-secondary"
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <p className="text-xs md:text-sm uppercase tracking-[0.2em] text-amber font-semibold mt-3">
            Plan de Estudios
          </p>
          <h3 className="text-2xl md:text-4xl font-black text-dark-text uppercase leading-tight mt-1">
            {pair.length === 2
              ? `Cuatrimestres ${pair[0].numero} y ${pair[1].numero}`
              : `Cuatrimestre ${pair[0].numero}`}
          </h3>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row gap-4 xl:gap-6 min-h-0 justify-center items-stretch relative">
          {pair.length === 2 ? (
            <>
              <CuatrimestreCard cuatri={pair[0]} />
              <StudyImagePanel src={image} />
              <CuatrimestreCard cuatri={pair[1]} />
            </>
          ) : (
            <>
              <CuatrimestreCard cuatri={pair[0]} />
              <StudyImagePanel src={image} />
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

const StudyPlanSection = memo(function StudyPlanSection({
  cuatrimestres,
  studyPlanImages,
}: StudyPlanSectionProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  const pairs = useMemo(() => chunkInPairs(cuatrimestres), [cuatrimestres]);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <>
      <MobileStudyPlan pairs={pairs} studyPlanImages={studyPlanImages} />
      <section
        ref={targetRef}
        style={{ height: `${pairs.length * 100}vh` }}
        className="relative hidden bg-dark-bg-alt lg:block"
      >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(244,244,245,0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(244,244,245,0.3) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {pairs.map((pair, i) => (
          <StackedCard
            key={i}
            pair={pair}
            index={i}
            total={pairs.length}
            scrollYProgress={scrollYProgress}
            image={studyPlanImages[i]}
          />
        ))}

        {/* barra de progreso: gradiente combinado */}
        <div className="absolute bottom-4 left-10 right-10 h-1.5 rounded-full bg-dark-border overflow-hidden z-50">
          <motion.div
            style={{ width: progressWidth }}
            className="h-full rounded-full bg-dark-green-secondary"
          />
        </div>
      </div>
      </section>
    </>
  );
});

export default StudyPlanSection;
