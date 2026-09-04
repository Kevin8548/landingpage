import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform, type Variants } from 'framer-motion';
import { CheckCircle2, Plus, Minus } from 'lucide-react';
import visilyImage from "/src/assets/visily-image.png"; 

interface ReasonItem {
  id: number;
  title: string;
  description: string;
}

// Variantes de entrada simétrica (Izquierda)
const leftColVariants: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

// Variantes para los items del acordeón (stagger secuencial)
const listVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export const WhyChooseTI: React.FC = () => {
  const [openIds, setOpenIds] = useState<number[]>([1]);
  const containerRef = useRef<HTMLElement>(null);

  // ── HOOKS DE SCROLL REACTIVO (PARALLAX) ──
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"], // Desde que entra por abajo hasta que sale por arriba
  });

  // Parallax suave en los textos (suben ligeramente a diferente ritmo)
  const leftColY = useTransform(scrollYProgress, [0, 1], [70, -70]);

  // Parallax en el contenedor de la imagen
  const imageContainerY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  // Parallax interno de la imagen (la foto se desliza dentro del marco)
  const imageInnerY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  // Opacidad y pulso del halo de luz ambiental al hacer scroll
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.2, 0.6, 0.1]);
  const glowScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1.15, 0.9]);

  const reasons: ReasonItem[] = [
    {
      id: 1,
      title: 'Desarrollo Full-Stack e Inteligencia Artificial',
      description: 'Diseña software escalable en la nube e integra algoritmos de IA para crear experiencias interactivas y automatizadas.',
    },
    {
      id: 2,
      title: 'Construye mundos en Realidad Virtual y Aumentada',
      description: 'Crea entornos inmersivos, videojuegos y simuladores interactivos utilizando motores gráficos avanzados.',
    },
    {
      id: 3,
      title: 'Configura la infraestructura que mueve a internet',
      description: 'Domina la administración de servidores, redes digitales, servicios en la nube y esquemas de ciberseguridad.',
    },
    {
      id: 4,
      title: 'Prácticas profesionales directas',
      description: 'Vinculación inmediata con empresas del sector tecnológico para desarrollar proyectos reales.',
    },
    {
      id: 5,
      title: 'Doble titulación garantizada TSU + Ingeniería',
      description: 'Obtén tu título de Técnico Superior Universitario a los dos años y continúa hasta tu Ingeniería.',
    },
  ];

  const toggleExpand = (id: number) => {
    if (openIds.includes(id)) {
      setOpenIds(openIds.filter(openId => openId !== id));
    } else {
      setOpenIds([...openIds, id]);
    }
  };

  return (
    <section 
      ref={containerRef}
      id="por-que-ti" 
      className="relative w-full min-h-screen flex items-center px-6 py-24 overflow-hidden"
    >
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">
        
        {/* ── COLUMNA IZQUIERDA: TEXTOS Y ACORDEÓN CON PARALLAX ── */}
        <motion.div 
          style={{ y: leftColY }}
          className="flex flex-col"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={leftColVariants}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl text-white font-extrabold tracking-tight mb-8 leading-tight">
            ¿Por qué elegir<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-[#FFB703]">
              Tecnologías de la Información (TI)?
            </span>
          </h2>

          <motion.div
            className="flex flex-col border-t border-slate-700/80"
            variants={listVariants}
          >
            {reasons.map((item) => {
              const isExpanded = openIds.includes(item.id);
              
              return (
                <motion.div 
                  key={item.id} 
                  className="border-b border-slate-700/80 py-5 transition-colors duration-200"
                  variants={itemVariants}
                >
                  <div 
                    onClick={() => toggleExpand(item.id)}
                    className="w-full flex items-center justify-between cursor-pointer select-none group"
                  >
                    <div className="flex items-center gap-4 pr-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 transition-transform group-hover:scale-110" />
                      <span className="text-base sm:text-lg font-semibold text-slate-100 group-hover:text-emerald-300 transition-colors">
                        {item.title}
                      </span>
                    </div>
                    
                    {/* Botón interactivo (+/-) */}
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 transform group-hover:scale-110 ${
                        isExpanded 
                          ? 'border-[#FFB703] text-[#FFB703] rotate-180' 
                          : 'border-emerald-400 text-emerald-400 rotate-0' 
                      }`}
                    >
                      {isExpanded ? (
                        <Minus className="w-4 h-4 stroke-[3]" />
                      ) : (
                        <Plus className="w-4 h-4 stroke-[3]" />
                      )}
                    </button>
                  </div>

                  {/* Desplegable animado */}
                  <div 
                    className={`grid transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isExpanded 
                        ? 'grid-rows-[1fr] opacity-100 mt-3' 
                        : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                    }`}
                  >
                    <div className="overflow-hidden pl-10">
                      <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
                        {item.description}
                      </p>
                    </div>
                  </div>

                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* ── COLUMNA DERECHA: FOTO CON PARALLAX Y HALO DE LUZ ── */}
        <div className="relative w-full flex justify-center items-center">
          
          {/* Halo de luz decorativo que pulsa y se mueve con el scroll */}
          <motion.div 
            style={{ 
              opacity: glowOpacity,
              scale: glowScale,
            }}
            className="absolute -inset-4 bg-gradient-to-tr from-emerald-500/30 to-[#FFB703]/25 rounded-3xl blur-3xl -z-10 pointer-events-none"
          />

          {/* Contenedor exterior con desplazamiento Parallax */}
          <motion.div
            style={{ y: imageContainerY }}
            initial={{ opacity: 0, scale: 0.92, x: 40 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full h-[460px] md:h-[560px] rounded-2xl overflow-hidden shadow-2xl shadow-black/60 border border-slate-700/50"
          >
            {/* Imagen interior con Parallax inverso continuo */}
            <motion.img 
              src={visilyImage} 
              alt="Estudiantes de TI" 
              style={{ y: imageInnerY, scale: 1.2 }}
              className="w-full h-full object-[20%_25%] will-change-transform"
            />

            {/* Gradiente sutil inferior sobre la imagen para integración estética */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </motion.div>

        </div>

      </div>
    </section>
  );
};