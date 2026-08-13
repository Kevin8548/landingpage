import { motion } from "motion/react";
import heroImg from "../../../assets/A-1.jpg";

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
}

export const HeroSection = ({
  title = "Inscríbete en tu mejor opción para tu futuro",
  subtitle = "Tres ingenierías con un gran impacto que el día de hoy manejan la industria.",
}: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex items-end lg:items-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="Universidad Tecnológica de Tlaxcala"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/65 to-[var(--bg)]/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg)]/90 via-[var(--bg)]/45 to-transparent" />
        <div className="absolute inset-0 bg-noise opacity-20" />
      </div>

      <motion.div
        className="relative z-10 max-w-2xl px-6 md:px-16 py-24 lg:py-0"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="font-data text-[11px] font-medium uppercase tracking-[0.3em] text-[var(--muted)] mb-5"
        >
          Universidad Tecnológica de Tlaxcala
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-[var(--green)]/25 bg-[var(--green)]/[0.08] backdrop-blur-sm"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] animate-pulse" />
          <span className="font-data text-xs font-medium uppercase tracking-[0.15em] text-[var(--green)]">
            Admisión abierta
          </span>
        </motion.div>

        <motion.h1
          className="font-display text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight mb-7 text-[var(--ink)]"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
        >
          {title.split(" ").map((word, i) => (
            <motion.span
              key={i}
              className="inline-block mr-[0.3ch]"
              variants={{
                hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
                visible: {
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                  transition: { duration: 0.5, ease: "easeOut" },
                },
              }}
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        <p className="text-[var(--ink)]/70 text-lg md:text-xl mb-10 max-w-lg leading-relaxed">
          {subtitle}
        </p>

        <p className="text-xs text-[var(--ink)]/40">
          Campus Universidad Tecnológica de Tlaxcala
        </p>
      </motion.div>
    </section>
  );
};