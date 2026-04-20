"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import type { Votacao } from "@/lib/types";

function situacaoBadge(s: string | null) {
  if (!s) return <Badge variant="outline">—</Badge>;
  const lower = s.toLowerCase();
  if (lower.includes("eleito") && !lower.includes("não")) {
    return <Badge variant="success">{s}</Badge>;
  }
  if (lower.includes("suplente")) return <Badge variant="warning">{s}</Badge>;
  if (lower.includes("branco") || lower.includes("nulo"))
    return <Badge variant="outline">{s}</Badge>;
  return <Badge variant="secondary">{s}</Badge>;
}

type Props = { vereadores: Votacao[] };

export function VereadoresSplitView({ vereadores }: Props) {
  const [selected, setSelected] = useState<Votacao | null>(
    vereadores[0] ?? null
  );

  if (vereadores.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center text-sm text-muted-foreground">
        Nenhum vereador encontrado para os filtros selecionados.
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <Card>
        <div className="max-h-[70vh] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card">
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="text-right">Votos</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead>Município</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vereadores.map((v) => (
                <TableRow
                  key={v.id}
                  onClick={() => setSelected(v)}
                  className={`cursor-pointer ${
                    selected?.id === v.id ? "bg-muted" : ""
                  }`}
                >
                  <TableCell className="font-medium">
                    {v.nome_candidato}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatNumber(v.votos)}
                  </TableCell>
                  <TableCell>{situacaoBadge(v.situacao)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {v.municipio}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className="lg:sticky lg:top-20 lg:self-start">
        <Card>
          <CardContent className="space-y-4 p-6">
            {selected ? (
              <>
                <div className="flex justify-center">
                  {selected.foto_url ? (
                    <Image
                      src={selected.foto_url}
                      alt={selected.nome_candidato}
                      width={160}
                      height={200}
                      className="rounded-lg border object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-[200px] w-[160px] items-center justify-center rounded-lg border bg-muted text-xs text-muted-foreground">
                      Sem foto
                    </div>
                  )}
                </div>
                <div className="space-y-1 text-center">
                  <h3 className="text-lg font-semibold">
                    {selected.nome_candidato}
                  </h3>
                  {selected.numero_candidato && (
                    <p className="text-xs text-muted-foreground">
                      Número: {selected.numero_candidato}
                    </p>
                  )}
                </div>
                <div className="flex justify-center">
                  {situacaoBadge(selected.situacao)}
                </div>
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
                  <dt className="text-muted-foreground">Partido</dt>
                  <dd className="font-medium">{selected.partido ?? "—"}</dd>
                  <dt className="text-muted-foreground">Município</dt>
                  <dd className="font-medium">{selected.municipio}</dd>
                  <dt className="text-muted-foreground">Turno</dt>
                  <dd className="font-medium">{selected.turno}º</dd>
                  <dt className="text-muted-foreground">Votos</dt>
                  <dd className="font-mono font-medium text-primary">
                    {formatNumber(selected.votos)}
                  </dd>
                  {selected.distancia_ponta_pora != null && (
                    <>
                      <dt className="text-muted-foreground">Distância</dt>
                      <dd className="font-medium">
                        {selected.distancia_ponta_pora} km de Ponta Porã
                      </dd>
                    </>
                  )}
                </dl>
              </>
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Selecione um vereador na tabela para ver os detalhes.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
