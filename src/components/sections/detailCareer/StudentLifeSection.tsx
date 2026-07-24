// src/components/sections/detailCareer/StudentLifeSection.tsx
import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, type MotionValue } from "framer-motion";
import type { StudentLifeImage } from "../../../data/careerDetails";

interface Props {
  images?: StudentLifeImage[];
}

// Posiciones del mosaico — se repiten cíclicamente si hay más imágenes que slots
const SLOTS = [
  { top: "10%", left: "36%", width: "20%", height: "24%" },
  { top: "6%", left: "66%", width: "24%", height: "20%" },
  { top: "40%", left: "8%", width: "18%", height: "24%" },
  { top: "46%", left: "58%", width: "16%", height: "16%" },
  { top: "70%", left: "32%", width: "15%", height: "15%" },
  { top: "64%", left: "70%", width: "18%", height: "18%" },
];

interface FlyImageProps {
  img: StudentLifeImage;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}

// Cuántas imágenes se traslapan a la vez. Súbelo para que se vean más
// juntas, bájalo a 1 para que aparezcan estrictamente una por una.
const OVERLAP_COUNT = 3;

// Asegura que cada breakpoint quede dentro de [0,1]
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

function FlyImage({ img, index, total, scrollYProgress }: FlyImageProps) {
  const step = 1 / total;
  const duration = step * OVERLAP_COUNT;
  const rawStart = index * step;

  // Todos los breakpoints se calculan como fracciones de la MISMA duración,
  // en orden ascendente, y se pasan juntos a makeRange para garantizar
  // que ninguno quede menor que el anterior.
  const [start, fadeInEnd, growEnd, fadeOutStart, end] = makeRange(
    rawStart,
    rawStart + duration * 0.15, // fadeInEnd
    rawStart + duration * 0.55, // growEnd
    rawStart + duration * 0.8,  // fadeOutStart
    rawStart + duration         // end
  );

  const scale = useTransform(scrollYProgress, [start, growEnd, end], [0.2, 1, 2.2]);

  // Blur en las 3 fases: entra desenfocada -> se enfoca en el pico -> se
  // desenfoca de nuevo (más leve) al salir, como si pasara muy cerca.
  const blurPx = useTransform(scrollYProgress, [start, growEnd, end], [2, 0, 1.5]);
  const filter = useTransform(blurPx, (v) => `blur(${v}px)`);

  const opacity = useTransform(
    scrollYProgress,
    [start, fadeInEnd, fadeOutStart, end],
    [0, 1, 1, 0]
  );

  const slot = SLOTS[index % SLOTS.length];

  return (
    <motion.div
      style={{ ...slot, scale, opacity, position: "absolute", willChange: "transform, opacity, filter", filter }}
      className="rounded-md overflow-hidden shadow-xl relative"
    >
      <img src={img.image} alt={img.alt ?? ""} className="w-full h-full object-cover" />
      {/* <div className="absolute inset-0 bg-orange-500/60 mix-blend-multiply pointer-events-none" /> */}
      <div className="absolute inset-0 bg-black/60 pointer-events-none" />
    </motion.div>
  );
}

function ProgressDot({
  index,
  total,
  scrollYProgress,
}: {
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}) {
  const step = 1 / total;
  const a = clamp01(index * step);
  const b = clamp01(index * step + step / 2);
  const c = clamp01((index + 1) * step);
  const opacity = useTransform(scrollYProgress, [a, b, c], [0.3, 1, 0.3]);
  return <motion.span style={{ opacity }} className="w-2 h-2 rounded-full bg-white shrink-0" />;
}

export default function StudentLifeSection({ images }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
    mass: 0.5,
  });

  if (!images || images.length === 0) return null;

  return (
    <section
      ref={containerRef}
      style={{ height: `${images.length * 60}vh` }}
      className="relative bg-[#0b3d2e]"
    >
      <div className="sticky top-0 h-screen overflow-hidden" style={{ perspective: "800px" }}>
        <div className="pointer-events-none absolute inset-0 bg-[#0b3d2e]/30 z-10" />

        <div className="absolute inset-0 flex items-center justify-center z-20 px-8 pointer-events-none">
          <p className="max-w-2xl text-center text-white/70 text-xl leading-relaxed">
            Más que aulas, somos un ecosistema de innovación y comunidad.
          </p>
        </div>

        {images.map((img, i) => (
          <FlyImage key={img.image} img={img} index={i} total={images.length} scrollYProgress={smoothProgress} />
        ))}

        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20 max-h-[60vh] overflow-hidden">
          {images.map((_, i) => (
            <ProgressDot key={i} index={i} total={images.length} scrollYProgress={smoothProgress} />
          ))}
        </div>
      </div>
    </section>
  );
}