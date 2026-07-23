// src/components/ui/ScrollRevealCollage.tsx
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

interface CollageItem {
  src: string;
  alt: string;
  className: string; // posición/tamaño con Tailwind (top-, left-, w-, rotate-, etc.)
  range: [number, number]; // en qué % del scroll aparece, ej. [0.1, 0.35]
}

interface ScrollRevealCollageProps {
  items: CollageItem[];
  children?: React.ReactNode; // el texto que va encima/entre las imágenes
}

export function ScrollRevealCollage({ items, children }: ScrollRevealCollageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <div ref={containerRef} className="relative h-[300vh] bg-dark-green-primary">
      {/* la escena se queda fija mientras avanza el scroll interno */}
      <div className="sticky top-0 h-dvh overflow-hidden">
        {items.map((item, i) => (
          <RevealImage key={i} item={item} scrollYProgress={scrollYProgress} />
        ))}
        {children && (
          <div className="relative z-10 h-full flex items-center justify-center px-6">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

function RevealImage({
  item,
  scrollYProgress,
}: {
  item: CollageItem;
  scrollYProgress: import("motion/react").MotionValue<number>;
}) {
  const [start, end] = item.range;

  const opacity = useTransform(scrollYProgress, [start, start + 0.05, end, end + 0.1], [0, 1, 1, 0.6]);
  const y = useTransform(scrollYProgress, [start, end], [40, 0]);
  const scale = useTransform(scrollYProgress, [start, end], [0.9, 1]);

  return (
    <motion.img
      src={item.src}
      alt={item.alt}
      style={{ opacity, y, scale }}
      className={`absolute object-cover ${item.className}`}
    />
  );
}