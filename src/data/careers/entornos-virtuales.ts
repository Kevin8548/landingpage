import type { CareerDetail } from "../careerDetails";

import entornosBack from "../../assets/careers/entornos/entornosII.jpg";
import entornosFront from "../../assets/careers/entornos/entornos.jpg";
import studyPlan1 from "../../assets/careers/entornos/study-1.jpg";
import studyPlan2 from "../../assets/careers/entornos/study-2.jpg";
import studyPlan3 from "../../assets/careers/entornos/study-3.jpg";
import perfil1 from "../../assets/careers/entornos/perfil-1.jpg";
import perfil2 from "../../assets/careers/entornos/perfil-2.jpg";
import life1 from "../../assets/careers/entornos/life-1.jpg";
import life2 from "../../assets/careers/entornos/life-2.jpg";
import life3 from "../../assets/careers/entornos/life-3.jpg";
import life4 from "../../assets/careers/entornos/life-4.jpg";
import life5 from "../../assets/careers/entornos/life-5.jpg";
import life6 from "../../assets/careers/entornos/life-6.jpg";
import life7 from "../../assets/careers/entornos/life-7.jpg";
import life8 from "../../assets/careers/entornos/life-8.jpg";
import life9 from "../../assets/careers/entornos/life-9.jpg";
import life10 from "../../assets/careers/entornos/life-10.jpg";
import life11 from "../../assets/careers/entornos/life-11.jpg";
import life12 from "../../assets/careers/entornos/life-12.jpg";
import life13 from "../../assets/careers/entornos/life-13.jpg";
import life14 from "../../assets/careers/entornos/life-14.jpg";
import life15 from "../../assets/careers/entornos/life-15.jpg";
import life16 from "../../assets/careers/entornos/life-16.jpg";

export const entornosVirtuales: CareerDetail = {
  id: "entornos-virtuales",
  nombre: "T.S.U. en Tecnologías de la Información Área Entornos Virtuales y Negocios Digitales",
  quote: "Fusiona el arte digital con la tecnología para crear experiencias interactivas y negocios de alto impacto.",
  videoSrc: "videos/entornos.mp4",
  imageBack: entornosBack,
  imageFront: entornosFront,
  studyPlanImages: [studyPlan1, studyPlan2, studyPlan3],
  perfilIngresoImages: [perfil1, perfil2],
  stats: [
    { icon: "palette", label: "Creatividad", value: "100%", desc: "Orientado al diseño interactivo, modelado 3D y estrategias de marketing digital." },
    { icon: "vr", label: "Inmersión", value: "AR/VR", desc: "Especialización en desarrollo para Realidad Virtual y Realidad Aumentada." },
    { icon: "gamepad", label: "Proyectos Reales", value: "5+", desc: "Entornos interactivos y campañas digitales desarrolladas durante la carrera." },
    { icon: "briefcase", label: "Experiencia", value: "+1 año", desc: "Al realizar tus estadías, obtienes experiencia profesional documentada." }
  ],
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
    { image: life1, alt: "Vida estudiantil - Entornos 1" },
    { image: life2, alt: "Vida estudiantil - Entornos 2" },
    { image: life3, alt: "Vida estudiantil - Entornos 3" },
    { image: life4, alt: "Vida estudiantil - Entornos 4" },
    { image: life5, alt: "Vida estudiantil - Entornos 5" },
    { image: life6, alt: "Vida estudiantil - Entornos 6" },
    { image: life7, alt: "Vida estudiantil - Entornos 7" },
    { image: life8, alt: "Vida estudiantil - Entornos 8" },
    { image: life9, alt: "Vida estudiantil - Entornos 9" },
    { image: life10, alt: "Vida estudiantil - Entornos 10" },
    { image: life11, alt: "Vida estudiantil - Entornos 11" },
    { image: life12, alt: "Vida estudiantil - Entornos 12" },
    { image: life13, alt: "Vida estudiantil - Entornos 13" },
    { image: life14, alt: "Vida estudiantil - Entornos 14" },
    { image: life15, alt: "Vida estudiantil - Entornos 15" },
    { image: life16, alt: "Vida estudiantil - Entornos 16" },
  ],
};