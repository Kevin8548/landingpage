// src/components/sections/detail/WhyChooseSection.tsx
import { memo, useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import StatCard from "../../cards/StatCard";

interface Stat {
  icon: string;
  label: string;
  value: string;
  desc: string;
}

interface WhyChooseSectionProps {
  stats: Stat[];
}

function RevealWord({
  word,
  index,
  total,
  progress,
}: {
  word: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const rangeStart = 0;
  const rangeEnd = 0.15;
  const step = (rangeEnd - rangeStart) / total;
  const start = rangeStart + index * step;
  const end = start + step * 1.5;

  const opacity = useTransform(progress, [start, end], [0, 1]);
  const y = useTransform(progress, [start, end], [30, 0]);
  const blur = useTransform(progress, [start, end], [6, 0]);
  const filter = useTransform(blur, (v) => `blur(${v}px)`);

  return (
    <motion.span style={{ opacity, y, filter }} className="inline-block">
      {word}
    </motion.span>
  );
}

function ScrollRevealTitle({
  text,
  progress,
}: {
  text: string;
  progress: MotionValue<number>;
}) {
  const words = text.split(" ");

  return (
    <h2 className="mb-3 flex flex-wrap gap-x-2 font-serif text-3xl leading-tight sm:mb-4 sm:gap-x-3 sm:text-4xl">
      {words.map((word, i) => (
        <RevealWord
          key={i}
          word={word}
          index={i}
          total={words.length}
          progress={progress}
        />
      ))}
    </h2>
  );
}

function ScrollRevealParagraph({
  text,
  progress,
  startAt,
}: {
  text: string;
  progress: MotionValue<number>;
  startAt: number;
}) {
  const start = startAt;
  const end = startAt + 0.08;

  const opacity = useTransform(progress, [start, end], [0, 1]);
  const y = useTransform(progress, [start, end], [20, 0]);

  return (
    <motion.p style={{ opacity, y }} className="max-w-2xl text-sm leading-relaxed text-neutral-400 sm:text-base">
      {text}
    </motion.p>
  );
}

function ConnectorLine({ progress }: { progress: MotionValue<number> }) {
  const pathLength = useTransform(progress, [0.2, 0.95], [0, 1]);

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none -z-10"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <motion.path
        d="M 2 4 
          C 25 2, 10 30, 32 30 
          S 90 50, 38 55 
          S 65 65, 55 72 
          S 85 82, 90 94"
        stroke="var(--color-dark-green-primary)"
        strokeWidth="0.30"
        strokeDasharray="0.5 1.5"
        fill="none"
        style={{ pathLength }}
        opacity={0.9}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function StaircaseCard({
  stat,
  index,
  total,
  totalSteps,
  progress,
}: {
  stat: Stat;
  index: number;
  total: number;
  totalSteps: number;
  progress: MotionValue<number>;
}) {
  const segmentStart = index / totalSteps;
  const segmentEnd = (index + 1) / totalSteps;

  const y = useTransform(progress, [segmentStart, segmentEnd], [-300, 0]);
  const rotate = useTransform(
    progress,
    [segmentStart, segmentEnd],
    [index % 2 === 0 ? -6 : 6, 0]
  );
  const opacity = useTransform(
    progress,
    [segmentStart, segmentStart + (segmentEnd - segmentStart) * 0.3],
    [0, 1]
  );

  const horizontalPercent = total > 1 ? (index / (total - 1)) * 78 : 0;
  const verticalPercent = total > 1 ? (index / (total - 1)) * 65 : 0;

  return (
    <div
      style={{
        position: "absolute",
        left: `${horizontalPercent}%`,
        top: `${verticalPercent}%`,
      }}
    >
      <motion.div
        style={{ y, opacity, rotate }}
        className="w-[38vw] md:w-[20vw] max-w-xs"
      >
        <div
          className="relative rounded-2xl p-5 backdrop-blur-md"
          style={{
            background: "var(--glass)",
            border: "1px solid var(--line)",
          }}
        >
          <StatCard {...stat} />
        </div>
      </motion.div>
    </div>
  );
}

// ── Versión móvil: sin pin de scroll, sin parallax, lista apilada simple ──
function MobileStatCard({ stat, index }: { stat: Stat; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.05 }}
      className="rounded-xl p-4 backdrop-blur-sm"
      style={{
        background: "var(--glass)",
        border: "1px solid var(--line)",
      }}
    >
      <StatCard {...stat} />
    </motion.div>
  );
}

const WhyChooseSection = memo(function WhyChooseSection({ stats }: WhyChooseSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const bufferSteps = 2;
  const totalSteps = stats.length + bufferSteps;

  return (
    <>
      {/* Desktop / tablet grande (md+): staircase con scroll-pin y parallax */}
      <div
        ref={containerRef}
        className="relative hidden md:block"
        style={{ height: `${totalSteps * 60 + 100}vh` }}
      >
        <div className="sticky top-0 h-dvh flex flex-col px-6 md:px-16 py-16 overflow-hidden">
          <div className="mb-8">
            <ScrollRevealTitle
              text="¿Por qué elegir esta carrera?"
              progress={scrollYProgress}
            />
            <ScrollRevealParagraph
              text="Formamos líderes técnicos capaces de transformar ideas complejas en soluciones digitales robustas y escalables."
              progress={scrollYProgress}
              startAt={0.15}
            />
          </div>

          <div className="relative flex-1 min-h-0">
            <ConnectorLine progress={scrollYProgress} />
            {stats.map((stat, i) => (
              <StaircaseCard
                key={stat.label}
                stat={stat}
                index={i}
                total={stats.length}
                totalSteps={totalSteps}
                progress={scrollYProgress}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Móvil (< md): lista apilada, sin pin ni parallax, solo fade-in */}
      <div className="md:hidden px-6 py-16">
        <h2 className="mb-3 font-serif text-3xl leading-tight">
          ¿Por qué elegir esta carrera?
        </h2>
        <p className="mb-8 text-sm leading-relaxed text-neutral-400">
          Formamos líderes técnicos capaces de transformar ideas complejas en
          soluciones digitales robustas y escalables.
        </p>

        <div className="flex flex-col gap-4">
          {stats.map((stat, i) => (
            <MobileStatCard key={stat.label} stat={stat} index={i} />
          ))}
        </div>
      </div>
    </>
  );
});

export default WhyChooseSection;