import UTT from "../../assets/UTT.png";

export const Hero = () => {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Fondo */}
      <img
        src={UTT}
        alt="Edificio Universidad Tecnológica de Tlaxcala"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(234,88,12,0.82) 0%, rgba(20,83,45,0.88) 100%)",
        }}
      />

      {/* Contenido */}
      <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto">
        {/* Badge */}
        <span
          className="inline-block text-xs font-semibold tracking-widest uppercase px-4 py-1 rounded-full mb-6 border border-white/40"
          style={{
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(6px)",
          }}
        >
          Tecnologías de la Información e Innovación Digital
        </span>

        {/* Titulo */}
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 drop-shadow-lg">
          Universidad Tecnológica
          <br />
          <span style={{ color: "#fdba74" }}>de Tlaxcala</span>
        </h1>

        {/* Subtitulo */}
        <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
          Prepárate para el mundo digital con una de nuestras tres carreras de
          vanguardia.
        </p>

        {/* Tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[
            {
              siglas: "DSM",
              nombre: "Desarrollo de Software Multiplataforma",
            },
            {
              siglas: "IRD",
              nombre: "Infraestructura de Redes Digitales",
            },
            {
              siglas: "EVND",
              nombre: "Entornos Virtuales y Negocios Digitales",
            },
          ].map((carrera) => (
            <div
              key={carrera.siglas}
              className="rounded-xl px-4 py-4 text-left border border-white/20 hover:border-white/60 transition-all duration-300 hover:scale-105"
              style={{
                background: "rgba(255,255,255,0.10)",
                backdropFilter: "blur(8px)",
              }}
            >
              <span
                className="text-xs font-bold tracking-widest uppercase"
                style={{ color: "#fdba74" }}
              >
                {carrera.siglas}
              </span>

              <p className="text-sm text-white/90 mt-1 font-medium leading-snug">
                {carrera.nombre}
              </p>
            </div>
          ))}
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#careers"
            className="px-8 py-3 rounded-lg font-bold text-white shadow-lg transition-all duration-300 hover:scale-105"
            style={{
              background: "linear-gradient(90deg, #ea580c, #c2410c)",
            }}
          >
            Conoce las carreras
          </a>

          <a
            href="#contact"
            className="px-8 py-3 rounded-lg font-semibold border-2 border-white/70 text-white hover:bg-white hover:text-green-900 transition-all duration-300"
          >
            Solicitar informes
          </a>
        </div>
      </div>

      {/* Ola decorativa */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
        <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg">
          <path
            fill="#ffffff"
            d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z"
          />
        </svg>
      </div>
    </section>
  );
};