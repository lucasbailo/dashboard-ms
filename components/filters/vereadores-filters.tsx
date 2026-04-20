"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const ALL = "__all__";
const MAX_DISTANCIA = 1000;

type Props = { municipios: string[] };

export function VereadoresFilters({ municipios }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [municipio, setMunicipio] = useState(params.get("municipio") ?? ALL);
  const [distancia, setDistancia] = useState(
    Number.parseInt(params.get("distancia") ?? String(MAX_DISTANCIA), 10)
  );
  const [votosMax, setVotosMax] = useState(params.get("votosMax") ?? "");

  function aplicar() {
    const next = new URLSearchParams();
    if (municipio !== ALL) next.set("municipio", municipio);
    if (distancia < MAX_DISTANCIA) next.set("distancia", String(distancia));
    if (votosMax && Number.parseInt(votosMax, 10) > 0) {
      next.set("votosMax", votosMax);
    }
    startTransition(() => router.push(`?${next.toString()}`));
  }

  function limpar() {
    setMunicipio(ALL);
    setDistancia(MAX_DISTANCIA);
    setVotosMax("");
    startTransition(() => router.push("?"));
  }

  return (
    <div className="grid gap-4 rounded-lg border bg-card p-4 md:grid-cols-[1fr_1fr_160px_auto]">
      <div className="space-y-1.5">
        <Label>🏙️ Cidade</Label>
        <Select value={municipio} onValueChange={setMunicipio}>
          <SelectTrigger>
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas</SelectItem>
            {municipios.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>
          📍 Distância:{" "}
          <span className="font-mono text-primary">até {distancia} km</span>
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

      <div className="space-y-1.5">
        <Label>🗳️ Até X votos</Label>
        <Input
          type="number"
          min={0}
          placeholder="Ex: 200"
          value={votosMax}
          onChange={(e) => setVotosMax(e.target.value)}
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
