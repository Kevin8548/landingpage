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
    <div className="grid justify-items-center gap-5 md:grid-cols-2 md:justify-items-stretch md:gap-10 lg:gap-20 max-w-[18rem] sm:max-w-md md:max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto">
      <div className="w-full">
        {/* Título y tag: libres, fuera del glass */}
        <div className="flex items-start gap-2 mb-3 md:mb-4">
          <Tag className="mt-0.5 text-verde md:mt-1" size={18} strokeWidth={2} />
          <h3 className="text-xl font-semibold italic text-verde sm:text-2xl lg:text-3xl">
            {career.title}
          </h3>
        </div>

        <div className="h-4 sm:h-6 lg:h-12" />

        {/* Glass box: solo descripción + botón */}
        <motion.div
          style={{ scale, opacity: focus, boxShadow: glow }}
          className="relative max-w-[15rem] overflow-hidden rounded-xl p-4 sm:max-w-xs sm:p-5 lg:rounded-2xl lg:p-8"
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
              className="absolute -top-6 -right-6 text-white/[0.11] pointer-events-none select-none"
              size={150}
              strokeWidth={1}
            />
          )}

          <div className="relative">
            <p className="mb-4 text-sm leading-relaxed text-gray-300/80 sm:text-base lg:mb-6 lg:text-lg">
              {career.description}
            </p>

            <Link to={`/carreras/${career.slug}`}>
              <Button
                variant="secondary"
                size="sm"
                icon={<ArrowUpRight size={16} />}
                className="rounded-full bg-dark-orange-primary text-black hover:brightness-110"
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
