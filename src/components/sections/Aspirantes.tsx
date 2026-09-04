import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import heroImg from "../../assets/utt.jpg"

// Antes esta sección era la página completa de Aspirantes (hero, fechas
// clave, pase directo, CTA). Todo eso ahora vive en `src/pages/Aspirantes.tsx`
// como una página aparte (con modo edición para admins). Esta sección solo
// funciona como teaser dentro del Home, invitando a entrar a la página real.
export const Aspirantes = () => {
  return (
    <section className="relative py-28 px-6 overflow-hidden bg-[var(--bg)]">
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt=" Universidad Tecnológica de Tlaxcala"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/80 to-[var(--bg)]/90" />
      </div>

      <motion.div
        className="relative z-10 max-w-2xl mx-auto text-center"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <span className="font-data text-xs font-medium uppercase tracking-[0.2em] text-[var(--green)]">
          Admisión abierta
        </span>
        <h2 className="font-display text-3xl md:text-5xl font-bold text-[var(--ink)] mt-4 mb-5">
          Inscríbete en tu mejor opción para tu futuro
        </h2>
        <p className="text-[var(--ink)]/70 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
          Conoce las fechas clave del proceso de admisión y los convenios de
          pase directo disponibles. 
        </p>

        <motion.div
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className="inline-block"
        >
          <Link
            to="/aspirantes"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[var(--ink)] text-[var(--bg)] text-sm font-semibold shadow-lg shadow-black/20"
          >
            Ver proceso de admisión
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
};