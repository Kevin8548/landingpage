import devBack from "../assets/careers/software/softwareII.jpg";
import devFront from "../assets/careers/software/software.jpg";
import redesBack from "../assets/careers/redes/redesII.jpg";
import redesFront from "../assets/careers/redes/redes.jpg";
import entornosBack from "../assets/careers/entornos/entornosII.jpg";
import entornosFront from "../assets/careers/entornos/entornos.jpg";
import { ShieldCheck, Code2, Boxes } from "lucide-react";
import {RectangleGoggles, SearchCodeIcon, Shapes, FileBracesCornerIcon, Pyramid, FileDigit, EarthLock } from "lucide-react";
import type { LucideIcon } from "lucide-react";


export interface Career {
  slug: string;
  tag: LucideIcon ;
  title: string;
  description: string;
  imageBack: string;
  imageFront: string;
  altBack: string;
  altFront: string;
  icon: LucideIcon;
}

export const careers: Career[] = [
  {
    slug: "desarrollo-software",
    tag: ShieldCheck,
    title: "Desarrollo y Gestión de Software",
    description:
      "Tu app favorita, tu videojuego, tu banco en línea, todo corre con software. Aprende a construirlo",
    imageBack: devBack,
    imageFront: devFront,
    altBack: "Desarrollador trabajando en múltiples monitores",
    altFront: "Código en pantalla",
    icon: Code2,
  },
  {
    slug: "redes",
    tag: EarthLock,
    title: "Redes y Ciberseguridad",
    description: "Protege la infraestructura que conecta todo, todo el tiempo.",
    imageBack: redesBack,
    imageFront: redesFront,
    altBack: "...",
    altFront: "...",
    icon: ShieldCheck,
  },
  {
    slug: "entornos-virtuales",
    tag: Boxes,
    title: "Entornos Virtuales y Negocios Digitales",
    description: "Diseña mundos en Realidad Virtual y Aumentada.",
    imageBack: entornosBack,
    imageFront: entornosFront,
    altBack: "...",
    altFront: "...",
    icon: Boxes
  },
  {
    slug: "ingenieria-ti",
    tag: Pyramid, 
    title: "Ingeniería en Tecnologías de la Información e Innovación Digital",
    description: "Continuación de las TSU hacia el nivel de Ingeniería.",
    imageBack: devBack,   
    imageFront: devFront, 
    altBack: "",
    altFront: "",
    icon: Code2,
  },
];