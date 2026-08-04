// src/components/sections/FinalCTA.tsx
import { memo, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { motion, useInView, useScroll, useTransform, type MotionValue } from "motion/react";
import { Button } from "../../ui/Button";
import uttBackground from "../../../assets/utt-back.jpg";

interface FinalCTAProps {
  whatsappNumber?: string;
}

interface AnimatedCharProps {
  char: string;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
  rangeStart: number;
  rangeEnd: number;
}

function AnimatedChar({ char, index, total, scrollYProgress, rangeStart, rangeEnd }: AnimatedCharProps) {
  const stagger = 0.55;
  const span = rangeEnd - rangeStart;
  const letterStart = rangeStart + (index / total) * stagger * span;
  const letterEnd = letterStart + (1 - stagger) * span;
  const mid = (letterStart + letterEnd) / 2;

  const x = useTransform(scrollYProgress, [letterStart, mid, letterEnd], ["160%", "0%", "-160%"]);

  const yOffset = ((index * 41) % 91) - 45;
  const y = useTransform(scrollYProgress, [letterStart, mid, letterEnd], [yOffset, 0, -yOffset]);

  const opacity = useTransform(
    scrollYProgress,
    [letterStart, letterStart + span * 0.08, letterEnd - span * 0.08, letterEnd],
    [0, 1, 1, 0]
  );

  return (
    <motion.span style={{ x, y, opacity }} className="inline-block will-change-transform">
      {char === " " ? "\u00A0" : char}
    </motion.span>
  );
}

interface AnimatedWordProps {
  text: string;
  scrollYProgress: MotionValue<number>;
  rangeStart: number;
  rangeEnd: number;
}

function AnimatedWord({ text, scrollYProgress, rangeStart, rangeEnd }: AnimatedWordProps) {
  const chars = Array.from(text);
  return (
    <span
      className="font-serif font-bold leading-none tracking-wide sm:tracking-wider text-white/15"
      style={{
        fontSize: "clamp(2.75rem, 9vw, 7.5rem)",
        textShadow:
          "0 0 25px rgba(249,115,22,0.55), 0 0 60px rgba(249,115,22,0.35), 0 0 100px rgba(249,115,22,0.2)",
      }}
    >
      {chars.map((char, i) => (
        <AnimatedChar
          key={`${char}-${i}`}
          char={char}
          index={i}
          total={chars.length}
          scrollYProgress={scrollYProgress}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
        />
      ))}
    </span>
  );
}

function MobileFinalCTA({ whatsappNumber }: Required<FinalCTAProps>) {
  return (
    <section
      className="relative overflow-hidden bg-dark-bg px-4 py-16 text-center sm:px-6 lg:hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.82), rgba(0, 0, 0, 0.9)), url(${uttBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-dark-orange-primary/20 blur-[90px] pointer-events-none" />
      <div className="relative mx-auto max-w-md">
        <p className="text-xs uppercase tracking-[0.28em] text-dark-orange-primary">Tu futuro comienza aquí</p>
        <h2 className="mt-3 font-serif text-4xl font-bold leading-tight text-dark-text sm:text-5xl">
          ¿Listo para dar el siguiente paso?
        </h2>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-dark-text-muted">
          Conoce el proceso de admisión o resuelve tus dudas directamente por WhatsApp.
        </p>

        <div className="mt-8 flex flex-col gap-3 rounded-2xl bg-dark-bg/70 p-4 backdrop-blur-sm ring-1 ring-white/10">
          <Link to="/aspirantes" className="w-full">
            <Button
              variant="primary"
              size="lg"
              icon={<ArrowRight size={18} />}
              iconPosition="right"
              className="w-full justify-center shadow-[0_0_25px_-5px] shadow-dark-orange-primary/50"
            >
              Información para Aspirantes
            </Button>
          </Link>
          <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="w-full">
            <Button variant="outline" size="lg" icon={<FaWhatsapp size={18} />} iconPosition="left" className="w-full justify-center">
              WhatsApp Directo
            </Button>
          </a>
        </div>

        <p className="mt-7 text-[10px] uppercase tracking-widest text-dark-green-secondary">
          Inscripciones Abiertas · Próximo Ciclo: Septiembre 2026
        </p>
      </div>
    </section>
  );
}

const FinalCTA = memo(function FinalCTA({ whatsappNumber = "5217712345678" }: FinalCTAProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const shouldLoadBackground = useInView(sectionRef, { margin: "2000px 0px" });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const phase1 = { start: 0.05, end: 0.36 };
  const phase2 = { start: 0.44, end: 0.72 };

  const overlayOpacity = useTransform(scrollYProgress, [0.68, 0.82, 1], [0, 1, 1]);

  const buttonsOpacity = useTransform(scrollYProgress, [0.86, 0.97, 1], [0, 1, 1]);
  const buttonsY = useTransform(scrollYProgress, [0.86, 0.97], [40, 0]);
  const buttonsScale = useTransform(scrollYProgress, [0.86, 0.97], [0.85, 1]);
  const buttonsPointerEvents = useTransform(buttonsOpacity, (v) => (v > 0.95 ? "auto" : "none"));

  return (
    <>
      <MobileFinalCTA whatsappNumber={whatsappNumber} />
      <section
        ref={sectionRef}
        className="relative hidden h-[560vh] bg-fixed lg:block"
        style={{
          backgroundImage: shouldLoadBackground
            ? `linear-gradient(rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.8)), url(${uttBackground})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-4 text-center sm:px-6 md:px-16">
        <div className="pointer-events-none select-none absolute inset-0 flex items-center justify-center whitespace-nowrap">
          <AnimatedWord
            text="¿PREPARADO?"
            scrollYProgress={scrollYProgress}
            rangeStart={phase1.start}
            rangeEnd={phase1.end}
          />
        </div>

        <div className="pointer-events-none select-none absolute inset-0 flex items-center justify-center whitespace-nowrap">
          <AnimatedWord
            text="VEN Y CONÓCENOS"
            scrollYProgress={scrollYProgress}
            rangeStart={phase2.start}
            rangeEnd={phase2.end}
          />
        </div>

        <motion.div
          style={{ opacity: overlayOpacity }}
          className="pointer-events-none absolute inset-0 bg-dark-bg/55 z-[5]"
        />

        <motion.div
          style={{
            opacity: buttonsOpacity,
            y: buttonsY,
            scale: buttonsScale,
            pointerEvents: buttonsPointerEvents,
          }}
          className="relative z-10 mb-16 flex w-[92%] flex-col items-center justify-center gap-3 rounded-2xl bg-dark-bg/60 px-5 py-6 backdrop-blur-sm ring-1 ring-white/10 shadow-[0_0_60px_-15px_rgba(0,0,0,0.6)] sm:mb-10 sm:w-auto sm:flex-row sm:gap-4 sm:px-8 sm:py-8 sm:backdrop-blur-md"
        >
          <Link to="/aspirantes" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              icon={<ArrowRight size={18} />}
              iconPosition="right"
              className="w-full justify-center shadow-[0_0_25px_-5px] shadow-dark-orange-primary/50 sm:w-auto"
            >
              Información para Aspirantes
            </Button>
          </Link>

          <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
            <Button 
              variant="secondary" 
              size="lg" 
              icon={<FaWhatsapp size={18} />} 
              iconPosition="left" 
              className="bg-light-orange-primary/5 border-dark-orange-primary/45 w-full justify-center shadow-[0_0_25px_-5px] shadow-dark-green-primary/50 sm:w-auto"
            >
              WhatsApp Directo
            </Button>
          </a>
        </motion.div>

        <p className="absolute bottom-4 z-10 max-w-xs px-4 text-center text-[10px] uppercase tracking-widest text-dark-green-secondary sm:bottom-10 sm:max-w-none sm:text-xs">
          Inscripciones Abiertas · Próximo Ciclo: Septiembre 2026
        </p>
      </div>
      </section>
    </>
  );
});

export default FinalCTA;
