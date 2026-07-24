// components/sections/StudyPlanSection.tsx
import { useRef } from "react";
import { motion, useTransform, type MotionValue } from "motion/react";
import { useScroll } from "motion/react";
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

function MateriaItem({ materia }: { materia: Materia }) {
  return (
    <li className="border-b border-dark-border pb-2 last:border-0">
      <div className="flex items-start gap-2">
        <span
          className={
            materia.clave
              ? "text-sm font-semibold text-dark-orange-primary"
              : "text-sm text-dark-text-muted"
          }
        >
          {materia.nombre}
        </span>
        {materia.clave && (
          <span className="shrink-0 rounded-full bg-dark-orange-primary/15 px-2 py-0.5 text-[10px] font-medium text-dark-green-secondary">
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
}

function CuatrimestreCard({ cuatri }: { cuatri: Cuatrimestre }) {
  return (
    <div
      className="w-full md:w-[380px] h-full rounded-2xl bg-dark-bg/60
                 border border-dark-orange-primary/25 p-6 flex flex-col overflow-hidden
                 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]"
    >
      <span className="text-xs uppercase tracking-wider text-dark-orange-primary font-semibold">
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
}

function StudyImagePanel({ src }: { src?: string }) {
  if (!src) return null;

  return (
    <div
      className="w-full md:w-[280px] h-40 md:h-full shrink-0 rounded-2xl overflow-hidden
                 border border-dark-orange-primary/25 relative"
    >
      <img
        src={src}
        alt="Estudiantes en actividades del plan de estudios"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/50 via-transparent to-transparent" />
    </div>
  );
}

interface StackedCardProps {
  pair: Cuatrimestre[];
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
  image?: string;
}

function StackedCard({ pair, index, total, scrollYProgress, image }: StackedCardProps) {
  const start = index / total;
  const end = (index + 1) / total;
  const isLast = index === total - 1;

  const nextStart = isLast ? 0 : end;
  const nextEnd = isLast ? 1 : Math.min((index + 2) / total, 1);

  const x = useTransform(
    scrollYProgress,
    index === 0 ? [0, 0.0001] : [start, end],
    index === 0 ? ["0%", "0%"] : ["100%", "0%"]
  );

  const scale = useTransform(
    scrollYProgress,
    [nextStart, nextEnd],
    isLast ? [1, 1] : [1, 0.93]
  );
  const dim = useTransform(
    scrollYProgress,
    [nextStart, nextEnd],
    isLast ? [0, 0] : [0, 0.55]
  );

  return (
    // Wrapper con gradiente naranja -> verde como "marco" (efecto glow-border)
    <motion.div
      style={{ x, scale, zIndex: index + 1 }}
      className="absolute inset-6 md:inset-16 rounded-[2rem] md:rounded-[2.5rem] p-[1.5px]
                 bg-dark-orange-primary
                 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.8)]"
    >
      <div className="relative w-full h-full rounded-[2rem] md:rounded-[2.5rem] bg-dark-bg
                       flex flex-col p-8 md:p-12 overflow-hidden">
        {/* overlay de profundidad: oscuro, no un color plano */}
        <motion.div
          style={{ opacity: dim }}
          className="absolute inset-0 bg-black pointer-events-none"
        />

        {/* glow interno sutil en verde, esquina opuesta al acento naranja */}
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-dark-green-primary/10 blur-[100px] pointer-events-none" />

        <div className="mb-8 relative">
          <span
            className="text-6xl md:text-7xl font-black leading-none bg-clip-text text-transparent
                       bg-dark-green-secondary"
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <p className="text-xs md:text-sm uppercase tracking-[0.2em] text-dark-orange-primary font-semibold mt-3">
            Plan de Estudios
          </p>
          <h3 className="text-2xl md:text-4xl font-black text-dark-text uppercase leading-tight mt-1">
            {pair.length === 2
              ? `Cuatrimestres ${pair[0].numero} y ${pair[1].numero}`
              : `Cuatrimestre ${pair[0].numero}`}
          </h3>
        </div>

        <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0 justify-center items-stretch relative">
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

export default function StudyPlanSection({
  cuatrimestres,
  studyPlanImages,
}: StudyPlanSectionProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  const pairs = chunkInPairs(cuatrimestres);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      ref={targetRef}
      style={{ height: `${pairs.length * 100}vh` }}
      className="relative bg-dark-bg"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.15] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(244,244,245,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(244,244,245,0.4) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* glows de fondo en verde */}
        <div className="absolute -top-40 -left-40 w-[36rem] h-[36rem] rounded-full bg-dark-orange-primary/20 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-[36rem] h-[36rem] rounded-full bg-dark-green-primary/25 blur-[120px] pointer-events-none" />

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
            className="h-full rounded-full bg-gradient-to-r from-dark-orange-primary via-dark-orange-secondary to-dark-green-primary"
          />
        </div>
      </div>
    </section>
  );
}