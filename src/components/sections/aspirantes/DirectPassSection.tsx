import { motion } from "motion/react";
import { FiArrowRight } from "react-icons/fi";
import paseDirectoImg from "../../../assets/A-2.jpeg";
import { institutions } from "../../../data/aspirantes";

export const DirectPassSection = () => {
  return (
    <section id="pase-directo" className="relative py-28 px-6 bg-[var(--bg)]">
      <div className="pointer-events-none absolute inset-0 bg-noise opacity-25" />
      <div className="relative max-w-6xl mx-auto">
        <div className="max-w-xl mb-12">
          <span className="font-data text-xs font-medium uppercase tracking-[0.2em] text-[var(--green)]">
            Convenios institucionales
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--ink)] mt-2">
            Pase directo
          </h2>
          <p className="text-[var(--muted)] mt-3 leading-relaxed">
            Ingreso preferente para egresados de instituciones aliadas.
          </p>
        </div>

        <motion.div
          className="relative rounded-2xl overflow-hidden ring-1 ring-[var(--line)] shadow-2xl shadow-[var(--bg)]/60 mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <img
            src={paseDirectoImg}
            alt="Plantel"
            className="w-full h-56 md:h-72 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)]/70 via-[var(--bg)]/10 to-transparent pointer-events-none" />
          <div className="absolute bottom-5 left-6 text-xs font-medium text-[var(--ink)]/80">
            Plantel principal
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {institutions.map(({ id, name, description, logo }, i) => (
            <motion.div
              key={id}
              className="group relative flex flex-col items-start gap-4 p-6 rounded-2xl border border-[var(--line)] bg-[var(--ink)]/[0.02] hover:bg-[var(--ink)]/[0.04] hover:border-[var(--green)]/20 transition-colors"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <span className="font-data absolute top-5 right-6 text-[11px] text-[var(--muted)] group-hover:text-[var(--green)]/60 transition-colors">
                0{i + 1}
              </span>

              {logo ? (
                <motion.img
                  src={logo}
                  alt={name}
                  whileHover={{ scale: 1.1, rotate: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 12 }}
                  className="w-14 h-14 rounded-full object-contain border border-[var(--line)] bg-[var(--ink)]/5 p-2"
                />
              ) : (
                <div className="w-14 h-14 rounded-full border-2 border-dashed border-[var(--muted)]/40 flex items-center justify-center">
                  <FiArrowRight className="w-5 h-5 text-[var(--green)]" />
                </div>
              )}

              <div className="w-full">
                <h3 className="font-display text-xl font-semibold text-[var(--ink)] mb-1.5 group-hover:text-[var(--green)] transition-colors">
                  {name}
                </h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">
                  {description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};