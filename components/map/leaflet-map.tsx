"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix marker default icons com bundlers
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const highlightIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconRetinaUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const PONTA_PORA: [number, number] = [-22.5356, -55.7256];

type Coords = { lat: number; lon: number };

async function geocode(municipio: string): Promise<Coords | null> {
  const cacheKey = `geo:${municipio.toLowerCase()}`;
  const cached = typeof window !== "undefined" ? localStorage.getItem(cacheKey) : null;
  if (cached) return JSON.parse(cached);

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    `${municipio}, Mato Grosso do Sul, Brasil`
  )}&limit=1`;

  try {
    const res = await fetch(url, { headers: { "Accept-Language": "pt-BR" } });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (data.length === 0) return null;
    const coords = { lat: Number(data[0].lat), lon: Number(data[0].lon) };
    if (typeof window !== "undefined") {
      localStorage.setItem(cacheKey, JSON.stringify(coords));
    }
    return coords;
  } catch {
    return null;
  }
}

function Recenter({ coords }: { coords: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo(coords, 10, { duration: 1.2 });
  }, [coords, map]);
  return null;
}

type Props = { municipio?: string };

export default function LeafletMap({ municipio }: Props) {
  const [coords, setCoords] = useState<[number, number] | null>(null);

  useEffect(() => {
    let active = true;
    if (!municipio) {
      setCoords(null);
      return;
    }
    geocode(municipio).then((c) => {
      if (active && c) setCoords([c.lat, c.lon]);
    });
    return () => {
      active = false;
    };
  }, [municipio]);

  return (
    <MapContainer
      center={PONTA_PORA}
      zoom={8}
      style={{ height: "100%", width: "100%", minHeight: 420 }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={PONTA_PORA} icon={defaultIcon}>
        <Popup>
          <strong>Ponta Porã / MS</strong>
          <br />
          Centro da análise
        </Popup>
      </Marker>
      {coords && municipio && (
        <Marker position={coords} icon={highlightIcon}>
          <Popup>
            <strong>{municipio}</strong>
            <br />
            Cidade selecionada
          </Popup>
        </Marker>
      )}
      <Recenter coords={coords} />
    </MapContainer>
  );
}
