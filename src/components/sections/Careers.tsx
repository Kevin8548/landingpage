import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { careers } from "../../data/careers";
import { CareerItem } from "../cards/CareerItem";
import { TimelinePath } from "../ui/TimelinePath";

export function Careers() {
  const targetRef = useRef<HTMLDivElement>(null);
  const firstCardRef = useRef<HTMLDivElement>(null);
  const [sectionWidth, setSectionWidth] = useState(1200);

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
    <section ref={targetRef} className="relative" style={{ height: `${careers.length * 100}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden flex items-center">
        <h2 className="absolute top-16 left-8 text-4xl md:text-5xl font-bold italic text-naranja leading-tight z-10">
          Conoce nuestras <br /> carreras
        </h2>

        <motion.div className="flex relative" style={{ x, willChange: "transform" }}>
          <TimelinePath
            sections={careers.length}
            sectionWidth={sectionWidth}
            className="left-0 top-[350px] pointer-events-none"
          />

          {careers.map((career, index) => (
            <div
              key={career.slug}
              ref={index === 0 ? firstCardRef : undefined}
              className={`w-screen flex-shrink-0 px-8 ${index === 0 ? "md:pl-20" : ""} pt-32 relative z-10`}>
              {index === careers.length - 1 && (
                <div className="hidden lg:flex absolute inset-0 items-center justify-end pr-8 md:pr-16 lg:pr-24 pl-[88rem] pointer-events-none select-none z-0 overflow-hidden">
                  <span className="text-[clamp(2rem,3.2vw,2rem)] leading-[1.05] font-extrabold italic uppercase text-right text-naranja opacity-[0.8] max-w-xl">
                    Tecnologías de la Información e Innovación Digital
                  </span>
                </div>
              )}

              <CareerItem career={career} priority={index === 0} />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}