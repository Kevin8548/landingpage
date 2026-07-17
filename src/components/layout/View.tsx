import React, { useState } from 'react';
import { CheckCircle2, Plus, Minus } from 'lucide-react';
import visilyImage from "/src/assets/visily-image.png"; // <-- CORREGIDO: Importamos la imagen como módulo

interface ReasonItem {
  id: number;
  title: string;
  description: string;
}

export const WhyChooseTI: React.FC = () => {
  // Guardamos los IDs de las filas abiertas en un arreglo para que funcionen de forma independiente
  const [openIds, setOpenIds] = useState<number[]>([1]); // Por defecto la primera inicia abierta

  const reasons: ReasonItem[] = [
    {
      id: 1,
      title: 'Diseña app mobiles desde cero',
      description: 'Crea apps nativas y multiplataforma con los frameworks más modernos. Domina el diseño de la interfaz, la lógica del negocio y lanza tus proyectos a las tiendas globales',
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
      // Si ya está abierto, lo removemos (se cierra hacia arriba)
      setOpenIds(openIds.filter(openId => openId !== id));
    } else {
      // Si está cerrado, lo agregamos (se despliega hacia abajo)
      setOpenIds([...openIds, id]);
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-16 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* ── COLUMNA IZQUIERDA: ACORDEÓN ── */}
        <div className="flex flex-col">
          <h2 className="text-3xl md:text-4xl text-gray-950 font-extrabold tracking-tight mb-8">
            ¿Por qué elegir<br />
            <span className="text-gray-900">Tecnologías de la Información(TI)?</span>
          </h2>

          <div className="flex flex-col border-t border-blue-800">
            {reasons.map((item) => {
              const isExpanded = openIds.includes(item.id);
              
              return (
                <div 
                  key={item.id} 
                  className="border-b border-blue-800 py-5 transition-all duration-300"
                >
                  <div className="w-full flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Check verde lateral */}
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                      <span className="text-lg font-bold text-gray-900">
                        {item.title}
                      </span>
                    </div>
                    
                    {/* BOTÓN INTERACTIVO (+ VERDE / - NARANJA) */}
                    <button
                      onClick={() => toggleExpand(item.id)}
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 transform hover:scale-105 ${
                        isExpanded 
                          ? 'border-orange-400 text-orange-400 bg-transparent' // Abierto: Menos Naranja
                          : 'border-emerald-500 text-emerald-500 bg-transparent' // Cerrado: Más Verde
                      }`}
                    >
                      {isExpanded ? (
                        <Minus className="w-4 h-4 stroke-[3]" />
                      ) : (
                        <Plus className="w-4 h-4 stroke-[3]" />
                      )}
                    </button>
                  </div>

                  {/* CONTENEDOR DESPLEGABLE CON ANIMACIÓN DE ALTURA */}
                  <div 
                    className={`grid transition-all duration-300 ease-in-out ${
                      isExpanded 
                        ? 'grid-rows-[1fr] opacity-100 mt-2.5' 
                        : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                    }`}
                  >
                    <div className="overflow-hidden pl-10">
                      <p className="text-sm text-gray-500 leading-relaxed max-w-xl">
                        {item.description}
                      </p>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* ── COLUMNA DERECHA: FOTO DE ALUMNOS ── */}
        <div className="relative w-full h-[450px] md:h-[550px] rounded-2xl overflow-hidden">
          <img 
            src={visilyImage} // <-- CORREGIDO: Usamos la variable importada arriba
            alt="Estudiantes de TI" 
            className="w-full h-full object-cover"
          />
        </div>

      </div>
    </section>
  );
};