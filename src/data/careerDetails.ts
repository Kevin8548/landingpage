import { desarrolloSoftware } from "./careers/desarrollo-software";
import { redes } from "./careers/redes";
import { entornosVirtuales } from "./careers/entornos-virtuales";
import { ingenieriaTI } from "./careers/ingenieria-ti";

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
  id: string;
  nombre: string;
  quote: string;
  imageBack: string;
  imageFront: string;
  studyPlanImages: string[];
  perfilIngresoImages: string[];
  stats: { icon: string; label: string; value: string; desc: string }[];
  metodologia: { titulo: string; texto: string };
  cuatrimestres: Cuatrimestre[];
  perfilIngreso?: string[];
  perfilEgreso: string[];
  campoLaboral: { icon: string; titulo: string; desc: string }[];
  studentLife: StudentLifeImage[];
}

export const careerDetails: Record<string, CareerDetail> = {
  "desarrollo-software": desarrolloSoftware,
  "redes": redes,
  "entornos-virtuales": entornosVirtuales,
  "ingenieria-ti": ingenieriaTI,
};