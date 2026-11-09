// src/components/sections/aspirantes/RutasTransporte.tsx
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Bus,
  Clock,
  DollarSign,
  MapPin,
  Compass,
  AlertCircle,
  ExternalLink,
  Navigation,
  Crosshair,
} from "lucide-react";
import {
  RUTAS_TRANSPORTE,
  COORDENADAS_UTT,
  type RutaTransporte,
} from "../../../data/rutasTransporte";

export const RutasTransporte = () => {
  const [rutaSeleccionada, setRutaSeleccionada] = useState<RutaTransporte>(
    RUTAS_TRANSPORTE[0]
  );
  const [modoCaptura, setModoCaptura] = useState(false);
  const [puntosCapturados, setPuntosCapturados] = useState<[number, number][]>([]);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);

  // Inicializar mapa una sola vez
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Crear mapa centrado en la UTT
    const map = L.map(mapContainerRef.current, {
      center: COORDENADAS_UTT,
      zoom: 12,
      zoomControl: true,
      scrollWheelZoom: false, // Evita scroll molesto al navegar la página
    });

    // Capa de mapa estilo OSM estándar / Google-like claro
    L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=cb1_4xlh_1_cf1a01f2f4a28872c616bf5b',
    {
        attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
    }
    ).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layersGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Escuchar clics para capturar coordenadas si el modo captura está activo
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      if (!modoCaptura) return;
      const nuevaCoord: [number, number] = [
        Number(e.latlng.lat.toFixed(5)),
        Number(e.latlng.lng.toFixed(5)),
      ];
      setPuntosCapturados((prev) => [...prev, nuevaCoord]);
      navigator.clipboard?.writeText(`[${nuevaCoord[0]}, ${nuevaCoord[1]}],`);
      console.log(`Coordenada copiada: [${nuevaCoord[0]}, ${nuevaCoord[1]}]`);
    };

    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [modoCaptura]);

  // Actualizar trazo y pines cuando cambia la ruta seleccionada
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layersGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // 1. Icono personalizado para el Campus UTT (Destino)
    const uttIcon = L.divIcon({
      className: "custom-map-marker-utt",
      html: `
        <div style="background-color: #10B981; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid white; font-weight: bold; font-size: 11px;">
          UTT
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    // Marcador UTT
    const markerUTT = L.marker(COORDENADAS_UTT, { icon: uttIcon }).bindPopup(`
      <div style="font-family: sans-serif; font-size: 13px;">
        <strong style="color: #065F46;">Campus UTT</strong><br/>
        Universidad Tecnológica de Tlaxcala<br/>
        <small style="color: #666;">El Carmen Xalpatlahuaya</small>
      </div>
    `);
    group.addLayer(markerUTT);

    // 2. Icono de Origen (Base de la combi)
    if (rutaSeleccionada.coordenadas.length > 0) {
      const origenCoord = rutaSeleccionada.coordenadas[0];
      const origenIcon = L.divIcon({
        className: "custom-map-marker-origen",
        html: `
          <div style="background-color: ${rutaSeleccionada.color}; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid white;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.6-.2-1.1-.5-1.5-.7-.9-2.1-1.5-3.5-1.5H5c-1.4 0-2.8.6-3.5 1.5-.3.4-.5.9-.5 1.5 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const markerOrigen = L.marker(origenCoord, { icon: origenIcon }).bindPopup(`
        <div style="font-family: sans-serif; font-size: 13px;">
          <strong style="color: ${rutaSeleccionada.color};">Origen: ${rutaSeleccionada.origen}</strong><br/>
          ${rutaSeleccionada.baseSalida}
        </div>
      `);
      group.addLayer(markerOrigen);
    }

    // 3. Marcadores de paradas intermedias
    rutaSeleccionada.paradas.forEach((parada) => {
      if (!parada.coords) return;
      // Omitir si es igual al origen o al destino para no duplicar
      if (
        (parada.coords[0] === COORDENADAS_UTT[0] && parada.coords[1] === COORDENADAS_UTT[1]) ||
        (rutaSeleccionada.coordenadas.length > 0 &&
          parada.coords[0] === rutaSeleccionada.coordenadas[0][0] &&
          parada.coords[1] === rutaSeleccionada.coordenadas[0][1])
      ) {
        return;
      }

      const paradaMarker = L.circleMarker(parada.coords, {
        radius: 6,
        fillColor: rutaSeleccionada.color,
        color: "#ffffff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9,
      }).bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px;">
          <strong>${parada.nombre}</strong>
          ${parada.descripcion ? `<br/><small>${parada.descripcion}</small>` : ""}
        </div>
      `);
      group.addLayer(paradaMarker);
    });

    // 4. Trazo de la Polilínea (Ruta)
    if (rutaSeleccionada.coordenadas.length >= 2) {
      const polyline = L.polyline(rutaSeleccionada.coordenadas, {
        color: rutaSeleccionada.color,
        weight: 5,
        opacity: 0.85,
        lineCap: "round",
        lineJoin: "round",
      });
      group.addLayer(polyline);

      // Ajustar vista del mapa para encuadrar toda la ruta
      map.fitBounds(polyline.getBounds(), {
        padding: [50, 50],
        maxZoom: 14,
      });
    }
  }, [rutaSeleccionada]);

  // Generar URL para abrir en Google Maps
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${
    rutaSeleccionada.coordenadas[0]
      ? `${rutaSeleccionada.coordenadas[0][0]},${rutaSeleccionada.coordenadas[0][1]}`
      : rutaSeleccionada.origen
  }&destination=${COORDENADAS_UTT[0]},${COORDENADAS_UTT[1]}&travelmode=transit`;

  return (
    <section id="rutas-transporte" className="py-16 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
      {/* Encabezado */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 mb-3">
          <Navigation className="w-3.5 h-3.5" />
          Transporte y Acceso
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--ink)] tracking-tight">
          ¿Cómo llegar a la UTT?
        </h2>
        <p className="mt-3 text-base sm:text-lg text-[var(--ink)]/75">
          Conoce las rutas de combis y transporte colectivo que llegan directamente al
          Campus en El Carmen Xalpatlahuaya.
        </p>
      </div>

      {/* Selector de Rutas (Pills) */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
        {RUTAS_TRANSPORTE.map((ruta) => {
          const isSelected = ruta.id === rutaSeleccionada.id;
          return (
            <button
              key={ruta.id}
              onClick={() => setRutaSeleccionada(ruta)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-sm ${
                isSelected
                  ? "bg-[var(--ink)] text-[var(--bg)] scale-105 shadow-md"
                  : "bg-white/80 dark:bg-neutral-800/80 text-[var(--ink)]/80 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: ruta.color }}
              />
              {ruta.origen}
              {ruta.estado === "en_verificacion" && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                  Pronto
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Contenedor Principal: 2 Columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Columna Izquierda: Ficha Informativa de la Ruta (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 shadow-xl border border-neutral-200/80 dark:border-neutral-800 flex flex-col gap-6">
          {/* Título de la ruta */}
          <div>
            <div className="flex items-center justify-between gap-2">
              <span
                className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md text-white"
                style={{ backgroundColor: rutaSeleccionada.color }}
              >
                Ruta Colectiva
              </span>
              <span className="text-xs text-neutral-500 font-medium">
                {rutaSeleccionada.horarioFrecuencia}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-[var(--ink)] mt-2">
              {rutaSeleccionada.nombre}
            </h3>
          </div>

          {/* Letrero de la combi */}
          <div className="p-3.5 bg-neutral-100 dark:bg-neutral-800/80 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-700 flex items-center justify-center shrink-0 shadow-sm text-neutral-700 dark:text-neutral-200">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">
                Letrero en el parabrisas
              </p>
              <p className="font-mono text-sm sm:text-base font-bold text-[var(--ink)]">
                "{rutaSeleccionada.letreroCombi}"
              </p>
            </div>
          </div>

          {/* Datos rápidos (Tiempo y Costo) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-800 flex items-center gap-3">
              <Clock className="w-5 h-5 text-neutral-500 shrink-0" />
              <div>
                <p className="text-[11px] text-neutral-500">Tiempo aprox.</p>
                <p className="text-sm font-bold text-[var(--ink)]">
                  {rutaSeleccionada.tiempoAproximado}
                </p>
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-800 flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-neutral-500 shrink-0" />
              <div>
                <p className="text-[11px] text-neutral-500">Pasaje aprox.</p>
                <p className="text-sm font-bold text-[var(--ink)]">
                  {rutaSeleccionada.costoAproximado}
                </p>
              </div>
            </div>
          </div>

          {/* Dónde se toma (Base) */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-rose-500" />
              Base de salida
            </div>
            <p className="text-sm text-[var(--ink)] font-medium pl-5">
              {rutaSeleccionada.baseSalida}
            </p>
          </div>

          {/* Paradas principales */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
              <Compass className="w-4 h-4 text-emerald-500" />
              Paradas clave del trayecto
            </div>
            <ol className="relative border-l-2 border-neutral-200 dark:border-neutral-700 ml-2 space-y-4 text-sm">
              {rutaSeleccionada.paradas.map((parada, idx) => (
                <li key={idx} className="ml-4">
                  <span
                    className="absolute -left-[7px] mt-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-neutral-900"
                    style={{ backgroundColor: rutaSeleccionada.color }}
                  />
                  <p className="font-semibold text-[var(--ink)]">{parada.nombre}</p>
                  {parada.descripcion && (
                    <p className="text-xs text-neutral-500">{parada.descripcion}</p>
                  )}
                </li>
              ))}
            </ol>
          </div>

          {/* Transbordos / Conexiones lejanas */}
          {rutaSeleccionada.descripcionTransbordo && (
            <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/50 flex gap-3 text-xs text-sky-900 dark:text-sky-200 leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 text-sky-600 dark:text-sky-400 mt-0.5" />
              <div>
                <strong className="font-semibold block mb-0.5">
                  ¿Vienes de otra ciudad o municipio?
                </strong>
                {rutaSeleccionada.descripcionTransbordo}
              </div>
            </div>
          )}

          {/* Botón Google Maps */}
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 font-semibold text-sm transition-colors shadow-md"
          >
            Ver recorrido en Google Maps
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Columna Derecha: Mapa Interactivo (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="relative w-full h-[500px] sm:h-[580px] rounded-3xl overflow-hidden shadow-2xl border border-neutral-300/80 dark:border-neutral-800 z-0">
            {/* Contenedor Leaflet */}
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Tarjeta flotante con datos del destino */}
            <div className="absolute top-4 right-4 z-[500] bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-lg border border-neutral-200/80 dark:border-neutral-800 text-xs flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <p className="font-bold text-[var(--ink)]">Destino: UTT</p>
                <p className="text-[10px] text-neutral-500">Campus Xalpatlahuaya</p>
              </div>
            </div>

            {/* Botón flotante para el Modo Diseñador / Capturar puntos */}
            <button
              onClick={() => {
                setModoCaptura(!modoCaptura);
                if (!modoCaptura) setPuntosCapturados([]);
              }}
              title="Haz clic sobre el mapa para capturar y copiar coordenadas"
              className={`absolute bottom-4 left-4 z-[500] px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md shadow-md transition-all cursor-pointer ${
                modoCaptura
                  ? "bg-rose-600 text-white ring-2 ring-rose-400 animate-pulse"
                  : "bg-white/90 dark:bg-neutral-800/90 text-neutral-700 dark:text-neutral-200 hover:bg-white"
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
              {modoCaptura ? "Capturando clics (Activo)" : "Herramienta trazar ruta"}
            </button>
          </div>

          {/* Consola visual si activas el modo captura */}
          {modoCaptura && (
            <div className="p-3 bg-neutral-900 text-neutral-200 rounded-2xl text-xs font-mono">
              <div className="flex justify-between items-center mb-1 text-[11px] text-neutral-400">
                <span>Puntos clickeados en el mapa (se copian automáticamente):</span>
                <span>{puntosCapturados.length} puntos</span>
              </div>
              <div className="max-h-24 overflow-y-auto bg-black/50 p-2 rounded-lg select-all">
                {puntosCapturados.length === 0 ? (
                  <span className="text-neutral-500 italic">
                    Haz clic en las calles del mapa para guardar coordenadas...
                  </span>
                ) : (
                  puntosCapturados.map((pt, i) => (
                    <span key={i} className="block text-emerald-400">
                      [{pt[0]}, {pt[1]}],
                    </span>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};