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

export interface FAQItem {
  id: string;
  // Palabras clave que activan esta respuesta
  keywords: string[];
  question: string;
  answer: string;
  suggestions: string[];
  action?: {
    label: string;
    url: string;
  };
}

export const CONCEPT_FAQS: FAQItem[] = [
  {
    id: "hackathon",
    keywords: ["hackathon", "hackaton", "jacaton", "maraton de codigo"],
    question: "¿Qué es un Hackathon?",
    answer: "Un **Hackathon** es una maratón intensiva de desarrollo colaborativo (habitualmente de 24 horas continuas) donde equipos de estudiantes diseñan, programan y presentan una solución tecnológica funcional ante un cliente real. Seran supervisados por docentes de la carrera y al final se premiará a los tres mejores proyectos.",
    suggestions: ["Ver eventos", "Conocer carreras"],
    action: {
      label: "Ver detalles del Hackathon TIC",
      url: "#eventos",
    },
  },
  // AGREGAR LOS POSIBLES PREMIOS DEL HACKATHON
  {
    id: "congreso",
    keywords: ["congreso", "conferencia", "simposio", "ponencias"],
    question: "¿Qué es un Congreso de Tecnología?",
    answer: "El **Congreso de Tecnología y Ciberseguridad** es un encuentro académico donde expertos, investigadores y empresas líderes imparten conferencias magistrales y talleres prácticos sobre tendencias como Inteligencia Artificial, seguridad informática, desarrollo de software y entornos virtuales.",
    suggestions: ["Congreso de Tecnología", "Ver eventos", "Hablar con el asistente"],
    action: {
      label: "Ver eventos académicos",
      url: "#eventos",
    },
  },
  {
    id: "integradora",
    keywords: ["integradora", "proyecto integrador", "integradoras"],
    question: "¿Qué es una Integradora?",
    answer: "La **Materia Integradora** es el pilar práctico de la UTT. Al cierre de cada ciclo (como 3ro, 5to y 9no cuatrimestre), los equipos estudiantiles presentan ante el público un proyecto real que combina los conocimientos adquiridos de todas las materias del cuatrimestre.",
    suggestions: ["Integradora de Tercero", "Conocer carreras", "Ver eventos"],
    action: {
      label: "Ver fechas de integradoras",
      url: "#eventos",
    },
  },
  // AGREGAR EN QUE CONSISTE CADA INTEGRADORA (3ro, 5to y 9no)
  {
    id: "rally",
    keywords: ["rally", "rali"],
    question: "¿Qué es el Rally?",
    answer: "El **Rally** es una competencia recreativa organizada en el edificio P. Equipos formados por estudiantes de distintas carreras recorren estaciones resolviendo retos de lógica, destreza física y conocimientos técnicos.",
    suggestions: ["Ver eventos", "Cine de Terror", "Hablar con el asistente"],
    action: {
      label: "Ver eventos en la cartelera",
      url: "#eventos",
    },
  },
  {
    id: "ofrendas",
    keywords: ["ofrenda", "ofrendas", "concurso de ofrendas", "dia de muertos"],
    question: "¿Qué es el Concurso de Ofrendas?",
    answer: "Es una celebración tradicional institucional en la que los grupos de cada carrera diseñan y montan ofrendas monumentales conmemorativas, siendo evaluadas por su apego cultural, creatividad y trabajo en equipo.",
    suggestions: ["Cine de Terror", "Ver eventos", "Conocer carreras"],
    action: {
      label: "Ver actividades culturales",
      url: "#eventos",
    },
  },
  {
    id: "cine-terror",
    keywords: ["cine de terror", "pelicula de terror", "cine"],
    question: "¿Qué es el Cine de Terror?",
    answer: "Es una actividad cultural y de convivencia que se lleva a cabo en el Edificio P con motivo de las fechas de Día de Muertos/Halloween, proyectando películas de suspenso con snacks y palomitas para los asistentes.",
    suggestions: ["Rally", "Concurso de Ofrendas", "Ver eventos"],
    action: {
      label: "Ver cartelera de eventos",
      url: "#eventos",
    },
  },
  {
    id: "tsu",
    keywords: ["tsu", "tecnico superior", "que es tsu", "nivel tsu"],
    question: "¿Qué es un TSU?",
    answer: "Un **Técnico Superior Universitario (TSU)** es un grado de educación superior universitario intensivo de **2 años (6 cuatrimestres)** enfocado en un **70% práctica y 30% teoría**. Al egresar obtienes título y cédula profesional, con la opción de continuar directo a la **Ingeniería**.",
    suggestions: ["Conocer carreras", "Orientación vocacional", "Requisitos de ingreso"],
    action: {
      label: "Explorar carreras TSU",
      url: "#carreras",
    },
  },
  {
    id: "estadia",
    keywords: ["estadia", "estadias", "practicas", "residencia"],
    question: "¿Qué son las Estadías Profesionales?",
    answer: "La **Estadía Profesional** se realiza en el último cuatrimestre (6to en TSU o 10mo en Ingeniería). Consiste en trabajar de tiempo completo dentro de una empresa desarrollando un proyecto real de tecnología, lo que te otorga experiencia laboral comprobada y tu titulación.",
    suggestions: ["Desarrollo de Software", "Redes y Ciberseguridad", "Entornos Virtuales"],
    action: {
      label: "Ver proceso en aspirantes",
      url: "/aspirantes",
    },
  },
];

export const CAREERS_INFO: Record<string, CareerQuickInfo> = {
  "desarrollo-software": {
    slug: "desarrollo-software",
    name: "TSU en Desarrollo de Software Multiplataforma",
    shortName: "Desarrollo de Software",
    duracion: "3 años y 4 meses (10 cuatrimestres)",
    requisitos: "Bachillerato o preparatoria concluida, gusto por la lógica matemática, resolución de problemas y tecnología.",
    campoLaboral: "Desarrollador Web (Frontend/Backend), Administrador de Bases de Datos, QA Tester y Consultor TI.",
    descripcion: "Aprenderás a programar aplicaciones web y empresariales con tecnologías modernas y bases de datos.",
    link: "/carreras/desarrollo-software",
  },
  "redes": {
    slug: "redes",
    name: "TSU en Redes y Ciberseguridad",
    shortName: "Redes y Ciberseguridad",
    duracion: "3 años y 4 meses (10 cuatrimestres)",
    requisitos: "Bachillerato o preparatoria terminada, interés en infraestructura de redes, telecomunicaciones y seguridad de la información.",
    campoLaboral: "Administrador de Redes, Analista de Ciberseguridad, Soporte de Infraestructura Crítica, Auditor de Seguridad TI y Administrador de Servidores.",
    descripcion: "Te enfocarás en diseñar, proteger y administrar redes de comunicación, servidores e infraestructura segura contra ciberataques.",
    link: "/carreras/redes",
  },
  "entornos-virtuales": {
    slug: "entornos-virtuales",
    name: "TSU en Entornos Virtuales y Negocios Digitales",
    shortName: "Entornos Virtuales",
    duracion: "3 años y 4 meses (10 cuatrimestres)",
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