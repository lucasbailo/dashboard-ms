"use client";

import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[420px] items-center justify-center text-sm text-muted-foreground">
      Carregando mapa...
    </div>
  ),
});

export function MapWrapper({ municipio }: { municipio?: string }) {
  return <LeafletMap municipio={municipio} />;
}
