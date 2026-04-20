"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatNumber } from "@/lib/utils";

export type BarVotosItem = {
  nome: string;
  votos: number;
  partido?: string | null;
  situacao?: string | null;
};

type Props = {
  data: BarVotosItem[];
  emptyMessage?: string;
};

const COLORS = [
  "#2563eb",
  "#059669",
  "#f59e0b",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#db2777",
  "#65a30d",
];

export function BarChartVotos({
  data,
  emptyMessage = "Sem dados para os filtros selecionados.",
}: Props) {
  if (data.length === 0) {
    return (
      <div className="flex h-[420px] items-center justify-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  const height = Math.max(320, data.length * 28);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 24, bottom: 8, left: 8 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tickFormatter={formatNumber} />
        <YAxis
          type="category"
          dataKey="nome"
          width={180}
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          formatter={(value: number) => [formatNumber(value), "Votos"]}
          labelFormatter={(l) => String(l)}
          contentStyle={{ fontSize: 12 }}
        />
        <Bar dataKey="votos" radius={[0, 4, 4, 0]}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={
                entry.situacao?.toLowerCase().includes("eleito") &&
                !entry.situacao?.toLowerCase().includes("não")
                  ? "#059669"
                  : COLORS[i % COLORS.length]
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
