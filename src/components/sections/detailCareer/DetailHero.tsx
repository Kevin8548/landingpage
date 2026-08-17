// src/components/sections/detail/DetailHero.tsx
import { memo } from "react";
import { motion } from "motion/react";
import { ArrowDown } from "lucide-react";
import { Badge } from "../../ui/Badge";
import { Button } from "../../ui/Button";

const baseUrl = import.meta.env.BASE_URL;
interface DetailHeroProps {
  career: {
    nombre: string;
    quote: string;
  };
  videoSrc?: string;
  posterSrc?: string;
}

const DetailHero = memo(function DetailHero({
  career,
  videoSrc,
  posterSrc,
}: DetailHeroProps) {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden px-4 py-24 sm:min-h-dvh sm:px-6 sm:py-16 md:px-12 lg:px-16">
      {/* Video de fondo */}
      {videoSrc && (
        <video
          className="absolute inset-0 -z-10 h-full w-full object-cover object-[58%_center] sm:object-center"
          poster={posterSrc}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        >
          <source src={`${baseUrl}${videoSrc.replace(".mp4", ".webm")}`} type="video/webm" />
          <source src={`${baseUrl}${videoSrc}`} type="video/mp4" />
        </video>
      )}

      {/* Imagen de respaldo si no hay video */}
      {!videoSrc && posterSrc && (
        <img
          src={posterSrc}
          alt=""
          className="absolute inset-0 -z-10 h-full w-full object-cover object-[58%_center] sm:object-center"
        />
      )}

      {/* Gradiente sutil para todo el fondo */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/85 via-black/60 to-black/15 sm:from-black/70 sm:via-black/35 sm:to-black/10" />

      <div className="grid w-full grid-cols-1 items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-2xl rounded-xl bg-black/35 p-5 backdrop-blur-sm sm:rounded-2xl sm:p-8 md:p-10"
        >
          <div className="mb-4 sm:mb-6">
            <Badge color="orange">Convocatoria Abierta 2026</Badge>
          </div>

          <p className="mb-2 font-sans text-sm font-medium tracking-wide text-light-green-primary sm:text-base">
            Ingeniería en Tecnologías de la Información e Innovación Digital
          </p>

          <h1 className="mb-5 font-serif text-3xl leading-[1.1] text-white drop-shadow-lg sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl [text-wrap:balance]">
            {career.nombre}
          </h1>

          <p className="mb-7 max-w-lg border-l-2 border-dark-green-primary pl-4 text-sm italic leading-relaxed text-neutral-200 sm:mb-10 sm:text-base">
            "{career.quote}"
          </p>

          <div className="flex w-full items-center sm:w-auto">
            <Button
              variant="primary"
              icon={<ArrowDown size={16} />}
              iconPosition="right"
              className="w-full justify-center shadow-[0_0_25px_-5px] shadow-dark-orange-primary/60 sm:w-auto"
            >
              Explora nuestras carreras
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
});

export default DetailHero;
