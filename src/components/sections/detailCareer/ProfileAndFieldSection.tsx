// src/components/sections/detail/ProfileAndFieldSection.tsx
import { memo, useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent, MotionValue } from "motion/react";
import { Check, Briefcase } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { iconMap } from "../../../lib/iconMap";


interface ProfileAndFieldSectionProps {
  title: string;
  icon?: LucideIcon;
  titleImage?: string;
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
    color === "orange" ? "border-amber" : "border-dark-green-primary";
  const textColor =
    color === "orange" ? "text-amber" : "text-dark-green-primary";

  return (
    <li className="flex items-start gap-3">
      <span
        className={`w-5 h-5 rounded-full border ${borderColor} flex items-center justify-center shrink-0 mt-0.5`}
      >
        <Check size={12} className={textColor} />
      </span>
      <span className="md:text-lg text-neutral-200">{item}</span>
    </li>
  );
}

function VerticalLabel({ text }: { text: string }) {
  return (
    <span
      style={{ writingMode: "vertical-rl" }}
      className="rotate-180 font-serif text-base md:text-lg tracking-widest text-neutral-300 whitespace-nowrap"
    >
      {text}
    </span>
  );
}

/* ---------------- Sequential horizontal accordion ---------------- */

type PanelType = "title" | "points" | "image";

interface Panel {
  id: string;
  type: PanelType;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  items?: string[];
  image?: string;
  color?: "orange" | "green";
}

// Los paneles con listas necesitan una ventana de lectura más amplia que los
// paneles visuales. Los pesos se normalizan al total del recorrido de scroll.
const getPanelScrollWeight = (panel: Panel) => {
  if (panel.type === "points") return 2;
  return panel.type === "title" ? 0.75 : 0.625;
};

function SequentialPanel({
  panel,
  start,
  end,
  isLast,
  scrollYProgress,
}: {
  panel: Panel;
  start: number;
  end: number;
  isLast: boolean;
  scrollYProgress: MotionValue<number>;
}) {
  const duration = end - start;
  const s0 = start;
  const s1 = s0 + duration * 0.3;
  const s2 = end - duration * 0.35;
  const s3 = end;

  const flexGrow = useTransform(
    scrollYProgress,
    [s0, s1, s2, s3],
    isLast ? [1, 6, 6, 6] : [1, 6, 6, 1.6]
  );

  const panelOpacity = useTransform(
    scrollYProgress,
    [s0, s1, s2, s3],
    isLast ? [0.15, 1, 1, 1] : [0.15, 1, 1, 0.45]
  );

  // estado discreto: ¿está "abierto" ahora? (mismo umbral que usa el flexGrow para terminar de expandirse)
  const [isOpen, setIsOpen] = useState(false);
  const isOpenRef = useRef(false);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const nextIsOpen = v >= s1 && v < s3;

    // El listener se ejecuta en cada frame de scroll, pero React solo necesita
    // renderizar cuando el panel realmente cambia entre abierto y cerrado.
    if (nextIsOpen !== isOpenRef.current) {
      isOpenRef.current = nextIsOpen;
      setIsOpen(nextIsOpen);
    }
  });

  return (
    <motion.div
      style={{ flexGrow, opacity: panelOpacity }}
      className="relative h-full min-w-0 flex-1 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--glass)]"
    >
      {(panel.type === "image" || panel.type === "title") && panel.image && (
        <img
          src={panel.image}
          alt={panel.title}
          loading="lazy"
          decoding="async"
          className={`absolute inset-0 h-full w-full object-cover ${
            panel.type === "title" ? "opacity-25" : ""
          }`}
        />
      )}
      {panel.type === "image" && panel.image && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/10" />
      )}
      {panel.type === "title" && panel.image && (
        <div className="absolute inset-0 bg-black/70" />
      )}

      <motion.div
        animate={{ opacity: isOpen ? 0 : 1 }}
        transition={{ duration: 0.25, delay: isOpen ? 0 : 0.25 }}
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <VerticalLabel text={panel.title} />
      </motion.div>

      <motion.div
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.25, delay: isOpen ? 0.35 : 0 }}
        className={`absolute inset-0 flex min-w-[260px] flex-col items-center justify-center p-6 text-center md:p-10 ${
          isOpen ? "" : "pointer-events-none"
        }`}
      >
        {panel.type === "title" && (
          <>
            {panel.icon && (
              <panel.icon
                className="mb-6 h-12 w-12 md:h-16 md:w-16 text-amber"
                strokeWidth={1.9}
              />
            )}
            <h2 className="max-w-[14ch] text-center font-serif text-3xl md:text-5xl tracking-[0.1em] leading-tight md:max-w-[18ch]">
              {panel.title}
            </h2>
          </>
        )}

        {panel.type === "points" && (
          <div className="w-full text-left">
            <h3 className="font-serif text-2xl md:text-5xl mb-6 whitespace-nowrap">{panel.title}</h3>
            <ul className="flex flex-col gap-4">
              {panel.items?.map((item) => (
                <ChecklistItem key={item} item={item} color={panel.color ?? "orange"} />
              ))}
            </ul>
          </div>
        )}

        {panel.type === "image" && (
          <h3 className="font-serif text-2xl md:text-3xl text-white whitespace-nowrap self-start mt-auto">
            {panel.title}
          </h3>
        )}
      </motion.div>
    </motion.div>
  );
}


function SequentialProfileAccordion({ panels }: { panels: Panel[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const totalWeight = panels.reduce(
    (total, panel) => total + getPanelScrollWeight(panel),
    0,
  );
  const ranges = panels.reduce<{ start: number; end: number }[]>((result, panel) => {
    const start = result.at(-1)?.end ?? 0;
    const end = start + getPanelScrollWeight(panel) / totalWeight;
    return [...result, { start, end }];
  }, []);

  return (
    <div ref={ref} className="relative" style={{ height: `${panels.length * 100}vh` }}>
      <div className="sticky top-0 flex h-screen items-stretch gap-3 overflow-hidden px-6 py-24 md:px-16">
        {panels.map((panel, index) => (
            <SequentialPanel
              key={panel.id}
              panel={panel}
              start={ranges[index].start}
              end={ranges[index].end}
              isLast={index === panels.length - 1}
              scrollYProgress={scrollYProgress}
            />
          ))}
      </div>
    </div>
  );
}

/* ---------------- Campo Laboral ---------------- */

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
      <div className="sticky top-0 h-screen bg-dark-bg overflow-hidden flex flex-col items-center justify-center px-6 md:px-16">
        <motion.h2
          style={{ y: titleY, opacity: titleOpacity }}
          className="font-serif text-4xl mb-16 md:mb-24 tracking-[0.1em] text-center text-amber uppercase"
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
  scrollYProgress: MotionValue<number>;
  start: number;
  end: number;
}) {
  const opacity = useTransform(scrollYProgress, [start, end], [0, 1]);
  const scale = useTransform(scrollYProgress, [start, end], [0.85, 1]);
  const Icon = iconMap[job.icon] ?? Briefcase;

  return (
    <motion.div
      style={{ opacity, scale }}
      className="relative w-[260px] h-[260px] md:w-[300px] md:h-[300px] rounded-full border border-amber-500/30 bg-[var(--glass)] flex flex-col items-center justify-center text-center px-8 shrink-0"
    >
      <div className="w-11 h-11 rounded-md bg-dark-orange-primary/10 border border-amber flex items-center justify-center mb-4">
        <Icon size={20} className="text-amber" />
      </div>
      <span className="font-serif text-xl md:text-2xl leading-tight mb-3">{job.titulo}</span>
      <span className="text-[11px] tracking-widest uppercase text-neutral-400 leading-relaxed">
        {job.desc}
      </span>
    </motion.div>
  );
}

/* ---------------- Mobile (sin cambios) ---------------- */

function MobileProfileBlock({
  title,
  items,
  image,
  color,
  quote,
}: {
  title: string;
  items: string[];
  image?: string;
  color: "orange" | "green";
  quote?: string;
}) {
  return (
    <article className="rounded-2xl border border-[var(--line)] bg-[var(--glass)] p-5 sm:p-7">
      {image && (
        <img
          src={image}
          alt={title}
          loading="lazy"
          decoding="async"
          className="mb-6 aspect-[4/3] w-full rounded-xl object-cover"
        />
      )}
      <h2 className="font-serif text-3xl sm:text-4xl">{title}</h2>
      <ul className="mt-6 flex flex-col gap-4">
        {items.map((item) => (
          <ChecklistItem key={item} item={item} color={color} />
        ))}
      </ul>
      {quote && (
        <p className="mt-7 border-l-2 border-amber pl-4 text-sm italic text-neutral-400">
          {quote}
        </p>
      )}
    </article>
  );
}

function MobileProfileAndField({
  perfilIngreso,
  perfilEgreso,
  imagenIngreso,
  imagenEgreso,
  campoLaboral,
}: {
  perfilIngreso?: string[];
  perfilEgreso: string[];
  imagenIngreso?: string;
  imagenEgreso?: string;
  campoLaboral: ProfileAndFieldSectionProps["campoLaboral"];
}) {
  return (
    <section className="relative overflow-hidden bg-dark-bg px-4 py-16 sm:px-6 lg:hidden">
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-dark-orange-primary/15 blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-dark-green-primary/15 blur-[80px] pointer-events-none" />
      <div className="relative mx-auto max-w-3xl space-y-8">
        <h2 className="text-center font-serif text-3xl sm:text-4xl">
          Perfil de Ingreso <span className="text-neutral-500">·</span> Perfil de Egreso
        </h2>

        {perfilIngreso && (
          <MobileProfileBlock
            title="Perfil de Ingreso"
            items={perfilIngreso}
            image={imagenIngreso}
            color="orange"
          />
        )}
        <MobileProfileBlock
          title="Perfil de Egreso"
          items={perfilEgreso}
          image={imagenEgreso}
          color="green"
          quote="Nuestros graduados no solo dominan lenguajes de programación; dominan el arte de resolver problemas mediante arquitectura lógica y diseño eficiente."
        />

        <div className="pt-4">
          <h2 className="mb-7 text-center font-serif text-3xl sm:text-4xl text-amber">Campo Laboral</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {campoLaboral.map((job) => {
              const Icon = iconMap[job.icon] ?? Briefcase;
              return (
                <article
                  key={job.titulo}
                  className="rounded-2xl border border-[var(--line)] bg-[var(--glass)] p-6 text-center"
                >
                  <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-md border border-amber bg-amber/10">
                    <Icon size={20} className="text-amber" />
                  </div>
                  <h3 className="font-serif text-xl leading-tight">{job.titulo}</h3>
                  <p className="mt-3 text-[11px] uppercase tracking-widest leading-relaxed text-neutral-400">
                    {job.desc}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Main ---------------- */

const ProfileAndFieldSection = memo(function ProfileAndFieldSection({
  title,
  icon,
  titleImage,
  perfilIngreso,
  perfilEgreso,
  perfilImages,
  campoLaboral,
}: ProfileAndFieldSectionProps) {
  const imagenIngreso = perfilImages?.[0];
  const imagenEgreso = perfilImages?.[1];

  const panels: Panel[] = [
    { id: "titulo", type: "title", title, icon, image: titleImage },
    { id: "points-ingreso", type: "points", title: "Perfil de Ingreso", items: perfilIngreso ?? [], color: "green" },
    { id: "img-ingreso", type: "image", title: "Perfil de Ingreso", image: imagenIngreso },
    { id: "points-egreso", type: "points", title: "Perfil de Egreso", items: perfilEgreso, color: "orange" },
    { id: "img-egreso", type: "image", title: "Perfil de Egreso", image: imagenEgreso },
  ];

  return (
    <section>
      <MobileProfileAndField
        perfilIngreso={perfilIngreso}
        perfilEgreso={perfilEgreso}
        imagenIngreso={imagenIngreso}
        imagenEgreso={imagenEgreso}
        campoLaboral={campoLaboral}
      />
      <div className="hidden lg:block">
        <SequentialProfileAccordion panels={panels} />
        <CampoLaboralBlock campoLaboral={campoLaboral} />
      </div>
    </section>
  );
});

export default ProfileAndFieldSection;
