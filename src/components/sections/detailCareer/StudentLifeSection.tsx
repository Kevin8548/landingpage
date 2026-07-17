// src/components/sections/detail/StudentLifeSection.tsx
import type { StudentLifeImage } from "../../../data/careerDetails";

interface StudentLifeSectionProps {
  images: StudentLifeImage[];
}

export default function StudentLifeSection({ images }: StudentLifeSectionProps) {
  if (images.length === 0) return null;

  const destacada = images[images.length - 1];
  const resto = images.slice(0, images.length - 1);

  return (
    <section className="py-24 px-6 md:px-16">
      <h2 className="font-serif text-4xl mb-4">Vida Estudiantil</h2>
      <p className="text-neutral-400 max-w-xl mb-12">
        Más que aulas, somos un ecosistema de innovación y comunidad.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Imágenes normales */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {resto.map((img) => (
            <div
              key={img.image}
              className="rounded-xl overflow-hidden aspect-[4/3]"
            >
              <img
                src={img.image}
                alt={img.alt ?? ""}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Imagen destacada con borde naranja */}
        <div className="rounded-xl border border-dark-orange-primary overflow-hidden aspect-[4/3] md:aspect-auto">
          <img
            src={destacada.image}
            alt={destacada.alt ?? ""}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}