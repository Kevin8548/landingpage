// src/components/sections/detail/DetailHero.tsx
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

export default function DetailHero({
  career,
  videoSrc,
  posterSrc,
}: DetailHeroProps) {
  return (
    <section className="relative min-h-dvh flex items-center px-6 md:px-16 py-16 overflow-hidden">
      {/* Video de fondo */}
      {videoSrc && (
        <video
          className="absolute inset-0 w-full h-full object-cover -z-10"
          poster={posterSrc}
          autoPlay
          muted
          loop
          playsInline
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
          className="absolute inset-0 w-full h-full object-cover -z-10"
        />
      )}

      {/* Gradiente sutil para todo el fondo */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/10 -z-10" />

      <div className="grid grid-cols-1 items-center w-full">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-black/25 backdrop-blur-sm rounded-2xl p-8 md:p-10 max-w-2xl"
        >
          <div className="mb-6">
            <Badge color="orange">Convocatoria Abierta 2026</Badge>
          </div>

          <h1 className="font-serif text-4xl md:text-5xl leading-tight mb-6 text-white drop-shadow-lg">
            {career.nombre}
          </h1>

          <p className="italic text-neutral-200 border-l-2 border-dark-green-primary pl-4 mb-10 max-w-lg">
            "{career.quote}"
          </p>

          <div className="flex items-center gap-4">
            <Button variant="primary" icon={<ArrowDown size={16} />} iconPosition="right">
              Explora nuestras carreras
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}