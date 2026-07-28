// src/components/sections/FinalCTA.tsx
import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Button } from "../../ui/Button";
import uttBackground from "../../../assets/utt-back.jpg";

interface FinalCTAProps {
  whatsappNumber?: string; // ej. "5217712345678" (con lada país, sin +)
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

  // Recorrido más amplio: arranca bien fuera a la derecha, termina bien fuera a la izquierda
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
      className="font-serif font-bold text-[9vw] leading-none tracking-wide text-white/15"
      style={{
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

export default function FinalCTA({ whatsappNumber = "5217712345678" }: FinalCTAProps) {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // FASE 1a (0.05 → 0.36): "¿PREPARADO?" entra desde fuera-derecha y sale fuera-izquierda
  const phase1 = { start: 0.05, end: 0.36 };
  // Gap limpio entre 0.36 y 0.44 -> nada de texto en pantalla
  // FASE 1b (0.44 → 0.72): "¿LISTO?" entra desde fuera-derecha y sale fuera-izquierda
  const phase2 = { start: 0.44, end: 0.72 };

  const overlayOpacity = useTransform(scrollYProgress, [0.68, 0.82, 1], [0, 1, 1]);

  const buttonsOpacity = useTransform(scrollYProgress, [0.86, 0.97, 1], [0, 1, 1]);
  const buttonsY = useTransform(scrollYProgress, [0.86, 0.97], [40, 0]);
  const buttonsScale = useTransform(scrollYProgress, [0.86, 0.97], [0.85, 1]);
  const buttonsPointerEvents = useTransform(buttonsOpacity, (v) => (v > 0.95 ? "auto" : "none"));

  return (
    <section 
        ref={sectionRef} 
        className="relative h-[560vh]"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.8)), url(${uttBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed', 
        }}
      >
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden px-6 md:px-16 text-center">
        {/* "¿PREPARADO?" — sin padding lateral, así usa todo el ancho para el recorrido */}
        <div className="pointer-events-none select-none absolute inset-0 flex items-center justify-center whitespace-nowrap">
          <AnimatedWord
            text="¿PREPARADO?"
            scrollYProgress={scrollYProgress}
            rangeStart={phase1.start}
            rangeEnd={phase1.end}
          />
        </div>

        {/* "¿LISTO?" */}
        <div className="pointer-events-none select-none absolute inset-0 flex items-center justify-center whitespace-nowrap">
          <AnimatedWord
            text="¿LISTO?"
            scrollYProgress={scrollYProgress}
            rangeStart={phase2.start}
            rangeEnd={phase2.end}
          />
        </div>

        <motion.div
          style={{ opacity: overlayOpacity }}
          className="pointer-events-none absolute inset-0 bg-dark-bg z-[5]"
        />

        <motion.div
          style={{
            opacity: buttonsOpacity,
            y: buttonsY,
            scale: buttonsScale,
            pointerEvents: buttonsPointerEvents,
          }}
          className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 px-8 py-8 rounded-2xl bg-dark-bg/60 backdrop-blur-md ring-1 ring-white/10 shadow-[0_0_60px_-15px_rgba(0,0,0,0.6)]"
        >
          <Link to="/aspirantes">
            <Button
              variant="primary"
              size="lg"
              icon={<ArrowRight size={18} />}
              iconPosition="right"
              className="shadow-[0_0_25px_-5px] shadow-dark-orange-primary/50"
            >
              Información para Aspirantes
            </Button>
          </Link>

          <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="lg" icon={<FaWhatsapp size={18} />} iconPosition="left">
              WhatsApp Directo
            </Button>
          </a>
        </motion.div>

        <p className="absolute bottom-10 z-10 text-xs uppercase tracking-widest text-dark-green-secondary">
          Inscripciones Abiertas · Próximo Ciclo: Septiembre 2026
        </p>
      </div>
    </section>
  );
}