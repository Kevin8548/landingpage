import { motion } from "motion/react";
import heroImg from "../../../assets/buildingP.jpg";

interface HeroSectionProps {
  title: string;
  subtitle: string;
  editMode?: boolean;
  onTitleChange?: (value: string) => void;
  onSubtitleChange?: (value: string) => void;
}

export const HeroSection = ({
  title,
  subtitle,
  editMode = false,
  onTitleChange,
  onSubtitleChange,
}: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center lg:justify-end overflow-hidden px-6 md:px-16">
      {/* Background Layer */}
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="Universidad Tecnológica de Tlaxcala"
          className="w-full h-full object-cover"
        />
        {/* Gradientes más complejos para dar profundidad */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg)]/80 via-[var(--bg)]/40 to-transparent lg:hidden" />
        <div className="absolute inset-0 hidden lg:block bg-gradient-to-l from-[var(--bg)] via-[var(--bg)]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-noise opacity-15" />
      </div>

      {/* Content Container */}
      <motion.div
        className="relative z-10 max-w-3xl w-full lg:w-1/2 flex flex-col"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-3 mb-8 w-fit px-4 py-2 rounded-full border border-[var(--green)]/30 bg-[var(--green)]/[0.05] backdrop-blur-md"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--green)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--green)]"></span>
          </span>
          <span className="font-data text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--green)]">
            Proceso de Admisión 2026
          </span>
        </motion.div>

        {/* Title Section */}
        {editMode ? (
          <textarea
            value={title}
            onChange={(e) => onTitleChange?.(e.target.value)}
            className="font-display text-5xl md:text-7xl font-extrabold leading-tight tracking-tighter mb-6 text-[var(--ink)] bg-white/5 border-2 border-dashed border-[var(--orange)]/50 rounded-2xl p-4 w-full focus:outline-none"
          />
        ) : (
          <motion.h1 
            className="font-display text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tighter mb-6 text-[var(--ink)]"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {title}
          </motion.h1>
        )}

        {/* Subtitle Section */}
        {editMode ? (
          <textarea
            value={subtitle}
            onChange={(e) => onSubtitleChange?.(e.target.value)}
            className="text-[var(--ink)]/80 text-xl mb-8 bg-white/5 border border-dashed border-[var(--ink)]/30 rounded-xl p-4 w-full"
          />
        ) : (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-[var(--ink)]/70 text-lg md:text-xl mb-10 max-w-xl leading-relaxed border-l-2 border-[var(--green)]/30 pl-6"
          >
            {subtitle}
          </motion.p>
        )}

        {/* Action Buttons (CTAs) - Esto llena mucho el espacio */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap gap-4 mb-12"
        >
          <button className="px-8 py-4 bg-[var(--green)] text-white font-bold rounded-full hover:scale-105 transition-transform shadow-lg shadow-[var(--green)]/20">
            Ver Carreras
          </button>
          <button className="px-8 py-4 bg-transparent border border-[var(--ink)]/20 text-[var(--ink)] font-bold rounded-full hover:bg-[var(--ink)]/[0.03] transition-colors">
            Ver Oferta Educativa
          </button>
        </motion.div>

        {/* Stats / Quick Info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="py-8 border-t border-[var(--ink)]/10"
        >
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] mb-6 font-bold">
            Instituciones que nos respaldan:
          </p>
          <div className="flex gap-8 opacity-40 grayscale hover:grayscale-0 transition-all">
            {/* Reemplaza con tus iconos/logos */}
            <div className="h-8 w-20 bg-[var(--muted)] rounded-md animate-pulse" title="Logo SEP" />
            <div className="h-8 w-20 bg-[var(--muted)] rounded-md animate-pulse" title="Logo Acreditadora" />
            <div className="h-8 w-20 bg-[var(--muted)] rounded-md animate-pulse" title="Empresa Aliada" />
          </div>
        </motion.div>

        <footer className="mt-4">
           <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-[var(--muted)]">
            Campus El Carmen Xalpatlahuaya, Tlaxcala
          </p>
        </footer>
      </motion.div>
    </section>
  );
};