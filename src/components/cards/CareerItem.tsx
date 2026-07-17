import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/Button";
import { ImageCollage } from "../ui/ImageCollage";
import type { Career } from "../../data/careers";

interface CareerItemProps {
  career: Career;
  priority?: boolean;
}

export function CareerItem({ career, priority = false }: CareerItemProps) {
  return (
    // <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center max-w-5xl mx-auto">
    <div className="grid md:grid-cols-2 gap-10 lg:gap-20 items-center max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto">
      <div>
        <div className="flex items-start gap-2 mb-4">
          <span className="text-verde mt-1">{career.tag}</span>
          <h3 className="text-2xl lg:text-3xl font-semibold italic text-verde">
            {career.title}
          </h3>
        </div>

        <div className="h-16" />

        <p className="text-base lg:text-lg text-gray-600 mb-6 max-w-md">
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
        priority={priority}
      />
    </div>
  );
}