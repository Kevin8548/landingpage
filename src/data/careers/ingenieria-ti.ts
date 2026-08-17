import type { CareerDetail } from "../careerDetails";

// Ingeniería es continuación de las TSU: no tiene Hero, perfil de ingreso
// ni vida estudiantil propios — solo aporta su plan de estudios (materias).
import studyPlan1 from "../../assets/careers/ingenieria/study-1.jpg";
import studyPlan2 from "../../assets/careers/ingenieria/study-2.jpg";

export const ingenieriaTI: CareerDetail = {
  id: "ingenieria-ti",
  nombre: "Ingeniería en Tecnologías de la Información e Innovación Digital",
  quote: "Lidera la transformación tecnológica integrando Inteligencia Artificial, Internet de las Cosas y Ciencia de Datos.",
  studyPlanImages: [studyPlan1, studyPlan2],
  stats: [
    { icon: "cpu", label: "Innovación", value: "IoT/IA", desc: "Materias fuertemente orientadas a tecnologías disruptivas y emergentes." },
    { icon: "briefcase", label: "Perfil Gerencial", value: "100%", desc: "Preparado para la gestión de proyectos de TI a gran escala y toma de decisiones." },
    { icon: "brain", label: "Proyectos Reales", value: "3+", desc: "Proyectos de innovación tecnológica desarrollados durante la ingeniería." },
    { icon: "chart-bar", label: "Experiencia", value: "+2 años", desc: "Sumando TSU + Ingeniería, acumulas experiencia práctica documentada." }
  ],
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
};