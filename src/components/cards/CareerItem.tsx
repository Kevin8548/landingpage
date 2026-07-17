import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/Button";
import { ImageCollage } from "../ui/ImageCollage";
import type { Career } from "../../data/careers";

interface CareerItemProps {
  career: Career;
}

export function CareerItem({ career }: CareerItemProps) {
  return (
    <div className="grid md:grid-cols-2 gap-10 items-center">
      <div>
        <div className="flex items-start gap-2 mb-4">
          <span className="text-verde mt-1">{career.tag}</span>
          <h3 className="text-xl font-semibold italic text-verde">
            {career.title}
          </h3>
        </div>

        <div className="h-16" /> {/* espacio para que la línea de fondo respire */}

        <p className="text-sm text-gray-600 mb-6 max-w-xs">
          {career.description}
        </p>

        <Link to={`/carreras/${career.slug}`}>
          <Button variant="secondary" size="sm" icon={<ArrowUpRight size={16} />}>
            Ver plan de estudios
          </Button>
        </Link>
      </div>

      <ImageCollage
        imageBack={career.imageBack}
        imageFront={career.imageFront}
        altBack={career.altBack}
        altFront={career.altFront}
      />
    </div>
  );
}