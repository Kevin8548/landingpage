import type { CareerDetail } from "../careerDetails";

import redesBack from "../../assets/careers/redes/redesII.jpg";
import redesFront from "../../assets/careers/redes/redes.jpg";
import studyPlan1 from "../../assets/careers/redes/study-1.jpg";
import studyPlan2 from "../../assets/careers/redes/study-2.jpg";
import studyPlan3 from "../../assets/careers/redes/study-3.jpg";
import perfil1 from "../../assets/careers/redes/perfil-1.jpg";
import perfil2 from "../../assets/careers/redes/perfil-2.jpg";
import life1 from "../../assets/careers/redes/life-1.jpg";
import life2 from "../../assets/careers/redes/life-2.jpg";
import life3 from "../../assets/careers/redes/life-3.jpg";
import life4 from "../../assets/careers/redes/life-4.jpg";
import life5 from "../../assets/careers/redes/life-5.jpg";
import life6 from "../../assets/careers/redes/life-6.jpg";
import life7 from "../../assets/careers/redes/life-7.jpg";
import life8 from "../../assets/careers/redes/life-8.jpg";
import life9 from "../../assets/careers/redes/life-9.jpg";
import life10 from "../../assets/careers/redes/life-10.jpg";
import life11 from "../../assets/careers/redes/life-11.jpg";
import life12 from "../../assets/careers/redes/life-12.jpg";
import life13 from "../../assets/careers/redes/life-13.jpg";
import life14 from "../../assets/careers/redes/life-14.jpg";
import life15 from "../../assets/careers/redes/life-15.jpg";
import life16 from "../../assets/careers/redes/life-16.jpg";

export const redes: CareerDetail = {
  id: "redes",
  nombre: "T.S.U. en Tecnologías de la Información Área Infraestructura de Redes Digitales",
  quote: "Garantiza la conectividad global y asegura la infraestructura que sostiene la nube.",
  videoSrc: "videos/redes.mp4",
  imageBack: redesBack,
  imageFront: redesFront,
  studyPlanImages: [studyPlan1, studyPlan2, studyPlan3],
  perfilIngresoImages: [perfil1, perfil2],
  stats: [
    { icon: "shield", label: "Tasa de Empleo", value: "94%", desc: "De egresados trabajando en administración de redes, soporte y ciberseguridad." },
    { icon: "server", label: "Certificaciones", value: "CCNA", desc: "Currículo alineado con estándares internacionales de la industria como Cisco." },
    { icon: "cloud", label: "Proyectos Reales", value: "4+", desc: "Prácticas de configuración de infraestructuras reales durante la carrera." },
    { icon: "briefcase", label: "Experiencia", value: "+1 año", desc: "Al realizar tus estadías, obtienes experiencia profesional documentada." }
  ],
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
    { image: life1, alt: "Vida estudiantil - Redes 1" },
    { image: life2, alt: "Vida estudiantil - Redes 2" },
    { image: life3, alt: "Vida estudiantil - Redes 3" },
    { image: life4, alt: "Vida estudiantil - Redes 4" },
    { image: life5, alt: "Vida estudiantil - Redes 5" },
    { image: life6, alt: "Vida estudiantil - Redes 6" },
    { image: life7, alt: "Vida estudiantil - Redes 7" },
    { image: life8, alt: "Vida estudiantil - Redes 8" },
    { image: life9, alt: "Vida estudiantil - Redes 9" },
    { image: life10, alt: "Vida estudiantil - Redes 10" },
    { image: life11, alt: "Vida estudiantil - Redes 11" },
    { image: life12, alt: "Vida estudiantil - Redes 12" },
    { image: life13, alt: "Vida estudiantil - Redes 13" },
    { image: life14, alt: "Vida estudiantil - Redes 14" },
    { image: life15, alt: "Vida estudiantil - Redes 15" },
    { image: life16, alt: "Vida estudiantil - Redes 16" },
  ],
};