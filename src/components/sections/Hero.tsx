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
            "radial-gradient(circle at top, rgba(255,255,255,.15), transparent 40%), linear-gradient(135deg, rgba(234,88,12,.82) 0%, rgba(20,83,45,.88) 100%)",
        }}
      />

      {/* Partículas */}
      <div className="absolute inset-0 pointer-events-none">
        <span className="absolute top-[15%] left-[10%] w-2 h-2 bg-white/40 rounded-full animate-pulse"></span>
        <span className="absolute top-[25%] right-[18%] w-3 h-3 bg-orange-300/50 rounded-full animate-pulse"></span>
        <span className="absolute top-[55%] left-[20%] w-2 h-2 bg-white/30 rounded-full animate-pulse"></span>
        <span className="absolute top-[70%] right-[25%] w-4 h-4 bg-white/20 rounded-full animate-pulse"></span>
        <span className="absolute bottom-[30%] left-[45%] w-2 h-2 bg-orange-200/40 rounded-full animate-pulse"></span>
        <span className="absolute bottom-[20%] right-[40%] w-3 h-3 bg-white/20 rounded-full animate-pulse"></span>
      </div>

      {/* Contenido */}
      <div className="relative z-10 text-center text-white px-6 max-w-5xl mx-auto">
        {/* Badge */}
        <span
          className="inline-block text-xs font-semibold tracking-widest uppercase px-4 py-1 rounded-full mb-6 mt-20 border border-white/40"
          style={{
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(6px)",
          }}
        >
          Tecnologías de la Información e Innovación Digital
        </span>

        {/* Título */}
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 drop-shadow-lg">
          Universidad Tecnológica
          <br />
          <span style={{ color: "#fdba74" }}>de Tlaxcala</span>
        </h1>

        {/* Subtítulo */}
        <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
          Prepárate para el mundo digital con una de nuestras tres carreras de
          vanguardia.
        </p>

        {/* Tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
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
              className="rounded-xl px-5 py-5 text-left border border-white/20 hover:border-white/60 transition-all duration-300 hover:scale-105 hover:-translate-y-2"
              style={{
                background: "rgba(255,255,255,0.10)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 12px 30px rgba(0,0,0,.18)",
              }}
            >
              <span
                className="text-xs font-bold tracking-widest uppercase"
                style={{ color: "#fdba74" }}
              >
                {carrera.siglas}
              </span>

              <p className="text-sm text-white/90 mt-2 font-medium leading-snug">
                {carrera.nombre}
              </p>
            </div>
          ))}
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#careers"
            className="px-8 py-3 rounded-lg font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            style={{
              background: "linear-gradient(90deg,#ea580c,#c2410c)",
            }}
          >
            Conoce las carreras
          </a>

          <a
            href="#contact"
            className="px-8 py-3 rounded-lg font-semibold border-2 border-white/70 text-white hover:bg-white hover:text-green-900 transition-all duration-300 hover:scale-105"
          >
            Solicitar informes
          </a>
        </div>

        {/* Barra informativa */}
        <div
          className="mt-14 rounded-2xl border border-white/20 p-6"
          style={{
            background: "rgba(255,255,255,.08)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

            <div>
              <h3 className="font-semibold">3 Carreras</h3>
              <p className="text-sm text-white/70">
                Especializadas en TI
              </p>
            </div>

            <div>
              <h3 className="font-semibold">TSU + Ingeniería</h3>
              <p className="text-sm text-white/70">
                Formación profesional
              </p>
            </div>

            <div>
              <h3 className="font-semibold">Estadías</h3>
              <p className="text-sm text-white/70">
                Experiencia en empresas
              </p>
            </div>

            <div>
              <h3 className="font-semibold">Innovación</h3>
              <p className="text-sm text-white/70">
                Tecnología de vanguardia
              </p>
            </div>

          </div>

          {/* Tecnologías */}
          <div className="flex flex-wrap justify-center gap-3 mt-15">
            {[
              "React",
              "Java",
              "JavaScript",
              "Python",
              "Cisco",
              "MySQL",
              "Entornos Virtuales",
              "Redes",
              "Ciberseguridad",
            ].map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm hover:bg-white/20 transition"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Flecha */}
        <div className="mt-8 text-3xl text-white animate-bounce">
          ↓
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