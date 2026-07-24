import type { CareerDetail } from "../careerDetails";

import softwareBack from "../../assets/careers/software/softwareII.jpg";
import softwareFront from "../../assets/careers/software/software.jpg";
import studyPlan1 from "../../assets/careers/software/study-1.jpg";
import studyPlan2 from "../../assets/careers/software/study-2.jpg";
import studyPlan3 from "../../assets/careers/software/study-3.jpg";
import perfil1 from "../../assets/careers/software/perfil-1.jpg";
import perfil2 from "../../assets/careers/software/perfil-2.jpg";
import life1 from "../../assets/careers/software/life-1.jpg";
import life2 from "../../assets/careers/software/life-2.jpg";
import life3 from "../../assets/careers/software/life-3.jpg";
import life4 from "../../assets/careers/software/life-4.jpg";
import life5 from "../../assets/careers/software/life-5.jpg";
import life6 from "../../assets/careers/software/life-6.jpg";
import life7 from "../../assets/careers/software/life-7.jpg";
import life8 from "../../assets/careers/software/life-8.jpg";
import life9 from "../../assets/careers/software/life-9.jpg";
import life10 from "../../assets/careers/software/life-10.jpg";
import life11 from "../../assets/careers/software/life-11.jpg";
import life12 from "../../assets/careers/software/life-12.jpg";
import life13 from "../../assets/careers/software/life-13.jpg";
import life14 from "../../assets/careers/software/life-14.jpg";
import life15 from "../../assets/careers/software/life-15.jpg";
import life16 from "../../assets/careers/software/life-16.jpg";

export const desarrolloSoftware: CareerDetail = {
  id: "desarrollo-software",
  nombre: "T.S.U. en Tecnologías de la Información Área Desarrollo de Software Multiplataforma",
  quote: "No solo escribas código, construye soluciones interconectadas que transformen el mundo digital.",
  videoSrc: "videos/software.mp4",
  imageBack: softwareBack,
  imageFront: softwareFront,
  studyPlanImages: [studyPlan1, studyPlan2, studyPlan3],
  perfilIngresoImages: [perfil1, perfil2],
  stats: [
    { icon: "terminal", label: "Empleabilidad", value: "95%", desc: "Egresados laborando en desarrollo de software y TI a nivel nacional." },
    { icon: "code", label: "Enfoque Práctico", value: "70/30", desc: "Relación de horas de desarrollo práctico frente a teoría conceptual." },
    { icon: "database", label: "Proyectos Reales", value: "5+", desc: "Entregables de software funcionales desarrollados durante toda la carrera." },
    { icon: "briefcase", label: "Experiencia", value: "+1 año", desc: "Al realizar tus estadías, obtienes experiencia profesional documentada." }
  ],
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
    { image: life1, alt: "Vida estudiantil - Software 1" },
    { image: life2, alt: "Vida estudiantil - Software 2" },
    { image: life3, alt: "Vida estudiantil - Software 3" },
    { image: life4, alt: "Vida estudiantil - Software 4" },
    { image: life5, alt: "Vida estudiantil - Software 5" },
    { image: life6, alt: "Vida estudiantil - Software 6" },
    { image: life7, alt: "Vida estudiantil - Software 7" },
    { image: life8, alt: "Vida estudiantil - Software 8" },
    { image: life9, alt: "Vida estudiantil - Software 9" },
    { image: life10, alt: "Vida estudiantil - Software 10" },
    { image: life11, alt: "Vida estudiantil - Software 11" },
    { image: life12, alt: "Vida estudiantil - Software 12" },
    { image: life13, alt: "Vida estudiantil - Software 13" },
    { image: life14, alt: "Vida estudiantil - Software 14" },
    { image: life15, alt: "Vida estudiantil - Software 15" },
    { image: life16, alt: "Vida estudiantil - Software 16" },
  ],
};