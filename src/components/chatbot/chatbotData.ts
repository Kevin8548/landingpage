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

// Test Vocacional Dinámico y Gamificado
export const VOCATIONAL_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "1/5 **MISIÓN:** Una empresa sufre una falla crítica y sus servicios se detienen. ¿En qué equipo te gustaría entrar al rescate?",
    options: [
      {
        text: "Equipo Software: Modificar y desplegar el código para restaurar la plataforma de compras.",
        points: { "desarrollo-software": 3 },
      },
      {
        text: "Equipo Ciberdefensa: Bloquear el ataque, asegurar los servidores y blindar las conexiones.",
        points: { "redes": 3 },
      },
      {
        text: "Equipo Simulación: Diagnosticar la falla en un gemelo digital 3D interactivo en tiempo real.",
        points: { "entornos-virtuales": 3 },
      },
    ],
  },
  {
    id: 2,
    question: "2/5 **INVERSIÓN:** Imagina que te dan 1 millón de dólares para fundar tu propia empresa tecnológica. ¿Qué crearías?",
    options: [
      {
        text: "La próxima gran plataforma digital (como Uber, Spotify o Mercado Libre).",
        points: { "desarrollo-software": 3 },
      },
      {
        text: "Una firma de ciberseguridad e infraestructura que proteja a bancos y hospitales.",
        points: { "redes": 3 },
      },
      {
        text: "Un estudio de videojuegos y simuladores inmersivos con Realidad Virtual.",
        points: { "entornos-virtuales": 3 },
      },
    ],
  },
  {
    id: 3,
    question: "3/5 **ZONA DE TRABAJO:** Si pudieras equipar tu escritorio soñado sin límite de presupuesto, ¿qué tendría?",
    options: [
      {
        text: "3 monitores verticales llenos de código, APIs y bases de datos con música de fondo.",
        points: { "desarrollo-software": 3 },
      },
      {
        text: "Servidores propios, consolas de red con luces parpadeando y monitoreo de tráfico.",
        points: { "redes": 3 },
      },
      {
        text: "Visores de Realidad Virtual (VR/AR), tarjeta gráfica tope de gama y software de modelado 3D.",
        points: { "entornos-virtuales": 3 },
      },
    ],
  },
  {
    id: 4,
    question: "4/5 **TALENTO NATURAL:** ¿Cuál de estas habilidades se te da mejor sin tanto esfuerzo?",
    options: [
      {
        text: "Desarmar problemas lógicos, encontrar patrones y automatizar tareas.",
        points: { "desarrollo-software": 3 },
      },
      {
        text: "Detectar por dónde alguien podría hacer trampa o romper las reglas.",
        points: { "redes": 3 },
      },
      {
        text: "Diseñar cosas visualmente atractivas, armoniosas y fáciles de entender.",
        points: { "entornos-virtuales": 3 },
      },
    ],
  },
  {
    id: 5,
    question: "5/5 **META FINAL:** Al graduarte de la UTT y entrar al mundo laboral, ¿dónde te visualizas?",
    options: [
      {
        text: "En una empresa de tecnología o trabajando remoto para el extranjero creando software.",
        points: { "desarrollo-software": 3 },
      },
      {
        text: "Administrando los centros de datos y la seguridad informática de una corporación.",
        points: { "redes": 3 },
      },
      {
        text: "Creando experiencias interactivas 3D, simuladores médicos o mundos virtuales.",
        points: { "entornos-virtuales": 3 },
      },
    ],
  },
];


// Perfiles detallados y justificaciones con fortalezas (Reemplaza a CAREER_JUSTIFICATIONS)
export const CAREER_PROFILES: Record<
  string,
  {
    title: string;
    strengths: string[];
    justification: string;
  }
> = {
  "desarrollo-software": {
    title: "Perfil: Creador Digital y Arquitecto de Software",
    strengths: [
      "Pensamiento lógico-estructurado",
      "Resolución algorítmica de problemas",
      "Pasión por construir herramientas y plataformas útiles",
    ],
    justification:
      "Tienes una mente orientada a entender cómo funcionan los engranes detrás de las aplicaciones. Te apasiona ver cómo unas líneas de lógica se transforman en una plataforma real que facilita la vida de las personas.",
  },
  "redes": {
    title: "Perfil: Estratega de Infraestructura y Ciberdefensa",
    strengths: [
      "Visión preventiva y seguridad digital",
      "Pensamiento sistémico e interconexión",
      "Garantía de estabilidad operativa y protección de datos",
    ],
    justification:
      "Posees un perfil analítico que valora la estabilidad, la conexión y la protección de datos. En un mundo donde todo está conectado a internet, tu vocación es garantizar que la infraestructura nunca se caiga y que la información confidencial esté blindada.",
  },
  "entornos-virtuales": {
    title: "Perfil: Diseñador de Experiencias Inmersivas y Nuevas Realidades",
    strengths: [
      "Creatividad visual y espacial",
      "Diseño de interacción y experiencia de usuario",
      "Curiosidad por tecnologías emergentes (VR/AR/3D/Videojuegos)",
    ],
    justification:
      "Combinas el talento visual con la tecnología interactiva. No solo quieres que un sistema funcione, quieres que sorprenda visualmente y sumerja al usuario en experiencias envolventes, simuladores o videojuegos.",
  },
};

export const DEFAULT_SUGGESTIONS = [
  "Conocer carreras",
  "Ver eventos",
  "Orientación vocacional",
];