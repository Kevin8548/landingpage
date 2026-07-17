// src/components/sections/detail/DetailHero.tsx
import { motion } from "motion/react";
import { ArrowDown } from "lucide-react";
import { Badge } from "../../ui/Badge";
import { Button } from "../../ui/Button";
import { ImageCollage } from "../../ui/ImageCollage";

interface DetailHeroProps {
  career: {
    nombre: string;
    quote: string;
  };
  imageBack: string;
  imageFront: string;
}

export default function DetailHero({
  career,
  imageBack,
  imageFront,
}: DetailHeroProps) {
  return (
    <section className="relative px-6 md:px-16 pt-24 pb-16 grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-12 items-center">
      {/* Columna izquierda: texto */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="mb-6">
          <Badge color="orange" withDot>
            Convocatoria Abierta 2026
          </Badge>
        </div>

        <h1 className="font-serif text-4xl md:text-5xl leading-tight mb-6">
          {career.nombre}
        </h1>

        <p className="italic text-neutral-300 border-l-2 border-dark-green-primary pl-4 mb-10 max-w-lg">
          "{career.quote}"
        </p>

        <div className="flex items-center gap-4">
          <Button variant="primary" icon={<ArrowDown size={16} />} iconPosition="right">
            Explora nuestras carreras
          </Button>
        </div>
      </motion.div>

      {/* Columna derecha: collage de imágenes */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
      >
        <ImageCollage
          imageBack={imageBack}
          imageFront={imageFront}
          altBack={`${career.nombre} - imagen 1`}
          altFront={`${career.nombre} - imagen 2`}
        />
      </motion.div>
    </section>
  );
}