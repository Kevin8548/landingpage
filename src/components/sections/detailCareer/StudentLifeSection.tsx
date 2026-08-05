// src/components/sections/detailCareer/StudentLifeSection.tsx
import { memo, useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { StudentLifeImage } from "../../../data/careerDetails";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  images?: StudentLifeImage[];
}

/* ---------------- Image Trail (sigue al cursor) ---------------- */

interface TrailItem {
  id: number;
  x: number;
  y: number;
  src: string;
  alt: string;
  rotation: number;
}

const TRAIL_THRESHOLD = 260; // px que debe moverse el cursor antes de soltar la siguiente imagen
const TRAIL_DURATION = 2000; // ms que dura cada imagen visible antes de desvanecerse
const TRAIL_MAX_ITEMS = 12; // cuántas imágenes conviven en pantalla al mismo tiempo
const TRAIL_ROTATION_RANGE = 20; // grados de rotación aleatoria por imagen

function ImageTrail({
  images,
  className,
}: {
  images: StudentLifeImage[];
  className?: string;
}) {
  const [trail, setTrail] = useState<TrailItem[]>([]);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const nextIndex = useRef(0);
  const idCounter = useRef(0);
  const timeouts = useRef<Set<number>>(new Set());

  const removeItem = useCallback((id: number) => {
    setTrail((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const bounds = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;

      if (lastPos.current) {
        const dx = x - lastPos.current.x;
        const dy = y - lastPos.current.y;
        if (Math.hypot(dx, dy) < TRAIL_THRESHOLD) return;
      }
      lastPos.current = { x, y };

      const img = images[nextIndex.current % images.length];
      nextIndex.current += 1;

      const id = idCounter.current++;
      const rotation = (Math.random() - 0.5) * TRAIL_ROTATION_RANGE * 2;

      setTrail((prev) => {
        const next = [...prev, { id, x, y, src: img.image, alt: img.alt ?? "", rotation }];
        return next.slice(Math.max(0, next.length - TRAIL_MAX_ITEMS));
      });

      const timeout = window.setTimeout(() => {
        timeouts.current.delete(timeout);
        removeItem(id);
      }, TRAIL_DURATION);
      timeouts.current.add(timeout);
    },
    [images, removeItem]
  );

  const handlePointerLeave = useCallback(() => {
    lastPos.current = null;
  }, []);

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`overflow-hidden ${className ?? "relative"}`}
    >
      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
        <AnimatePresence>
          {trail.map((item) => (
            <motion.div
              key={item.id}
              className="absolute h-32 w-24 overflow-hidden rounded-xl border border-[var(--line)] shadow-2xl md:h-54 md:w-72"
              style={{ left: item.x, top: item.y }}
              initial={{ x: "-50%", y: "-50%", scale: 0.7, opacity: 0, rotate: item.rotation }}
              animate={{ x: "-50%", y: "-50%", scale: 1, opacity: 1, rotate: item.rotation }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <img src={item.src} alt={item.alt} className="h-full w-full object-cover" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------------- Mobile ---------------- */

function MobileStudentLife({ images }: { images: StudentLifeImage[] }) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const goToSlide = (index: number) => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    carousel.scrollTo({ left: carousel.clientWidth * index, behavior: "smooth" });
  };

  const updateActiveSlide = () => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    setActiveIndex(Math.round(carousel.scrollLeft / carousel.clientWidth));
  };

  return (
    <section className="relative overflow-hidden bg-dark-bg py-16 lg:hidden">
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(244,244,245,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(244,244,245,0.4) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />
      <div className="absolute -top-28 -left-28 h-72 w-72 rounded-full bg-dark-orange-primary/20 blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-28 -right-28 h-72 w-72 rounded-full bg-dark-green-primary/20 blur-[80px] pointer-events-none" />

      <header className="relative mb-8 px-4 text-center sm:px-6">
        <span className="text-xs tracking-[0.28em] text-dark-orange-primary uppercase">
          Vida Estudiantil
        </span>
        <h2 className="mt-2 text-4xl font-bold tracking-tight bg-gradient-to-r from-dark-orange-primary to-dark-green-primary bg-clip-text text-transparent">
          TIEID
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-xs text-dark-text/60 sm:text-sm">
          Tecnologías de la Información e Innovación Digital
        </p>
      </header>

      <div className="relative px-4 sm:px-6">
        <div
          ref={carouselRef}
          onScroll={updateActiveSlide}
          className="flex snap-x snap-mandatory overflow-x-auto rounded-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((img, index) => (
            <figure
              key={img.image}
              className="relative aspect-[4/3] w-full shrink-0 snap-center overflow-hidden border border-dark-border bg-dark-bg"
            >
              <img
                src={img.image}
                srcSet={img.imageSmall ? `${img.imageSmall} 320w, ${img.image} 640w` : undefined}
                sizes="(max-width: 1024px) 100vw, 640px"
                alt={img.alt ?? `Actividad estudiantil ${index + 1}`}
                loading="lazy"
                decoding="async"
                fetchPriority="low"
                className="h-full w-full object-cover"
              />
            </figure>
          ))}
        </div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goToSlide(Math.max(0, activeIndex - 1))}
              disabled={activeIndex === 0}
              aria-label="Imagen anterior"
              className="absolute left-7 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/45 p-2 text-dark-text backdrop-blur-sm disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => goToSlide(Math.min(images.length - 1, activeIndex + 1))}
              disabled={activeIndex === images.length - 1}
              aria-label="Imagen siguiente"
              className="absolute right-7 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/45 p-2 text-dark-text backdrop-blur-sm disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="relative mt-4 flex justify-center gap-2" aria-label="Navegación del carrusel">
          {images.map((img, index) => (
            <button
              key={img.image}
              type="button"
              onClick={() => goToSlide(index)}
              aria-label={`Ver imagen ${index + 1}`}
              aria-current={activeIndex === index ? "true" : undefined}
              className={`h-1.5 rounded-full transition-all ${
                activeIndex === index ? "w-6 bg-dark-orange-primary" : "w-1.5 bg-dark-text-muted/50"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/* ---------------- Desktop: sección estática + trail de mouse ---------------- */

const StudentLifeSection = memo(function StudentLifeSection({ images }: Props) {
  if (!images || images.length === 0) return null;

  return (
    <>
      <MobileStudentLife images={images} />
      <section className="relative hidden h-screen overflow-hidden bg-dark-bg lg:block">
        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(244,244,245,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(244,244,245,0.4) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute -top-32 -left-32 w-[24rem] h-[24rem] rounded-full bg-dark-orange-primary/10 blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-[24rem] h-[24rem] rounded-full bg-dark-green-primary/10 blur-[80px] pointer-events-none" />

        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 px-6 text-center">
          <span className="text-xs tracking-[0.4em] text-dark-orange-primary uppercase">
            Vida Estudiantil
          </span>
          <span className="text-xs tracking-[0.4em] text-dark-text-muted uppercase">
            Bienvenido a
          </span>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-dark-orange-primary to-dark-green-primary bg-clip-text text-transparent">
            TIEID
          </h2>
          <p className="max-w-sm text-dark-text/60 text-xs md:text-sm">
            Tecnologías de la Información e Innovación Digital
          </p>
          <p className="mt-6 text-[11px] tracking-widest text-dark-text-muted uppercase">
            Mueve el cursor para explorar
          </p>
        </div>

        <ImageTrail images={images} className="absolute inset-0" />
      </section>
    </>
  );
});

export default StudentLifeSection;