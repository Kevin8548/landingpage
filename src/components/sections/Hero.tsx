export const Hero = () => {
  return (
    <section id="hero" className="relative h-screen flex items-center justify-center">
        {}
      <img src="/assets/hero.png" className="absolute inset-0 w-full h-full object-cover" />
      
      <div className="relative z-10 text-center text-white px-4">
        <span className="bg-blue-600 text-sm px-3 py-1 rounded-full">
          Inscripciones abiertas 2026
        </span>

        <h1 className="text-5xl font-bold mt-4">
          Forma tu futuro profesional
        </h1>

        <p className="text-xl mt-3 text-gray-200">
          Software · Redes · Entornos Virtuales
        </p>

        <div className="mt-8 flex gap-4 justify-center">
          <a href="#careers" className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold">
            Ver carreras
          </a>
          <a href="#contact" className="border border-white px-6 py-3 rounded-lg hover:bg-white hover:text-black transition">
            Solicitar informes
          </a>
        </div>
      </div>
    </section>
  )
}

export default Hero