"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const ALL = "__all__";
const MAX_DISTANCIA = 1000;

type Props = {
  municipios: string[];
  distanciaMax: number;
};

export function DashboardFilters({ municipios, distanciaMax }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [municipio, setMunicipio] = useState(params.get("municipio") ?? ALL);
  const [turno, setTurno] = useState(params.get("turno") ?? ALL);
  const [distancia, setDistancia] = useState<number>(
    Number.parseInt(params.get("distancia") ?? String(MAX_DISTANCIA), 10)
  );

  const topoMunicipios = useMemo(() => municipios.slice(0, 500), [municipios]);

  function aplicar() {
    const next = new URLSearchParams();
    if (municipio !== ALL) next.set("municipio", municipio);
    if (turno !== ALL) next.set("turno", turno);
    if (distancia < MAX_DISTANCIA) next.set("distancia", String(distancia));

    startTransition(() => {
      router.push(`?${next.toString()}`);
    });
  }

  function limpar() {
    setMunicipio(ALL);
    setTurno(ALL);
    setDistancia(MAX_DISTANCIA);
    startTransition(() => router.push("?"));
  }

  return (
    <div className="grid gap-4 rounded-lg border bg-card p-4 md:grid-cols-[1fr_180px_1fr_auto]">
      <div className="space-y-1.5">
        <Label>🏙️ Cidade</Label>
        <Select value={municipio} onValueChange={setMunicipio}>
          <SelectTrigger>
            <SelectValue placeholder="Todas as cidades" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas as cidades</SelectItem>
            {topoMunicipios.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>🕐 Turno</Label>
        <Select value={turno} onValueChange={setTurno}>
          <SelectTrigger>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos</SelectItem>
            <SelectItem value="1">1º turno</SelectItem>
            <SelectItem value="2">2º turno</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>
          📍 Distância de Ponta Porã:{" "}
          <span className="font-mono text-primary">
            até {distancia} km
          </span>
        </Label>
        <Slider
          value={[distancia]}
          min={0}
          max={MAX_DISTANCIA}
          step={10}
          onValueChange={(v) => setDistancia(v[0])}
          className="py-2"
        />
      </div>

      <div className="flex items-end gap-2">
        <Button onClick={aplicar} disabled={isPending}>
          {isPending ? "..." : "Filtrar"}
        </Button>
        <Button variant="outline" onClick={limpar} disabled={isPending}>
          Limpar
        </Button>
      </div>
    </div>
  );
}
