// src/components/sections/FinalCTA.tsx
import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "../../ui/Button";

interface FinalCTAProps {
  whatsappNumber?: string; // ej. "5217712345678" (con lada país, sin +)
}

export default function FinalCTA({ whatsappNumber = "5217712345678" }: FinalCTAProps) {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // FASE 1 (0.05 → 0.4): el texto cruza la pantalla, se mantiene visible casi todo el trayecto
  const x = useTransform(scrollYProgress, [0.05, 0.4], ["70%", "-70%"]);
  // Se apaga rápido y se queda apagado el resto (puntos extra "de seguro" en 0.5, 1)
  const textOpacity = useTransform(scrollYProgress, [0.05, 0.3, 0.4, 0.5, 1], [1, 1, 0, 0, 0]);

  // FASE 2 (0.35 → 0.55): overlay oscuro cubre todo y se queda cubriendo (punto extra en 1)
  const overlayOpacity = useTransform(scrollYProgress, [0.35, 0.55, 1], [0, 1, 1]);

  // FASE 3 (0.62 → 0.85): aparecen los botones, ya con todo oscurecido detrás
  const buttonsOpacity = useTransform(scrollYProgress, [0.62, 0.85, 1], [0, 1, 1]);
  const buttonsY = useTransform(scrollYProgress, [0.62, 0.85], [40, 0]);
  const buttonsScale = useTransform(scrollYProgress, [0.62, 0.85], [0.85, 1]);

  return (
    // h-[360vh]: más "steps" de scroll, más tiempo para cada fase
    <section ref={sectionRef} className="relative h-[360vh] bg-light-bg">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden px-6 md:px-16 text-center">
        {/* Texto que cruza la pantalla y luego se apaga para siempre */}
        <motion.div
          style={{ x, opacity: textOpacity }}
          className="pointer-events-none select-none absolute inset-0 flex items-center justify-center whitespace-nowrap px-[20vw]"
        >
          <span
            className="font-serif font-bold text-[9vw] leading-none tracking-wide text-black/15"
            style={{
              textShadow:
                "0 0 25px rgba(249,115,22,0.55), 0 0 60px rgba(249,115,22,0.35), 0 0 100px rgba(249,115,22,0.2)",
            }}
          >
            ¿LISTO&nbsp;PARA&nbsp;COMPILAR&nbsp;TU&nbsp;FUTURO?
          </span>
        </motion.div>

        {/* Overlay oscuro que cubre todo y se mantiene cubierto hasta el final */}
        <motion.div
          style={{ opacity: overlayOpacity }}
          className="pointer-events-none absolute inset-0 bg-dark-bg z-[5]"
        />

        {/* Botones, aparecen ya con todo oscurecido detrás */}
        <motion.div
          style={{ opacity: buttonsOpacity, y: buttonsY, scale: buttonsScale }}
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

        {/* Siempre visible, pegado abajo, por encima de todo */}
        <p className="absolute bottom-10 z-10 text-xs uppercase tracking-widest text-neutral-400">
          Inscripciones Abiertas · Próximo Ciclo: Septiembre 2026
        </p>
      </div>
    </section>
  );
}