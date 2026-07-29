export interface Materia {
  nombre: string;
  clave: boolean;
  descripcion?: string;
}

export interface StudentLifeImage {
  image: string;
  imageSmall?: string;
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
  videoSrc?: string;
  imageBack?: string;
  imageFront?: string;
  studyPlanImages: string[];
  perfilImages?: string[];
  stats: { icon: string; label: string; value: string; desc: string }[];
  metodologia: { titulo: string; texto: string };
  cuatrimestres: Cuatrimestre[];
  perfilIngreso?: string[];
  perfilEgreso: string[];
  campoLaboral: { icon: string; titulo: string; desc: string }[];
  studentLife?: StudentLifeImage[];
}

export type CareerId =
  | "desarrollo-software"
  | "redes"
  | "entornos-virtuales"
  | "ingenieria-ti";

// Cada carrera contiene muchas referencias a imágenes. Cargarlas bajo demanda
// evita que la visita a una carrera prepare los datos de las demás.
const careerLoaders: Record<CareerId, () => Promise<CareerDetail>> = {
  "desarrollo-software": () =>
    import("./careers/desarrollo-software").then(({ desarrolloSoftware }) => desarrolloSoftware),
  redes: () => import("./careers/redes").then(({ redes }) => redes),
  "entornos-virtuales": () =>
    import("./careers/entornos-virtuales").then(({ entornosVirtuales }) => entornosVirtuales),
  "ingenieria-ti": () =>
    import("./careers/ingenieria-ti").then(({ ingenieriaTI }) => ingenieriaTI),
};

export function loadCareerDetail(id: string): Promise<CareerDetail | undefined> {
  const loader = careerLoaders[id as CareerId];
  return loader ? loader() : Promise.resolve(undefined);
}
