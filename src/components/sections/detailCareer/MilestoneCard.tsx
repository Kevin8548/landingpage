// src/components/sections/detail/MilestoneCard.tsx
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

interface MilestoneCardProps {
  titulo: string;
  descripcion: string;
  desde: number;
  hasta: number;
}

export default function MilestoneCard({
  titulo,
  descripcion,
  desde,
  hasta,
}: MilestoneCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      className="group relative mb-4 overflow-hidden rounded-xl
                 border-l-4 border-light-green-primary
                 bg-light-green-primary/5
                 px-5 py-4
                 transition-shadow duration-300
                 hover:shadow-[0_10px_28px_-14px_rgba(55,138,83,0.35)]"
    >
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full
                   bg-light-green-primary/10
                   opacity-0 blur-xl transition-opacity duration-500
                   group-hover:opacity-100"
      />

      <div className="relative flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-widest mb-1.5 text-light-green-primary">
        <motion.span
          className="inline-flex"
          animate={{ x: [0, 3, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowRight size={13} />
        </motion.span>
        Continúa con
      </div>

      <h3 className="relative font-serif text-2xl leading-tight mb-1 text-light-text">
        {titulo}
      </h3>

      <p className="relative text-xs text-light-text-muted">
        Cuatrimestres {desde} a {hasta} — {descripcion}
      </p>
    </motion.div>
  );
}