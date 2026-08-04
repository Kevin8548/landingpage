// src/components/sections/detail/ProfileAndFieldSection.tsx
import { memo, useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Check } from "lucide-react";
import { iconMap } from "../../../lib/iconMap";
import { Briefcase } from "lucide-react";
// import JobCard from "../../cards/JobCard";


interface ProfileAndFieldSectionProps {
  perfilIngreso?: string[];
  perfilEgreso: string[];
  perfilImages?: string[]; 
  campoLaboral: { icon: string; titulo: string; desc: string }[];
}

function ChecklistItem({
  item,
  color,
}: {
  item: string;
  color: "orange" | "green";
}) {
  const borderColor =
    color === "orange" ? "border-dark-orange-primary" : "border-dark-green-primary";
  const textColor =
    color === "orange" ? "text-dark-orange-primary" : "text-dark-green-primary";

  return (
    <li className="flex items-start gap-3">
      <span
        className={`w-5 h-5 rounded-full border ${borderColor} flex items-center justify-center shrink-0 mt-0.5`}
      >
        <Check size={12} className={textColor} />
      </span>
      <span className="text-sm text-neutral-200">{item}</span>
    </li>
  );
}

function IngresoBlock({
  items,
  imagen,
}: {
  items: string[];
  imagen?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const textX = useTransform(scrollYProgress, [0, 0.3], [-60, 0]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  const imgScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.2, 1, 1.1]);
  const imgY = useTransform(scrollYProgress, [0, 1], [-60, 60]);

  return (
    <div ref={ref} className="relative h-[200vh]">
      <div className="sticky top-0 h-screen overflow-hidden flex items-center px-6 md:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center w-full">
          <motion.div style={{ x: textX, opacity: textOpacity }}>
            <h2 className="font-serif text-4xl mb-8">Perfil de Ingreso</h2>
            <ul className="flex flex-col gap-4">
              {items.map((item) => (
                <ChecklistItem key={item} item={item} color="orange" />
              ))}
            </ul>
          </motion.div>

          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-[var(--line)] order-first md:order-last bg-[var(--glass)]">
            {imagen && (
              <motion.img
                src={imagen}
                alt="Perfil de Ingreso"
                loading="lazy"
                decoding="async"
                fetchPriority="low"
                style={{ scale: imgScale, y: imgY }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EgresoBlock({
  items,
  imagen,
}: {
  items: string[];
  imagen?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const textX = useTransform(scrollYProgress, [0, 0.3], [60, 0]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  const imgScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.2, 1, 1.1]);
  const imgY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <div ref={ref} className="relative h-[200vh]">
      <div className="sticky top-0 h-screen overflow-hidden flex items-center px-6 md:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center w-full">
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-[var(--line)] order-first bg-[var(--glass)]">
            {imagen && (
              <motion.img
                src={imagen}
                alt="Perfil de Egreso"
                loading="lazy"
                decoding="async"
                fetchPriority="low"
                style={{ scale: imgScale, y: imgY }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
          </div>

          <motion.div style={{ x: textX, opacity: textOpacity }} className="order-last">
            <h2 className="font-serif text-4xl mb-8">Perfil de Egreso</h2>
            <ul className="flex flex-col gap-4 mb-8">
              {items.map((item) => (
                <ChecklistItem key={item} item={item} color="green" />
              ))}
            </ul>
            <p className="italic text-neutral-400 border-l-2 border-dark-orange-primary pl-4">
              "Nuestros graduados no solo dominan lenguajes de programación;
              dominan el arte de resolver problemas mediante arquitectura
              lógica y diseño eficiente."
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}


function CampoLaboralBlock({
  campoLaboral,
}: {
  campoLaboral: ProfileAndFieldSectionProps["campoLaboral"];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const titleY = useTransform(scrollYProgress, [0, 0.15], [40, 0]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  const count = campoLaboral.length;

  return (
    <div ref={ref} className="relative h-[200vh]">
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col items-center justify-center px-6 md:px-16">
        <motion.h2
          style={{ y: titleY, opacity: titleOpacity }}
          className="font-serif text-4xl mb-16 md:mb-24 text-center"
        >
          Campo Laboral
        </motion.h2>

        <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-6 w-full max-w-6xl">
          {campoLaboral.map((job, i) => {
            const start = 0.1 + (i / count) * 0.6;
            const end = start + 0.3;
            return (
              <div key={job.titulo} className="flex items-center">
                <CampoLaboralCircle
                  job={job}
                  scrollYProgress={scrollYProgress}
                  start={start}
                  end={end}
                />
                {i < count - 1 && (
                  <span className="hidden md:block w-10 h-px bg-[var(--line)] mx-2" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CampoLaboralCircle({
  job,
  scrollYProgress,
  start,
  end,
}: {
  job: ProfileAndFieldSectionProps["campoLaboral"][number];
  scrollYProgress: import("motion/react").MotionValue<number>;
  start: number;
  end: number;
}) {
  const opacity = useTransform(scrollYProgress, [start, end], [0, 1]);
  const scale = useTransform(scrollYProgress, [start, end], [0.85, 1]);
  const Icon = iconMap[job.icon] ?? Briefcase;

  return (
    <motion.div
      style={{ opacity, scale }}
      className="relative w-[260px] h-[260px] md:w-[300px] md:h-[300px] rounded-full border border-[var(--line)] bg-[var(--glass)] flex flex-col items-center justify-center text-center px-8 shrink-0"
    >
      <div className="w-11 h-11 rounded-md bg-dark-orange-primary/10 border border-dark-orange-primary flex items-center justify-center mb-4">
        <Icon size={20} className="text-dark-orange-primary" />
      </div>
      <span className="font-serif text-xl md:text-2xl leading-tight mb-3">
        {job.titulo}
      </span>
      <span className="text-[11px] tracking-widest uppercase text-neutral-400 leading-relaxed">
        {job.desc}
      </span>
    </motion.div>
  );
}
const ProfileAndFieldSection = memo(function ProfileAndFieldSection({
  perfilIngreso,
  perfilEgreso,
  perfilImages,
  campoLaboral,
}: ProfileAndFieldSectionProps) {
  const imagenIngreso = perfilImages?.[0];
  const imagenEgreso = perfilImages?.[1];

  return (
    <section>
      {perfilIngreso && (
        <IngresoBlock items={perfilIngreso} imagen={imagenIngreso} />
      )}
      <EgresoBlock items={perfilEgreso} imagen={imagenEgreso} />
      <CampoLaboralBlock campoLaboral={campoLaboral} />
    </section>
  );
});

export default ProfileAndFieldSection;
