// src/components/sections/detail/StudentLifeSection.tsx
import { useState, useMemo } from "react";
import { Pause, Play } from "lucide-react";
import type { StudentLifeImage } from "../../../data/careerDetails";

interface StudentLifeSectionProps {
  images?: StudentLifeImage[];
}

interface Column {
  items: StudentLifeImage[];
  direction: "up" | "down";
  speed: number;
}

// Patrones de aspect-ratio por columna — desincronizados para sentirse orgánico
const SIZE_PATTERNS: Record<"up" | "down", string[]> = {
  up: ["aspect-[3/4]", "aspect-[4/3]", "aspect-[1/1]", "aspect-[16/11]", "aspect-[4/5]"],
  down: ["aspect-[4/3]", "aspect-[4/5]", "aspect-[16/11]", "aspect-[1/1]", "aspect-[3/4]"],
};

function getSizeClass(direction: "up" | "down", indexInOriginal: number) {
  const pattern = SIZE_PATTERNS[direction];
  return pattern[indexInOriginal % pattern.length];
}

function buildColumns(images: StudentLifeImage[]): Column[] {
  // Reparte las imágenes en 2 columnas alternando, para variar el contenido de cada una
  const colA = images.filter((_, i) => i % 2 === 0);
  const colB = images.filter((_, i) => i % 2 !== 0);

  return [
    { items: colA.length ? colA : images, direction: "up", speed: 32 },
    { items: colB.length ? colB : images, direction: "down", speed: 40 },
  ];
}

export default function StudentLifeSection({ images }: StudentLifeSectionProps) {
  const [paused, setPaused] = useState(false);

  const columns = useMemo(() => buildColumns(images ?? []), [images]);

  if (!images || images.length === 0) return null;

  return (
    <section className="py-24 px-6 md:px-16">
      <div className="flex items-end justify-between mb-12 gap-4 flex-wrap">
        <div>
          <h2 className="font-serif text-4xl mb-4">Vida Estudiantil</h2>
          <p className="text-neutral-400 max-w-xl">
            Más que aulas, somos un ecosistema de innovación y comunidad.
          </p>
        </div>

        <button
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? "Reanudar animación" : "Pausar animación"}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 transition-colors hover:bg-neutral-100 shrink-0"
        >
          {paused ? <Play size={16} /> : <Pause size={16} />}
        </button>
      </div>

      <div
        className="relative grid grid-cols-1 sm:grid-cols-2 gap-6 overflow-hidden rounded-xl"
        style={{ height: "min(720px, 80vh)" }}
      >
        {columns.map((col, colIndex) => (
          <div key={colIndex} className="relative h-full overflow-hidden">
            <div
              className={`flex flex-col gap-6 ${
                col.direction === "up" ? "animate-marquee-up" : "animate-marquee-down"
              }`}
              style={{
                animationDuration: `${col.speed}s`,
                animationPlayState: paused ? "paused" : "running",
              }}
            >
              {[...col.items, ...col.items].map((img, i) => {
                const originalIndex = i % col.items.length;
                // Marca la primera aparición de la última imagen del set original como "destacada"
                const isDestacada =
                  i === col.items.length - 1 && colIndex === columns.length - 1;
                const sizeClass = getSizeClass(col.direction, originalIndex);

                return (
                  <div
                    key={`${img.image}-${i}`}
                    className={`rounded-xl overflow-hidden ${sizeClass} shrink-0 ${
                      isDestacada ? "border border-dark-orange-primary" : ""
                    }`}
                  >
                    <img
                      src={img.image}
                      alt={img.alt ?? ""}
                      className="w-full h-full object-cover"
                      loading={colIndex === 0 && i < 2 ? "eager" : "lazy"}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Fades arriba/abajo para que el corte del scroll no se vea seco */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white to-transparent z-10" />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent z-10" />
      </div>
    </section>
  );
}