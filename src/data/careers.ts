import devBack from "../assets/careers/softwareII.jpg";
import devFront from "../assets/careers/software.jpg";
import redesBack from "../assets/careers/redesII.jpg";
import redesFront from "../assets/careers/redes.jpg";
import entornosBack from "../assets/careers/entornosII.jpg";
import entornosFront from "../assets/careers/entornos.jpg";


export interface Career {
  slug: string;
  tag: string;
  title: string;
  description: string;
  imageBack: string;
  imageFront: string;
  altBack: string;
  altFront: string;
}

export const careers: Career[] = [
  {
    slug: "desarrollo-software",
    tag: "</>",
    title: "Desarrollo y Gestión de Software",
    description:
      "Tu app favorita, tu videojuego, tu banco en línea, todo corre con software. Aprende a construirlo",
    imageBack: devBack,
    imageFront: devFront,
    altBack: "Desarrollador trabajando en múltiples monitores",
    altFront: "Código en pantalla",
  },
  {
    slug: "redes",
    tag: "🔒",
    title: "Redes y Ciberseguridad",
    description: "Protege la infraestructura que conecta todo, todo el tiempo.",
    imageBack: redesBack,
    imageFront: redesFront,
    altBack: "...",
    altFront: "...",
  },
  {
    slug: "entornos-virtuales",
    tag: "🎮",
    title: "Entornos Virtuales y Negocios Digitales",
    description: "Diseña mundos en Realidad Virtual y Aumentada.",
    imageBack: entornosBack,
    imageFront: entornosFront,
    altBack: "...",
    altFront: "...",
  },
];