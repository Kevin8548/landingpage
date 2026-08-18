import { motion } from "motion/react";
import { FiArrowRight, FiDownload } from "react-icons/fi";

export const FinalCTA = () => {
  return (
    <section className="relative py-20 px-6 overflow-hidden bg-[var(--bg)]">
      <div className="pointer-events-none absolute inset-0 bg-noise opacity-10" />
      <div className="relative max-w-5xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-8 text-center md:text-left">
        <div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--ink)] mb-3">
            ¿Listo para dar el siguiente paso?
          </h2>
          <p className="text-[var(--ink)]/70 max-w-md mx-auto md:mx-0">
            Inicia tu proceso de admisión y asegura tu lugar para el ciclo 2026.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 shrink-0">
          <motion.button
            type="button"
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-[var(--ink)] text-[var(--bg)] text-sm font-semibold shadow-lg shadow-black/20"
          >
            Ver oferta educativa
            <FiArrowRight className="w-4 h-4" />
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="flex items-center gap-2 px-7 py-3.5 rounded-full border border-[var(--ink)]/40 text-[var(--ink)] text-sm font-medium hover:bg-[var(--ink)]/10 transition-colors"
          >
            <FiDownload className="w-4 h-4" />
            Descargar información
          </motion.button>
        </div>
      </div>
    </section>
  );
};