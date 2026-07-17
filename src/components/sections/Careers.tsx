import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { careers } from "../../data/careers";
import { CareerItem } from "../cards/CareerItem";
import { TimelinePath } from "../ui/TimelinePath";

export function Careers() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: targetRef });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 25,
    restDelta: 0.001,
  });

  const x = useTransform(
    smoothProgress,
    [0, 1],
    ["0%", `-${(careers.length - 1) * 100}%`]
  );

  return (
    <section ref={targetRef} className="relative" style={{ height: `${careers.length * 100}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden flex items-center">
        <h2 className="absolute top-16 left-8 text-4xl md:text-5xl font-bold italic text-naranja leading-tight z-10">
          Conoce nuestras <br /> carreras
        </h2>

        <motion.div className="flex relative" style={{ x }}>
          {/* Línea única, continua, cruza TODAS las tarjetas */}
          <TimelinePath
            sections={careers.length}
            className="left-0 top-[350px] pointer-events-none"
          />

          {careers.map((career) => (
            <div key={career.slug} className="w-screen flex-shrink-0 px-8 pt-32 relative z-10">
              <CareerItem career={career} />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}