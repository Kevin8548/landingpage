// src/components/sections/FinalCTA.tsx
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Button } from "../../ui/Button";

interface FinalCTAProps {
  whatsappNumber?: string; // ej. "5217712345678" (con lada país, sin +)
}

export default function FinalCTA({ whatsappNumber = "5217712345678" }: FinalCTAProps) {
  return (
    <section className="relative py-24 px-6 md:px-16 text-center bg-gradient-to-b from-transparent to-dark-green-primary/10">
      <h2 className="font-serif text-4xl md:text-5xl leading-tight mb-10">
        ¿Listo para compilar
        <br />
        <span className="text-dark-orange-primary">tu futuro?</span>
      </h2>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
        <Link to="/aspirantes">
          <Button variant="primary" size="lg" icon={<ArrowRight size={18} />} iconPosition="right">
            Información para Aspirantes
          </Button>
        </Link>

        <a  href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" size="lg" icon={<FaWhatsapp size={18} />} iconPosition="left">
            WhatsApp Directo
          </Button>
        </a>
      </div>

      <p className="text-xs uppercase tracking-widest text-neutral-400">
        Inscripciones Abiertas · Próximo Ciclo: Septiembre 2026
      </p>
    </section>
  );
}