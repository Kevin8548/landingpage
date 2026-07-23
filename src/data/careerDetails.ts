// arriba del archivo, junto a las interfaces
import softwareBack from "../assets/careers/softwareII.jpg";
import softwareFront from "../assets/careers/software.jpg";
import redesBack from "../assets/careers/redesII.jpg";
import redesFront from "../assets/careers/redes.jpg";
import entornosBack from "../assets/careers/entornosII.jpg";
import entornosFront from "../assets/careers/entornos.jpg";

export interface Materia {
  nombre: string;
  clave: boolean;
  descripcion?: string;
}

export interface StudentLifeImage {
  image: string;
  alt?: string;
}

export interface Cuatrimestre {
  numero: number;
  nivel: string;
  materias: Materia[];
}

export interface CareerDetail {
  id: string; // "desarrollo-software" | "redes" | "entornos-virtuales" | "ingenieria-ti"
  nombre: string;
  quote: string;
  imageBack: string;
  imageFront: string;
  stats: { icon: string; label: string; value: string; desc: string }[];
  metodologia: { titulo: string; texto: string };
  cuatrimestres: Cuatrimestre[];
  perfilIngreso?: string[];
  perfilEgreso: string[];
  campoLaboral: { icon: string; titulo: string; desc: string }[];
  studentLife: StudentLifeImage[];
}

export const careerDetails: Record<string, CareerDetail> = {
  "desarrollo-software": {
    id: "desarrollo-software",
    nombre: "T.S.U. en Tecnologías de la Información Área Desarrollo de Software Multiplataforma",
    quote: "No solo escribas código, construye soluciones interconectadas que transformen el mundo digital.",
    stats: [
        { icon: "terminal", label: "Empleabilidad", value: "95%", desc: "Egresados laborando en desarrollo de software y TI a nivel nacional." },
        { icon: "code", label: "Enfoque Práctico", value: "70/30", desc: "Relación de horas de desarrollo práctico frente a teoría conceptual." },
        { icon: "database", label: "Proyectos Reales", value: "5+", desc: "Entregables de software funcionales desarrollados durante toda la carrera." },
        { icon: "briefcase", label: "Experiencia", value: "+1 año", desc: "Al realizar tus estadías, obtienes experiencia profesional documentada." }
    ],
    imageBack: softwareBack,
    imageFront: softwareFront,
    metodologia: {
      titulo: "Aprendizaje Basado en Proyectos",
      texto: "Nuestra metodología integra proyectos reales de desarrollo en cada ciclo, permitiéndote construir un portafolio profesional sólido antes de egresar."
    },
    cuatrimestres: [
      {
        numero: 1,
        nivel: "Nivel de Fundamentos",
        materias: [
          { nombre: "Inglés I", clave: false },
          { nombre: "Desarrollo Humano y Valores", clave: false },
          { nombre: "Fundamentos Matemáticos", clave: false },
          { nombre: "Fundamentos de Redes", clave: true, descripcion: "Comprende cómo se comunican los sistemas, base para cualquier desarrollo distribuido." },
          { nombre: "Física", clave: false },
          { nombre: "Fundamentos de Programación", clave: true, descripcion: "La piedra angular para dominar la lógica estructurada y la resolución de problemas lógicos." },
          { nombre: "Comunicación y Habilidades Digitales", clave: false }
        ]
      },
      {
        numero: 2,
        nivel: "Especialización Inicial",
        materias: [
          { nombre: "Inglés II", clave: false },
          { nombre: "Habilidades Socioemocionales y Manejo de Conflictos", clave: false },
          { nombre: "Cálculo Diferencial", clave: false },
          { nombre: "Conmutación y Enrutamiento de Redes", clave: false },
          { nombre: "Probabilidad y Estadística", clave: false },
          { nombre: "Programación Estructurada", clave: true, descripcion: "Desarrolla algoritmos complejos y consolida bases sólidas en lenguajes de alto nivel." },
          { nombre: "Sistemas Operativos", clave: true, descripcion: "Entiende cómo se gestionan procesos, memoria y recursos que todo software consume." }
        ]
      },
      {
        numero: 3,
        nivel: "Consolidación de Datos y Objetos",
        materias: [
          { nombre: "Inglés III", clave: false },
          { nombre: "Desarrollo del Pensamiento y Toma de Decisiones", clave: false },
          { nombre: "Cálculo Integral", clave: false },
          { nombre: "Tópicos de Calidad para el Diseño de Software", clave: true, descripcion: "Aplica estándares de calidad que distinguen software profesional de código improvisado." },
          { nombre: "Bases de Datos", clave: true, descripcion: "Diseña modelos relacionales sólidos para persistir la información de tus aplicaciones." },
          { nombre: "Programación Orientada a Objetos", clave: true, descripcion: "Aprende a estructurar software modular, reutilizable y escalable bajo estándares de la industria." },
          { nombre: "Proyecto Integrador I", clave: false }
        ]
      },
      {
        numero: 4,
        nivel: "Desarrollo Avanzado",
        materias: [
          { nombre: "Inglés IV", clave: false },
          { nombre: "Ética Profesional", clave: false },
          { nombre: "Cálculo de Varias Variables", clave: false },
          { nombre: "Aplicaciones Web", clave: true, descripcion: "Construye interfaces y lógica de negocio para el entorno más demandado del mercado." },
          { nombre: "Estructura de Datos", clave: true, descripcion: "Optimiza el rendimiento de tus programas eligiendo la estructura correcta para cada problema." },
          { nombre: "Desarrollo de Aplicaciones Móviles", clave: true, descripcion: "Diseña e implementa apps nativas e híbridas para dispositivos Android e iOS." },
          { nombre: "Análisis y Diseño de Software", clave: false }
        ]
      },
      {
        numero: 5,
        nivel: "Ingeniería e Integración",
        materias: [
          { nombre: "Inglés V", clave: false },
          { nombre: "Liderazgo de Equipos de Alto Desempeño", clave: false },
          { nombre: "Ecuaciones Diferenciales", clave: false },
          { nombre: "Aplicaciones Web Orientadas a Servicios", clave: true, descripcion: "Aprende a crear y consumir APIs RESTful integrando arquitecturas modernas de microservicios." },
          { nombre: "Bases de Datos Avanzadas", clave: true, descripcion: "Trabaja con motores NoSQL, optimización de consultas y modelos de datos a gran escala." },
          { nombre: "Estándares y Métricas para el Desarrollo de Software", clave: true, descripcion: "Mide y mejora la calidad de tu código con métricas usadas por la industria." },
          { nombre: "Proyecto Integrador II", clave: false }
        ]
      },
      {
        numero: 6,
        nivel: "Estadía Profesional",
        materias: [
          { nombre: "Estadía en el Sector Productivo", clave: true, descripcion: "Insértate en una empresa real para resolver un problema de desarrollo tecnológico y consolidar tu titulación." }
        ]
      }
    ],
    perfilIngreso: [
      "Gusto por la lógica, las matemáticas y la resolución de problemas",
      "Curiosidad por entender cómo funcionan los sistemas y aplicaciones digitales",
      "Habilidad de análisis y atención al detalle",
      "Disposición para el trabajo colaborativo y el aprendizaje autodidacta"
    ],
    perfilEgreso: [
      "Desarrollo de software multiplataforma (Web, Móvil, Escritorio)",
      "Modelado y optimización de bases de datos relacionales y no relacionales",
      "Garantía de calidad en el ciclo de vida del software mediante estándares de desarrollo",
      "Integración de sistemas de backend orientados a servicios (APIs)"
    ],
    campoLaboral: [
      { icon: "code", titulo: "Desarrollador Full Stack", desc: "Crea tanto el frontend como el backend de aplicaciones dinámicas modernas." },
      { icon: "smartphone", titulo: "Desarrollador Móvil", desc: "Diseña aplicaciones de alto rendimiento para ecosistemas iOS y Android." },
      { icon: "database", titulo: "Administrador de Bases de Datos", desc: "Diseña, gestiona y asegura el almacenamiento de datos críticos de la empresa." }
    ],
    studentLife: [
        { image: softwareBack, alt: "Estudiantes trabajando en la sala común" },
        { image: softwareFront, alt: "Laboratorio de cómputo" },
        { image: softwareBack, alt: "Estudiante programando" },
    ],
  },

  "redes": {
    id: "redes",
    nombre: "T.S.U. en Tecnologías de la Información Área Infraestructura de Redes Digitales",
    quote: "Garantiza la conectividad global y asegura la infraestructura que sostiene la nube.",
    stats: [
        { icon: "shield", label: "Tasa de Empleo", value: "94%", desc: "De egresados trabajando en administración de redes, soporte y ciberseguridad." },
        { icon: "server", label: "Certificaciones", value: "CCNA", desc: "Currículo alineado con estándares internacionales de la industria como Cisco." },
        { icon: "cloud", label: "Proyectos Reales", value: "4+", desc: "Prácticas de configuración de infraestructuras reales durante la carrera." },
        { icon: "briefcase", label: "Experiencia", value: "+1 año", desc: "Al realizar tus estadías, obtienes experiencia profesional documentada." }
    ],
    imageBack: redesBack,
    imageFront: redesFront,
    metodologia: {
      titulo: "Prácticas en Laboratorio",
      texto: "Configuración directa de racks de servidores físicos, switches, routers y despliegue híbrido en infraestructuras de nube."
    },
    cuatrimestres: [
      {
        numero: 1,
        nivel: "Nivel de Fundamentos",
        materias: [
          { nombre: "Inglés I", clave: false },
          { nombre: "Desarrollo Humano y Valores", clave: false },
          { nombre: "Fundamentos Matemáticos", clave: false },
          { nombre: "Fundamentos de Redes", clave: true, descripcion: "Entiende el modelo OSI, TCP/IP, direccionamiento IP y cómo viajan los datos en el mundo digital." },
          { nombre: "Física", clave: false },
          { nombre: "Fundamentos de Programación", clave: true, descripcion: "Base lógica indispensable para automatizar tareas de red más adelante." },
          { nombre: "Comunicación y Habilidades Digitales", clave: false }
        ]
      },
      {
        numero: 2,
        nivel: "Infraestructura Básica",
        materias: [
          { nombre: "Inglés II", clave: false },
          { nombre: "Habilidades Socioemocionales y Manejo de Conflictos", clave: false },
          { nombre: "Cálculo Diferencial", clave: false },
          { nombre: "Conmutación y Enrutamiento de Redes", clave: true, descripcion: "Domina la configuración de routers y switches para optimizar el tráfico de datos local y externo." },
          { nombre: "Probabilidad y Estadística", clave: false },
          { nombre: "Programación Estructurada", clave: false },
          { nombre: "Sistemas Operativos", clave: true, descripcion: "Administra servidores Linux y Windows, base de cualquier infraestructura de red." }
        ]
      },
      {
        numero: 3,
        nivel: "Administración y Calidad",
        materias: [
          { nombre: "Inglés III", clave: false },
          { nombre: "Desarrollo del Pensamiento y Toma de Decisiones", clave: false },
          { nombre: "Cálculo Integral", clave: false },
          { nombre: "Tópicos de Calidad para el Diseño de Software", clave: true, descripcion: "Aplica estándares de calidad al documentar y desplegar servicios de red." },
          { nombre: "Bases de Datos", clave: true, descripcion: "Aprende el diseño relacional y lenguaje SQL indispensable para la persistencia e infraestructura de datos." },
          { nombre: "Programación Orientada a Objetos", clave: false },
          { nombre: "Proyecto Integrador I", clave: false }
        ]
      },
      {
        numero: 4,
        nivel: "Escalabilidad y Programabilidad",
        materias: [
          { nombre: "Inglés IV", clave: false },
          { nombre: "Ética Profesional", clave: false },
          { nombre: "Cálculo de Varias Variables", clave: false },
          { nombre: "Escabilidad de Redes", clave: false },
          { nombre: "Programación de Redes", clave: true, descripcion: "Automatiza tareas de administración utilizando scripts para una gestión de red más ágil y moderna." },
          { nombre: "Centro de Datos", clave: true, descripcion: "Diseña y opera la infraestructura física y virtual que sostiene los servicios críticos." },
          { nombre: "Infraestructura de Redes de Datos", clave: true, descripcion: "Planea topologías robustas y escalables para entornos empresariales." }
        ]
      },
      {
        numero: 5,
        nivel: "Nube y Ciberseguridad",
        materias: [
          { nombre: "Inglés V", clave: false },
          { nombre: "Liderazgo de Equipos de Alto Desempeño", clave: false },
          { nombre: "Ecuaciones Diferenciales", clave: false },
          { nombre: "Conexiones de Redes WAN", clave: true, descripcion: "Conecta sedes remotas con soluciones seguras y de alta disponibilidad." },
          { nombre: "Cómputo en la Nube", clave: true, descripcion: "Despliega y administra recursos en plataformas como AWS o Azure." },
          { nombre: "Seguridad en Redes", clave: true, descripcion: "Implementa firewalls, políticas de cifrado y protocolos para proteger infraestructuras críticas contra ataques." },
          { nombre: "Proyecto Integrador II", clave: false }
        ]
      },
      {
        numero: 6,
        nivel: "Estadía Profesional",
        materias: [
          { nombre: "Estadía en el Sector Productivo", clave: true, descripcion: "Práctica en campo administrando la red, resolviendo problemas de infraestructura y conectividad corporativa." }
        ]
      }
    ],
    perfilIngreso: [
      "Interés por la infraestructura tecnológica y la conectividad digital",
      "Pensamiento lógico-matemático y capacidad de análisis",
      "Disposición para el trabajo metódico y la resolución de problemas técnicos",
      "Interés por la seguridad de la información y los entornos en la nube"
    ],
    perfilEgreso: [
      "Configuración, administración y mantenimiento de redes LAN, WAN y arquitecturas híbridas",
      "Automatización de infraestructuras de red mediante scripts de programación",
      "Diseño e implementación de soluciones en la nube de alta disponibilidad",
      "Auditoría y fortificación de redes frente a riesgos de seguridad digital"
    ],
    campoLaboral: [
      { icon: "server", titulo: "Administrador de Redes", desc: "Gestiona de extremo a extremo la conectividad y recursos físicos/lógicos de redes corporativas." },
      { icon: "cloud", titulo: "Ingeniero de Cloud / DevOps", desc: "Despliega servicios y orquesta cargas de trabajo complejas en la nube." },
      { icon: "shield", titulo: "Especialista en Seguridad Perimetral", desc: "Diseña defensas de TI y monitoriza accesos sospechosos para evitar brechas de seguridad." }
    ],
    studentLife: [
        { image: redesBack, alt: "Estudiantes trabajando en la sala común" },
        { image: redesFront, alt: "Laboratorio de cómputo" },
        { image: redesBack, alt: "Estudiante programando" },
    ],
  },

  "entornos-virtuales": {
    id: "entornos-virtuales",
    nombre: "T.S.U. en Tecnologías de la Información Área Entornos Virtuales y Negocios Digitales",
    quote: "Fusiona el arte digital con la tecnología para crear experiencias interactivas y negocios de alto impacto.",
    stats: [
        { icon: "palette", label: "Creatividad", value: "100%", desc: "Orientado al diseño interactivo, modelado 3D y estrategias de marketing digital." },
        { icon: "vr", label: "Inmersión", value: "AR/VR", desc: "Especialización en desarrollo para Realidad Virtual y Realidad Aumentada." },
        { icon: "gamepad", label: "Proyectos Reales", value: "5+", desc: "Entornos interactivos y campañas digitales desarrolladas durante la carrera." },
        { icon: "briefcase", label: "Experiencia", value: "+1 año", desc: "Al realizar tus estadías, obtienes experiencia profesional documentada." }
    ],
    imageBack: entornosBack,
    imageFront: entornosFront,
    metodologia: {
      titulo: "Diseño e Implementación Práctica",
      texto: "Aprende combinando herramientas de diseño audiovisual, motores de desarrollo de videojuegos y estrategias de comercio digital integradas."
    },
    cuatrimestres: [
      {
        numero: 1,
        nivel: "Nivel de Fundamentos",
        materias: [
          { nombre: "Inglés I", clave: false },
          { nombre: "Desarrollo Humano y Valores", clave: false },
          { nombre: "Fundamentos Matemáticos", clave: false },
          { nombre: "Fundamentos de Redes", clave: true, descripcion: "Conoce cómo se transmiten los datos en experiencias conectadas y multijugador." },
          { nombre: "Física", clave: false },
          { nombre: "Metodología de la Programación", clave: true, descripcion: "Estructura la lógica detrás de toda experiencia interactiva y flujo lógico digital." },
          { nombre: "Comunicación y Habilidades Digitales", clave: false }
        ]
      },
      {
        numero: 2,
        nivel: "Socioemocional y Técnico",
        materias: [
          { nombre: "Inglés II", clave: false },
          { nombre: "Habilidades Socioemocionales y Manejo de Conflictos", clave: false },
          { nombre: "Cálculo Diferencial", clave: false },
          { nombre: "Conmutación y Enrutamiento de Redes", clave: false },
          { nombre: "Probabilidad y Estadística", clave: false },
          { nombre: "Programación Estructurada", clave: true, descripcion: "Consolida la lógica de programación esencial para interactuar con motores gráficos y scripts." },
          { nombre: "Sistemas Operativos", clave: true, descripcion: "Comprende el entorno donde se ejecutan tus aplicaciones interactivas." }
        ]
      },
      {
        numero: 3,
        nivel: "Diseño y Bases de Datos",
        materias: [
          { nombre: "Inglés III", clave: false },
          { nombre: "Desarrollo del Pensamiento y Toma de Decisiones", clave: false },
          { nombre: "Cálculo Integral", clave: false },
          { nombre: "Tópicos de Calidad para el Diseño de Software", clave: false },
          { nombre: "Bases de Datos", clave: true, descripcion: "Gestiona la información detrás de plataformas de comercio digital y experiencias interactivas." },
          { nombre: "Programación Orientada a Objetos", clave: true, descripcion: "Conceptos clave para estructurar comportamientos en entornos virtuales y videojuegos." },
          { nombre: "Proyecto Integrador I", clave: false }
        ]
      },
      {
        numero: 4,
        nivel: "Producción Audiovisual y Web",
        materias: [
          { nombre: "Inglés IV", clave: false },
          { nombre: "Ética Profesional", clave: false },
          { nombre: "Cálculo de Varias Variables", clave: false },
          { nombre: "Modelado y Animación Digital", clave: true, descripcion: "Crea, texturiza y anima assets en tres dimensiones para entornos interactivos." },
          { nombre: "Diseño Digital y Producción Audiovisual", clave: true, descripcion: "Produce contenido multimedia de calidad profesional para plataformas digitales." },
          { nombre: "Aplicaciones Web", clave: true, descripcion: "Construye plataformas web que sirven como escaparate de experiencias digitales." },
          { nombre: "Mercadotecnia Digital", clave: false }
        ]
      },
      {
        numero: 5,
        nivel: "Tecnologías Inmersivas",
        materias: [
          { nombre: "Inglés V", clave: false },
          { nombre: "Liderazgo de Equipos de Alto Desempeño", clave: false },
          { nombre: "Ecuaciones Diferenciales", clave: false },
          { nombre: "Aplicaciones para Realidad Aumentada", clave: true, descripcion: "Superpone contenido digital sobre el mundo real con fines educativos o comerciales." },
          { nombre: "Aplicaciones para Realidad Virtual", clave: true, descripcion: "Desarrolla escenarios totalmente inmersivos y simulaciones interactivas de vanguardia." },
          { nombre: "Frameworks para Desarrollo Web", clave: true, descripcion: "Acelera la creación de plataformas interactivas usando herramientas modernas del mercado." },
          { nombre: "Proyecto Integrador II", clave: false }
        ]
      },
      {
        numero: 6,
        nivel: "Estadía Profesional",
        materias: [
          { nombre: "Estadía en el Sector Productivo", clave: true, descripcion: "Despliega proyectos interactivos o estrategias multimedia en un entorno empresarial real." }
        ]
      }
    ],
    perfilIngreso: [
      "Interés por el diseño digital, el modelado 3D y las tecnologías inmersivas",
      "Creatividad y sensibilidad estética aplicada a la tecnología",
      "Habilidad de comunicación visual y narrativa digital",
      "Interés por los negocios digitales y las estrategias de mercadotecnia"
    ],
    perfilEgreso: [
      "Diseño y modelado de entornos virtuales en 3D interactivos",
      "Desarrollo de aplicaciones de Realidad Virtual (VR) y Realidad Aumentada (AR)",
      "Creación de campañas integrales y analítica de mercadotecnia digital",
      "Producción multimedia y diseño web responsivo de vanguardia"
    ],
    campoLaboral: [
      { icon: "gamepad", titulo: "Diseñador de Entornos Virtuales", desc: "Modelador 3D y desarrollador de experiencias interactivas y lúdicas." },
      { icon: "megaphone", titulo: "Especialista en Marketing Digital", desc: "Planifica y ejecuta estrategias publicitarias y de comercio electrónico." },
      { icon: "video", titulo: "Productor de Contenido Audiovisual", desc: "Edita y produce material multimedia de alta calidad para canales interactivos." }
    ],
    studentLife: [
        { image: entornosBack, alt: "Estudiantes trabajando en la sala común" },
        { image: entornosFront, alt: "Laboratorio de cómputo" },
        { image: entornosBack, alt: "Estudiante programando" },
    ],
  },

  "ingenieria-ti": {
    id: "ingenieria-ti",
    nombre: "Ingeniería en Tecnologías de la Información e Innovación Digital",
    quote: "Lidera la transformación tecnológica integrando Inteligencia Artificial, Internet de las Cosas y Ciencia de Datos.",
    stats: [
        { icon: "cpu", label: "Innovación", value: "IoT/IA", desc: "Materias fuertemente orientadas a tecnologías disruptivas y emergentes." },
        { icon: "briefcase", label: "Perfil Gerencial", value: "100%", desc: "Preparado para la gestión de proyectos de TI a gran escala y toma de decisiones." },
        { icon: "brain", label: "Proyectos Reales", value: "3+", desc: "Proyectos de innovación tecnológica desarrollados durante la ingeniería." },
        { icon: "chart-bar", label: "Experiencia", value: "+2 años", desc: "Sumando TSU + Ingeniería, acumulas experiencia práctica documentada." }
    ],
    imageBack: "softwareBack",
    imageFront: "entornosFront",
    metodologia: {
      titulo: "Innovación Tecnológica y Gestión",
      texto: "Combina rigurosidad técnica avanzada en áreas de datos e inteligencia artificial con fuertes habilidades de formulación de proyectos y liderazgo gerencial."
    },
    cuatrimestres: [
      {
        numero: 7,
        nivel: "Introducción a la Inteligencia Artificial",
        materias: [
          { nombre: "Inglés VI", clave: false },
          { nombre: "Habilidades Gerenciales", clave: false },
          { nombre: "Formulación de Proyectos de Tecnología", clave: true, descripcion: "Estructura propuestas de innovación viables técnica y financieramente." },
          { nombre: "Fundamentos de Inteligencia Artificial", clave: true, descripcion: "Aprende los principios matemáticos y algorítmicos para simular comportamiento inteligente en sistemas." },
          { nombre: "Ética y Legislación en Tecnologías de la Información", clave: false },
          { nombre: "Optativa I", clave: false },
          { nombre: "Seguridad Informática", clave: true, descripcion: "Protege sistemas y datos frente a amenazas cada vez más sofisticadas." }
        ]
      },
      {
        numero: 8,
        nivel: "Sistemas Inteligentes e Infraestructura",
        materias: [
          { nombre: "Inglés VII", clave: false },
          { nombre: "Electrónica Digital", clave: false },
          { nombre: "Gestión de Proyectos de Tecnología", clave: false },
          { nombre: "Programación para Inteligencia Artificial", clave: true, descripcion: "Escribe algoritmos de machine learning y procesamiento de datos con lenguajes especializados." },
          { nombre: "Administración de Servidores", clave: true, descripcion: "Gestiona la infraestructura que sostiene modelos y sistemas a gran escala." },
          { nombre: "Optativa II", clave: false },
          { nombre: "Informática Forense", clave: true, descripcion: "Investiga incidentes de seguridad y recupera evidencia digital de forma rigurosa." }
        ]
      },
      {
        numero: 9,
        nivel: "Tecnologías Disruptivas",
        materias: [
          { nombre: "Inglés VIII", clave: false },
          { nombre: "Internet de las Cosas", clave: true, descripcion: "Diseña sistemas de sensores y dispositivos conectados para el mundo físico." },
          { nombre: "Evaluación de Proyectos de Tecnología", clave: false },
          { nombre: "Ciencia de Datos", clave: true, descripcion: "Analiza, procesa y visualiza grandes volúmenes de datos para facilitar la toma de decisiones estratégicas." },
          { nombre: "Tecnologías Disruptivas", clave: true, descripcion: "Explora blockchain, edge computing y otras tendencias que redefinen la industria." },
          { nombre: "Optativa III", clave: false },
          { nombre: "Proyecto Integrador III", clave: false }
        ]
      },
      {
        numero: 10,
        nivel: "Estadía de Ingeniería",
        materias: [
          { nombre: "Estadía en el Sector Productivo", clave: true, descripcion: "Implementa un proyecto complejo de innovación y transferencia de tecnología directamente en una organización." }
        ]
      }
    ],
    perfilEgreso: [
      "Diseño e integración de soluciones basadas en Inteligencia Artificial y Machine Learning",
      "Gestión, formulación y evaluación de proyectos de tecnología a nivel directivo",
      "Despliegue de sistemas de Internet de las Cosas (IoT) y administración avanzada de servidores",
      "Auditoría mediante informática forense y aseguramiento de la información corporativa"
    ],
    campoLaboral: [
      { icon: "brain", titulo: "Ingeniero en Inteligencia Artificial", desc: "Desarrolla modelos predictivos y sistemas de automatización inteligentes." },
      { icon: "chart-bar", titulo: "Científico de Datos", desc: "Extrae insights valiosos de arquitecturas complejas de bases de datos." },
      { icon: "shield-alert", titulo: "Consultor de Ciberseguridad e Informática Forense", desc: "Protege infraestructuras digitales y audita incidentes de seguridad tecnológica." }
    ],
    studentLife: [
        { image: entornosBack, alt: "Estudiantes trabajando en la sala común" },
        { image: redesFront, alt: "Laboratorio de cómputo" },
        { image: softwareFront, alt: "Estudiante programando" },
    ],
  }
};