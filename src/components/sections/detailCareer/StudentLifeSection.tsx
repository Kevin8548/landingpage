// src/components/sections/detailCareer/StudentLifeSection.tsx
import { memo, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import type { StudentLifeImage } from "../../../data/careerDetails";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

function MobileStudentLife({ images }: { images: StudentLifeImage[] }) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const goToSlide = (index: number) => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    carousel.scrollTo({ left: carousel.clientWidth * index, behavior: "smooth" });
  };

  const updateActiveSlide = () => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    setActiveIndex(Math.round(carousel.scrollLeft / carousel.clientWidth));
  };

  return (
    <section className="relative overflow-hidden bg-dark-bg py-16 lg:hidden">
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(244,244,245,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(244,244,245,0.4) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />
      <div className="absolute -top-28 -left-28 h-72 w-72 rounded-full bg-dark-orange-primary/20 blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-28 -right-28 h-72 w-72 rounded-full bg-dark-green-primary/20 blur-[80px] pointer-events-none" />

      <header className="relative mb-8 px-4 text-center sm:px-6">
        <span className="text-xs tracking-[0.28em] text-dark-orange-primary uppercase">
          Vida Estudiantil
        </span>
        <h2 className="mt-2 text-4xl font-bold tracking-tight bg-gradient-to-r from-dark-orange-primary to-dark-green-primary bg-clip-text text-transparent">
          TIEID
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-xs text-dark-text/60 sm:text-sm">
          Tecnologías de la Información e Innovación Digital
        </p>
      </header>

      <div className="relative px-4 sm:px-6">
        <div
          ref={carouselRef}
          onScroll={updateActiveSlide}
          className="flex snap-x snap-mandatory overflow-x-auto rounded-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((img, index) => (
            <figure
              key={img.image}
              className="relative aspect-[4/3] w-full shrink-0 snap-center overflow-hidden border border-dark-border bg-dark-bg"
            >
              <img
                src={img.image}
                srcSet={img.imageSmall ? `${img.imageSmall} 320w, ${img.image} 640w` : undefined}
                sizes="(max-width: 1024px) 100vw, 640px"
                alt={img.alt ?? `Actividad estudiantil ${index + 1}`}
                loading="lazy"
                decoding="async"
                fetchPriority="low"
                className="h-full w-full object-cover"
              />
            </figure>
          ))}
        </div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goToSlide(Math.max(0, activeIndex - 1))}
              disabled={activeIndex === 0}
              aria-label="Imagen anterior"
              className="absolute left-7 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/45 p-2 text-dark-text backdrop-blur-sm disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => goToSlide(Math.min(images.length - 1, activeIndex + 1))}
              disabled={activeIndex === images.length - 1}
              aria-label="Imagen siguiente"
              className="absolute right-7 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/45 p-2 text-dark-text backdrop-blur-sm disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="relative mt-4 flex justify-center gap-2" aria-label="Navegación del carrusel">
          {images.map((img, index) => (
            <button
              key={img.image}
              type="button"
              onClick={() => goToSlide(index)}
              aria-label={`Ver imagen ${index + 1}`}
              aria-current={activeIndex === index ? "true" : undefined}
              className={`h-1.5 rounded-full transition-all ${
                activeIndex === index ? "w-6 bg-dark-orange-primary" : "w-1.5 bg-dark-text-muted/50"
              }`}
            />
          ))}
        </div>
      )}
    </section>
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
    <>
      <MobileStudentLife images={images} />
      <section
        ref={containerRef}
        style={{ height: `${images.length * 60}vh` }}
        className="relative hidden bg-dark-bg lg:block"
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
    </>
  );
});

export default StudentLifeSection;
