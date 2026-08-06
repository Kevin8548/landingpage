import { useState } from "react";

type Categoria = "todos" | "software" | "redes" | "entornos";

interface Proyecto {
  id: number;
  categoria: "software" | "redes" | "entornos";
  titulo: string;
  descripcion: string;
}

const PROYECTOS_DATA: Proyecto[] = [
  {
    id: 1,
    categoria: "software",
    titulo: "Sistemas Web de Gestión Escolar",
    descripcion:
      "Desarrolla plataformas administrativas dinámicas optimizadas con arquitectura moderna y bases de datos escalables.",
  },
  {
    id: 2,
    categoria: "software",
    titulo: "Aplicaciones Móviles Nativas",
    descripcion:
      "Crea herramientas móviles para iOS y Android integrando geolocalización, notificaciones e IA aplicada.",
  },
  {
    id: 3,
    categoria: "redes",
    titulo: "Infraestructura de Redes Seguras",
    descripcion:
      "Diseña e implementa topologías complejas, enrutamiento avanzado y políticas de ciberseguridad industrial.",
  },
  {
    id: 4,
    categoria: "redes",
    titulo: "Servidores y Virtualización Cloud",
    descripcion:
      "Configura entornos híbridos, monitoreo de tráfico en tiempo real y microservicios en la nube.",
  },
  {
    id: 5,
    categoria: "entornos",
    titulo: "Plataformas de Comercio Electrónico",
    descripcion:
      "Construye ecosistemas digitales de venta online interconectados con pasarelas de pago y analítica avanzada.",
  },
  {
    id: 6,
    categoria: "entornos",
    titulo: "Transformación Digital Empresarial",
    descripcion:
      "Implementa soluciones tecnológicas estratégicas que optimizan procesos de negocios tradicionales.",
  },
];

export default function Proyectos() {
  const [filtro, setFiltro] = useState<Categoria>("todos");

  const proyectosFiltrados =
    filtro === "todos"
      ? PROYECTOS_DATA
      : PROYECTOS_DATA.filter((p) => p.categoria === filtro);

  return (
    <section id="proyectos" className="bg-black text-white min-h-screen py-24 px-5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Columna Izquierda (Fija / Sticky) */}
        <div className="lg:sticky lg:top-24 self-start">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4 leading-tight text-white">
            ¿Proyectos realizdos por alumnos de la utt?
          </h2>
          <p className="text-zinc-400 text-sm lg:text-base mb-8 max-w-lg">
            Elige un área de especialización y descubre los proyectos tecnológicos de impacto real que puedes desarrollar.
          </p>

          <div className="flex flex-col gap-3 w-full max-w-sm">
            <button
              onClick={() => setFiltro("todos")}
              className={`w-full px-5 py-3.5 rounded-xl border text-left text-sm font-medium transition-all duration-200 cursor-pointer ${
                filtro === "todos"
                  ? "bg-[#196700] border-[#42f308] text-white shadow-[0_0_15px_rgba(66,243,8,0.2)]"
                  : "border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white bg-zinc-950/50"
              }`}
            >
              Todos los proyectos
            </button>
            <button
              onClick={() => setFiltro("software")}
              className={`w-full px-5 py-3.5 rounded-xl border text-left text-sm font-medium transition-all duration-200 cursor-pointer ${
                filtro === "software"
                  ? "bg-[#196700] border-[#42f308] text-white shadow-[0_0_15px_rgba(66,243,8,0.2)]"
                  : "border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white bg-zinc-950/50"
              }`}
            >
              1. Software
            </button>
            <button
              onClick={() => setFiltro("redes")}
              className={`w-full px-5 py-3.5 rounded-xl border text-left text-sm font-medium transition-all duration-200 cursor-pointer ${
                filtro === "redes"
                  ? "bg-[#196700] border-[#42f308] text-white shadow-[0_0_15px_rgba(66,243,8,0.2)]"
                  : "border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white bg-zinc-950/50"
              }`}
            >
              2. Redes
            </button>
            <button
              onClick={() => setFiltro("entornos")}
              className={`w-full px-5 py-3.5 rounded-xl border text-left text-sm font-medium transition-all duration-200 cursor-pointer ${
                filtro === "entornos"
                  ? "bg-[#196700] border-[#42f308] text-white shadow-[0_0_15px_rgba(66,243,8,0.2)]"
                  : "border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white bg-zinc-950/50"
              }`}
            >
              3. Entornos y Negocios Digitales
            </button>
          </div>
        </div>

        {/* Columna Derecha (Tarjetas desplazables) */}
        <div className="flex flex-col gap-6">
          {proyectosFiltrados.map((proyecto) => (
            <div
              key={proyecto.id}
              className="bg-[#121212] border border-zinc-800 rounded-2xl p-8 transition-all duration-300 hover:border-[#42f308]/40 hover:-translate-y-1"
            >
              <h3 className="text-xl font-semibold mb-3 text-white">
                {proyecto.titulo}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {proyecto.descripcion}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}