// components/HeroCarousel.tsx
import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";

interface Slide {
  id: string;
  image: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
}

const slides: Slide[] = [
  {
    id: "software",
    image: "/images/software-hero.webp",
    title: "TSU en Desarrollo y Gestión de Software",
    description: "Diseña y construye soluciones digitales reales desde el primer cuatrimestre.",
    ctaLabel: "Conoce el plan de estudios",
    ctaHref: "/carreras/desarrollo-software",
  },
  {
    id: "redes",
    image: "/images/redes-hero.webp",
    title: "TSU en Redes",
    description: "Aprende a diseñar, administrar y asegurar infraestructuras de red.",
    ctaLabel: "Conoce el plan de estudios",
    ctaHref: "/carreras/redes",
  },
  {
    id: "entornos",
    image: "/images/entornos-hero.webp",
    title: "TSU en Entornos Virtuales",
    description: "Crea experiencias 3D, videojuegos y realidad virtual.",
    ctaLabel: "Conoce el plan de estudios",
    ctaHref: "/carreras/entornos-virtuales",
  },
];

const AUTOPLAY_MS = 6000;

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % slides.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [isPaused, next]);

  const slide = slides[index];

  return (
    <section
      className="relative h-[70vh] min-h-[420px] w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          <motion.div
            className="absolute bottom-16 left-8 max-w-xl text-white"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold md:text-4xl">{slide.title}</h2>
            <p className="mt-3 text-base md:text-lg">{slide.description}</p>
            
              <a href={slide.ctaHref}
              className="mt-5 inline-block rounded-full bg-orange-500 px-6 py-2 font-semibold text-white transition hover:bg-orange-600"
            >
              {slide.ctaLabel}
            </a>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Dots / thumbnails de navegación */}
      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-3">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setIndex(i)}
            aria-label={`Ir a ${s.title}`}
            className={`h-2.5 rounded-full transition-all ${
              i === index ? "w-8 bg-orange-500" : "w-2.5 bg-white/60 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </section>
  );
}