//  # Base de conocimiento (datos de carreras, test de 4 preguntas, sinónimos)
export interface CareerQuickInfo {
  slug: string;
  name: string;
  shortName: string;
  duracion: string;
  requisitos: string;
  campoLaboral: string;
  descripcion: string;
  link: string;
}

export const CAREERS_INFO: Record<string, CareerQuickInfo> = {
  "desarrollo-software": {
    slug: "desarrollo-software",
    name: "TSU en Desarrollo de Software Multiplataforma",
    shortName: "Desarrollo de Software",
    duracion: "2 años (6 cuatrimestres)",
    requisitos: "Bachillerato o preparatoria concluida, gusto por la lógica matemática, resolución de problemas y tecnología.",
    campoLaboral: "Desarrollador Web (Frontend/Backend), Administrador de Bases de Datos, QA Tester y Consultor TI.",
    descripcion: "Aprenderás a programar aplicaciones web y empresariales con tecnologías modernas y bases de datos.",
    link: "/carreras/desarrollo-software",
  },
  "redes": {
    slug: "redes",
    name: "TSU en Redes y Ciberseguridad",
    shortName: "Redes y Ciberseguridad",
    duracion: "2 años (6 cuatrimestres)",
    requisitos: "Bachillerato o preparatoria terminada, interés en infraestructura de redes, telecomunicaciones y seguridad de la información.",
    campoLaboral: "Administrador de Redes, Analista de Ciberseguridad, Soporte de Infraestructura Crítica, Auditor de Seguridad TI y Administrador de Servidores.",
    descripcion: "Te enfocarás en diseñar, proteger y administrar redes de comunicación, servidores e infraestructura segura contra ciberataques.",
    link: "/carreras/redes",
  },
  "entornos-virtuales": {
    slug: "entornos-virtuales",
    name: "TSU en Entornos Virtuales y Negocios Digitales",
    shortName: "Entornos Virtuales",
    duracion: "2 años (6 cuatrimestres)",
    requisitos: "Bachillerato concluido, afinidad con el diseño digital, creatividad visual, modelado 3D y nuevas tecnologías interactivas.",
    campoLaboral: "Desarrollador de Realidad Virtual y Aumentada (VR/AR), Diseñador de Experiencias 3D, Desarrollador de Videojuegos y Estratega de Negocios Digitales.",
    descripcion: "Crearás experiencias inmersivas con Realidad Virtual, simuladores, modelado 3D interactivo y soluciones de marketing digital.",
    link: "/carreras/entornos-virtuales",
  },
};

export interface QuizOption {
  text: string;
  points: {
    "desarrollo-software"?: number;
    "redes"?: number;
    "entornos-virtuales"?: number;
  };
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: QuizOption[];
}

// HU-10: Máximo 4 preguntas vocacionales
export const VOCATIONAL_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "1/4: ¿Qué actividad despierta más tu curiosidad?",
    options: [
      {
        text: "Crear aplicaciones web, sitios interactivos o apps móviles",
        points: { "desarrollo-software": 3 },
      },
      {
        text: "Proteger sistemas contra ataques y configurar conexiones seguras",
        points: { "redes": 3 },
      },
      {
        text: "Diseñar gráficos en 3D, mundos virtuales y videojuegos",
        points: { "entornos-virtuales": 3 },
      },
    ],
  },
  {
    id: 2,
    question: "2/4: ¿Con qué tipo de herramientas te gustaría trabajar a diario?",
    options: [
      {
        text: "Editores de código, APIs y bases de datos",
        points: { "desarrollo-software": 3 },
      },
      {
        text: "Routers, servidores, consolas de red y monitores de tráfico",
        points: { "redes": 3 },
      },
      {
        text: "Motores de videojuegos (Unity, Unreal) y software de modelado 3D",
        points: { "entornos-virtuales": 3 },
      },
    ],
  },
  {
    id: 3,
    question: "3/4: Si estuvieras en una empresa tecnológica, ¿cuál sería tu rol soñado?",
    options: [
      {
        text: "Programar la lógica y las funciones del producto que usan miles de usuarios",
        points: { "desarrollo-software": 3 },
      },
      {
        text: "Garantizar que los servidores nunca caigan y la información esté blindada",
        points: { "redes": 3 },
      },
      {
        text: "Diseñar la experiencia visual interactiva e inmersiva del usuario",
        points: { "entornos-virtuales": 3 },
      },
    ],
  },
  {
    id: 4,
    question: "4/4: ¿Qué tipo de proyectos finales te entusiasmaría presentar?",
    options: [
      {
        text: "Una plataforma web completa",
        points: { "desarrollo-software": 3 },
      },
      {
        text: "Una infraestructura de red corporativa segura y monitoreada",
        points: { "redes": 3 },
      },
      {
        text: "Un simulador de Realidad Virtual o una experiencia en 3D",
        points: { "entornos-virtuales": 3 },
      },
    ],
  },
];

export const CAREER_JUSTIFICATIONS: Record<string, string> = {
  "desarrollo-software":
    "Tus respuestas demuestran un fuerte interés por la lógica de programación, la creación de aplicaciones funcionales y el desarrollo de soluciones digitales que resuelven problemas cotidianos.",
  "redes":
    "Tienes un perfil orientado a la infraestructura, la seguridad informática y la protección de datos, áreas esenciales para que cualquier empresa opere sin interrupciones.",
  "entornos-virtuales":
    "Destacas por tu creatividad visual, interés en experiencias inmersivas (VR/AR) y el desarrollo de tecnologías interactivas de última generación.",
};

export const DEFAULT_SUGGESTIONS = [
  "Conocer carreras",
  "Ver eventos",
  "Orientación vocacional",
];