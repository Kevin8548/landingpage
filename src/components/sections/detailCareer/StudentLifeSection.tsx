// src/components/sections/detailCareer/StudentLifeSection.tsx
import { memo, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import type { StudentLifeImage } from "../../../data/careerDetails";

interface Props {
  images?: StudentLifeImage[];
}

// Tamaño de caja único para todas las fotos (mismo tamaño de entrada y salida)
const BOX_SIZE = { width: "20%", height: "20%" };

// Genera la posición de cada foto sobre una espiral: el ángulo avanza por
// índice y el radio crece poco a poco, así van "saliendo en secuencia"
// desde el centro hacia afuera en vez de saltar a puntos random.
const SPIRAL_TURNS = 2.2; // cuántas vueltas completas da la espiral en total (aumentado para más espaciado)
const SPIRAL_START_ANGLE = -90; // empieza arriba
const RADIUS_MIN = 5; // % de radio para la primera imagen (reducido)
const RADIUS_MAX = 50; // % de radio para la última imagen (aumentado para más distancia)

function getSpiralSlot(index: number, total: number) {
  const t = total <= 1 ? 0 : index / (total - 1);
  const angleDeg = SPIRAL_START_ANGLE + t * 360 * SPIRAL_TURNS;
  const angleRad = (angleDeg * Math.PI) / 180;
  const radius = RADIUS_MIN + t * (RADIUS_MAX - RADIUS_MIN);

  // Centro del contenedor + desplazamiento polar (ajustado a la relación 16:9
  // aproximada de la pantalla para que la espiral no se vea aplastada)
  const centerX = 50;
  const centerY = 45; // Reducido de 50 a 45 para mover todo más arriba
  const left = centerX + Math.cos(angleRad) * radius * 1.15;
  const top = centerY + Math.sin(angleRad) * radius;

  // La rotación de cada tarjeta sigue el ángulo de la espiral (efecto orgánico)
  const rotate = Math.sin(angleRad) * 8;

  return {
    top: `${top}%`,
    left: `${left}%`,
    rotate,
  };
}

const OVERLAP_COUNT = 3;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

function makeRange(...values: number[]): number[] {
  const clamped = values.map(clamp01);
  for (let i = 1; i < clamped.length; i++) {
    if (clamped[i] <= clamped[i - 1]) {
      clamped[i] = Math.min(1, clamped[i - 1] + 0.0001);
    }
  }
  return clamped;
}

interface FlyImageProps {
  img: StudentLifeImage;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}

function ImageHighlight({
  scrollYProgress,
  fadeInEnd,
  peakEnd,
  fadeOutStart,
  alt,
}: {
  scrollYProgress: MotionValue<number>;
  fadeInEnd: number;
  peakEnd: number;
  fadeOutStart: number;
  alt: string;
}) {
  const opacity = useTransform(
    scrollYProgress,
    makeRange(fadeInEnd, peakEnd, fadeOutStart),
    [0, 1, 0]
  );

  return (
    <motion.p
      style={{ opacity }}
      className="absolute -bottom-7 left-0 right-0 text-center text-[11px] text-dark-text-muted truncate px-1"
    >
      {alt}
    </motion.p>
  );
}

const FlyImage = memo(function FlyImage({
  img,
  index,
  total,
  scrollYProgress,
}: FlyImageProps) {
  const step = 1 / total;
  const duration = step * OVERLAP_COUNT;
  const rawStart = index * step;

  const [start, fadeInEnd, peakEnd, fadeOutStart, end] = makeRange(
    rawStart,
    rawStart + duration * 0.15,
    rawStart + duration * 0.5,
    rawStart + duration * 0.8,
    rawStart + duration
  );

  const slot = getSpiralSlot(index, total);

  const transform = useTransform(scrollYProgress, (progress) => {
    const duration = end - start;
    const t = Math.min(1, Math.max(0, (progress - start) / duration));
    const peak = (peakEnd - start) / duration;
    const beforePeak = t <= peak;
    const localProgress = beforePeak ? t / peak : (t - peak) / (1 - peak);
    const scale = beforePeak ? 0.25 + localProgress * 0.75 : 1 + localProgress * 0.8;
    const rotate = beforePeak
      ? slot.rotate * 3 + localProgress * (slot.rotate - slot.rotate * 3)
      : slot.rotate + localProgress * (slot.rotate * 0.4 - slot.rotate);
    const y = beforePeak ? 40 - localProgress * 40 : -10 * localProgress;

    return `translateY(${y}px) rotate(${rotate}deg) scale(${scale})`;
  });
  const opacity = useTransform(
    scrollYProgress,
    [start, fadeInEnd, fadeOutStart, end],
    [0, 1, 1, 0]
  );

  return (
    <motion.div
      style={{
        ...BOX_SIZE,
        top: slot.top,
        left: slot.left,
        transform,
        opacity,
        position: "absolute",
        contain: "paint",
      }}
      className="rounded-xl overflow-hidden"
    >
      <div className="w-full h-full rounded-xl overflow-hidden bg-dark-bg">
        <img
          src={img.image}
          srcSet={img.imageSmall ? `${img.imageSmall} 320w, ${img.image} 640w` : undefined}
          sizes="(max-width: 640px) 20vw, 20vw"
          alt={img.alt ?? ""}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          className="w-full h-full object-cover"
        />
      </div>

      {img.alt && (
        <ImageHighlight
          scrollYProgress={scrollYProgress}
          fadeInEnd={fadeInEnd}
          peakEnd={peakEnd}
          fadeOutStart={fadeOutStart}
          alt={img.alt}
        />
      )}
    </motion.div>
  );
});

function VerticalProgress({
  total,
  scrollYProgress,
}: {
  total: number;
  scrollYProgress: MotionValue<number>;
}) {
  const fillScale = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const activeIndex = useTransform(scrollYProgress, (v) =>
    Math.min(total - 1, Math.floor(v * total))
  );

  return (
    <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20 flex items-center gap-3">
      <motion.span className="text-xs font-mono text-dark-text-muted tabular-nums">
        <motion.span className="text-dark-orange-primary">
          {useTransform(activeIndex, (i) => String(i + 1).padStart(2, "0"))}
        </motion.span>
        {` / ${String(total).padStart(2, "0")}`}
      </motion.span>
      <div className="relative w-[2px] h-32 rounded-full bg-dark-border overflow-hidden">
        <motion.div
          style={{ scaleY: fillScale }}
          className="absolute inset-0 origin-top rounded-full bg-gradient-to-b from-dark-orange-primary to-dark-green-primary"
        />
      </div>
    </div>
  );
}

const StudentLifeSection = memo(function StudentLifeSection({ images }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const introOpacity = useTransform(scrollYProgress, [0, 0.08, 0.14], [1, 1, 0]);
  const introY = useTransform(scrollYProgress, [0, 0.14], [0, -20]);

  const glowOrangeOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.2, 0.06, 0.2]);
  const glowGreenOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.06, 0.2, 0.06]);

  if (!images || images.length === 0) return null;

  return (
    <section
      ref={containerRef}
      style={{ height: `${images.length * 60}vh` }}
      className="relative bg-dark-bg"
    >
      <div
        className="sticky top-0 h-screen overflow-hidden"
        style={{ perspective: "900px" }}
      >
        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(244,244,245,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(244,244,245,0.4) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <motion.div
          style={{ opacity: glowOrangeOpacity }}
          className="absolute -top-32 -left-32 w-[24rem] h-[24rem] rounded-full bg-dark-orange-primary blur-[80px] pointer-events-none"
        />
        <motion.div
          style={{ opacity: glowGreenOpacity }}
          className="absolute -bottom-32 -right-32 w-[24rem] h-[24rem] rounded-full bg-dark-green-primary blur-[80px] pointer-events-none"
        />

        <div className="pointer-events-none absolute inset-0 bg-dark-bg/40 z-10" />

        <motion.div
          style={{ opacity: introOpacity, y: introY }}
          className="absolute inset-0 flex flex-col items-center justify-center z-30 px-6 pointer-events-none text-center gap-2"
        >
          <span className="text-[20px] md:text-xs tracking-[0.4em] text-dark-orange-primary uppercase">
            Vida Estudiantil
          </span>
          <span className="text-[10px] md:text-xs tracking-[0.4em] text-dark-text-muted uppercase">
            Bienvenido a
          </span>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-dark-orange-primary to-dark-green-primary bg-clip-text text-transparent">
            TIEID
          </h2>
          <p className="max-w-sm text-dark-text/60 text-xs md:text-sm">
            Tecnologías de la Información e Innovación Digital
          </p>
        </motion.div>

        {images.map((img, i) => (
          <FlyImage
            key={img.image}
            img={img}
            index={i}
            total={images.length}
            scrollYProgress={scrollYProgress}
          />
        ))}

        <VerticalProgress total={images.length} scrollYProgress={scrollYProgress} />
      </div>
    </section>
  );
});

export default StudentLifeSection;
