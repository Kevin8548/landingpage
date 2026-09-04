// src/components/cards/CareerItem

import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, useTransform, type MotionValue } from "motion/react";
import { Button } from "../ui/Button";
import { ImageCollage } from "../ui/ImageCollage";
import type { Career } from "../../data/careers";

interface CareerItemProps {
  career: Career;
  priority?: boolean;
  progress: MotionValue<number>;
  index: number;
  total: number;
}

export function CareerItem({
  career,
  priority = false,
  progress,
  index,
  total,
}: CareerItemProps) {
  const center = total > 1 ? index / (total - 1) : 0;
  const range = total > 1 ? 1 / (total - 1) : 1;

  const focus = useTransform(
    progress,
    [center - range, center, center + range],
    [0.45, 1, 0.45],
    { clamp: true }
  );

  const scale = useTransform(focus, [0.45, 1], [0.96, 1]);
  // const blur = useTransform(focus, [0.45, 1], [3, 0]);
  // const filter = useTransform(blur, (b) => `blur(${b}px)`);
  const borderOpacity = useTransform(focus, [0.45, 1], [0.06, 0.18]);
  const glow = useTransform(
    focus,
    [0.45, 1],
    ["0 0 0px rgba(255,141,226,0)", "0 0 40px rgba(255,141,226,0.12)"]
  );

  const Icon = career.icon;
  const Tag = career.tag;
  return (
    <div className="grid items-center justify-items-center gap-4 sm:gap-6 md:grid-cols-2 md:gap-10 lg:gap-16 w-full max-w-sm sm:max-w-md md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto">
      <div className="w-full flex flex-col items-center md:items-start">
        {/* Título y tag: libres, fuera del glass */}
        <div className="flex items-center justify-center md:justify-start gap-2 mb-2 sm:mb-3 md:mb-4">
          <Tag className="mt-0.5 text-green-700 md:mt-1 shrink-0" size={28} strokeWidth={2} />
          <h3 className="text-lg font-semibold italic text-verde sm:text-2xl lg:text-3xl leading-snug text-center md:text-left">
            {career.title}
          </h3>
        </div>

        <div className="hidden sm:block sm:h-4 lg:h-8" />

        {/* Glass box: solo descripción + botón */}
        <motion.div
          style={{ scale, opacity: focus, boxShadow: glow }}
          className="relative w-full max-w-[19rem] sm:max-w-xs md:max-w-sm lg:max-w-md overflow-hidden rounded-xl p-3.5 sm:p-5 lg:rounded-2xl lg:p-8"
        >
          <div
            className="absolute inset-0 rounded-2xl bg-black/40"
            style={{ backdropFilter: "blur(20px)" }}
          />
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{ border: "3px solid #1dd75b", opacity: borderOpacity }}
          />

          {/* Icono grande incrustado, esquina superior derecha */}
          {Icon && (
            <Icon
              className="absolute -top-6 -right-6 text-amber/10 pointer-events-none select-none"
              size={150}
              strokeWidth={1}
            />
          )}

          <div className="relative">
            <p className="mb-3 text-xs leading-relaxed text-gray-300/80 sm:mb-4 sm:text-base lg:mb-6 lg:text-lg">
              {career.description}
            </p>

            <Link to={`/carreras/${career.slug}`}>
              <Button
                variant="secondary"
                size="sm"
                icon={<ArrowUpRight size={16} />}
                className="rounded-full bg-amber text-black hover:brightness-110 text-xs sm:text-sm py-1.5 px-3 sm:py-2 sm:px-4"
              >
                Ver plan de estudios
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      <ImageCollage
        imageBack={career.imageBack}
        imageFront={career.imageFront}
        altBack={career.altBack}
        altFront={career.altFront}
        priority={priority}
      />
    </div>
  );
}
