// src/data/rutasTransporte.ts

export interface Parada {
  nombre: string;
  descripcion?: string;
  coords?: [number, number]; // [latitud, longitud]
}

export interface RutaTransporte {
  id: string;
  nombre: string;
  origen: string;
  color: string; // Color de la línea en el mapa
  letreroCombi: string; // Lo que dice en el parabrisas
  baseSalida: string; // Dónde se toma
  tiempoAproximado: string;
  costoAproximado: string;
  horarioFrecuencia: string;
  estado: "disponible" | "en_verificacion";
  descripcionTransbordo?: string; // Para los que vienen de Puebla, Tlaxcala, etc.
  paradas: Parada[];
  // Coordenadas [lat, lng] que forman el trazo de la ruta hasta la UTT
  coordenadas: [number, number][];
}

// Coordenadas oficiales de la UTT (Campus El Carmen Xalpatlahuaya)
export const COORDENADAS_UTT: [number, number] = [19.38655, -97.96707];

export const RUTAS_TRANSPORTE: RutaTransporte[] = [
    {
    id: "huamantla",
    nombre: "Huamantla → UTT",
    origen: "Huamantla",
    color: "#059669", 
    letreroCombi: "UTT - XALPATLAHUAYA",
    baseSalida: "Base de combis Centro de Huamantla",
    tiempoAproximado: "20 - 25 min",
    costoAproximado: "$12.00 - $15.00 MXN",
    horarioFrecuencia: "Salidas cada 10 a 15 minutos (desde las 6:30 hrs)",
    estado: "disponible",
    descripcionTransbordo:
      "Si vienes de Puebla o el Oriente: Llega a la central de Huamantla y aborda la combi con destino a El Carmen Xalpatlahuaya / UTT.",
    paradas: [
      {
        nombre: "Base Huamantla",
        descripcion: "Punto de salida de colectivos",
        coords: [19.31704, -97.91996],
      },
      {
        nombre: "Salida hacia Carretera",
        descripcion: "Paso por zona urbana de Huamantla",
        coords: [19.32701, -97.92503],
      },
      {
        nombre: "San Diego Xalpatlahuaya",
        descripcion: "Desviación a la comunidad",
        coords: [19.37245, -97.95349],
      },
      {
        nombre: "Campus UTT (Llegada)",
        descripcion: "Acceso principal a la universidad",
        coords: [19.38593, -97.96722],
      },
    ],
    coordenadas: [
      [19.31704, -97.91996],
      [19.31709, -97.91995],
      [19.31824, -97.91961],
      [19.31973, -97.91978],
      [19.32153, -97.92032],
      [19.32336, -97.92153],
      [19.32528, -97.9234],
      [19.32701, -97.92503],
      [19.33077, -97.92988],
      [19.3326, -97.93231],
      [19.35764, -97.94534],
      [19.37245, -97.95349],
      [19.37352, -97.95412],
      [19.37539, -97.95521],
      [19.38441, -97.96096],
      [19.38593, -97.96722],
    ],
  },
  {
    id: "apizaco",
    nombre: "Apizaco → UTT",
    origen: "Apizaco",
    color: "#D97706", // Naranja
    letreroCombi: "APIZACO / XALPA - UTT",
    baseSalida: "Terminal / Base Cuauhtémoc (cerca de La Maquinita / Centro de Apizaco)",
    tiempoAproximado: "35 - 55 min",
    costoAproximado: "$15.00",
    horarioFrecuencia: "Salidas cada 15 a 20 minutos",
    estado: "disponible",
    descripcionTransbordo:
      "Si vienes de Tlaxcala Capital, Chiautempan o Calpulalpan: toma el colectivo hacia Apizaco (Centro o Maquinita) y de ahí conecta con la combi directa a la UTT / Huamantla.",
    paradas: [
      { nombre: "Terminal Apizaco Centro", descripcion: "Punto de salida", coords: [19.4168, -98.1405] },
      { nombre: "Carretera Apizaco - Huamantla", descripcion: "Tramo libre", coords: [19.3950, -98.0500] },
      { nombre: "Desviación a UTT / Xalpatlahuaya", descripcion: "Entronque", coords: [19.3820, -97.9780] },
      { nombre: "Campus UTT", descripcion: "Entrada principal", coords: COORDENADAS_UTT },
    ],
    coordenadas: [
      [19.41169, -98.14328],
      [19.4080, -98.1150],
      [19.3950, -98.0500],
      [19.3890, -98.0100],
      [19.3820, -97.9780],
      [19.38655, -97.96707],
    ],
  },
  {
    id: "xalpa",
    nombre: "El Carmen Xalpatlahuaya → UTT",
    origen: "Xalpa",
    color: "#E11D48", // Verde esmeralda
    letreroCombi: "LOCAL / UTT DIRECTO",
    baseSalida: "Parque / Centro de El Carmen Xalpatlahuaya",
    tiempoAproximado: "5 - 10 min (o caminando 15 min)",
    costoAproximado: "$9.00 - $11.00 MXN",
    horarioFrecuencia: "Paso continuo local",
    estado: "disponible",
    descripcionTransbordo:
      "Ruta corta local ideal para quienes rentan o viven en la comunidad de Xalpatlahuaya.",
    paradas: [
      { nombre: "Centro de Xalpatlahuaya", descripcion: "Plaza principal", coords: [19.3785, -97.9555] },
      { nombre: "Avenida Universidad", descripcion: "Camino de acceso", coords: [19.3820, -97.9615] },
      { nombre: "Puerta Campus UTT", descripcion: "Llegada", coords: COORDENADAS_UTT },
    ],
    coordenadas: [
      [19.3785, -97.9555],
      [19.3802, -97.9580],
      [19.3820, -97.9615],
      [19.3850, -97.9645],
      [19.38655, -97.96707],
    ],
  },
  {
    id: "terrenate",
    nombre: "Terrenate → UTT",
    origen: "Terrenate",
    color: "#2563EB",  //Azul
    letreroCombi: "TERRENATE - HUAMANTLA (Vía UTT)",
    baseSalida: "Plaza Principal de Terrenate",
    tiempoAproximado: "30 - 40 min",
    costoAproximado: "Por confirmar",
    horarioFrecuencia: "Horarios específicos matutinos y vespertinos",
    estado: "en_verificacion",
    descripcionTransbordo:
      "Información de recorrido en validación. Puedes consultar en servicios escolares o tomar la ruta vía Apizaco/Huamantla mientras tanto.",
    paradas: [
      { nombre: "Centro de Terrenate", coords: [19.4755, -97.9355] },
      { nombre: "Campus UTT", coords: COORDENADAS_UTT },
    ],
    coordenadas: [
      [19.4755, -97.9355],
      [19.4300, -97.9500],
      [19.38655, -97.96707],
    ],
  },
  {
    id: "tocatlan",
    nombre: "Tocatlán → UTT",
    origen: "Tocatlán",
    color: "#7C3AED", // Violeta
    letreroCombi: "TOCATLÁN - XALPA / UTT",
    baseSalida: "Centro de Tocatlán",
    tiempoAproximado: "20 - 30 min",
    costoAproximado: "Por confirmar",
    horarioFrecuencia: "Horarios matutinos",
    estado: "en_verificacion",
    descripcionTransbordo:
      "Ruta intermunicipal. Consulta los horarios de paso directo hacia la universidad.",
    paradas: [
      { nombre: "Centro de Tocatlán", coords: [19.3888, -98.0305] },
      { nombre: "Campus UTT", coords: COORDENADAS_UTT },
    ],
    coordenadas: [
      [19.3888, -98.0305],
      [19.3860, -97.9950],
      [19.38655, -97.96707],
    ],
  },
];