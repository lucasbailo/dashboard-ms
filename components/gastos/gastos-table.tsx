"use client";

import { useMemo, useState, useTransition } from "react";
import { FileSpreadsheet, FileText, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GastosForm } from "./gastos-form";
import { deleteGastoAction } from "@/app/(protected)/gastos/actions";
import { formatCurrency } from "@/lib/utils";
import type { GastoCampanha } from "@/lib/types";

type Props = { items: GastoCampanha[] };

export function GastosTable({ items }: Props) {
  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState<GastoCampanha | null>(null);
  const [criando, setCriando] = useState(false);
  const [excluindo, setExcluindo] = useState<GastoCampanha | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.cidade.toLowerCase().includes(q));
  }, [items, busca]);

  const totalGeral = filtrados.reduce((acc, i) => acc + i.valor_total_geral, 0);

  const porCidade = useMemo(() => {
    const map = new Map<string, number>();
    for (const i of filtrados) {
      map.set(i.cidade, (map.get(i.cidade) ?? 0) + i.valor_total_geral);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [filtrados]);

  async function exportPdf() {
    const [{ default: jsPDF }, autoTableMod] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);
    const autoTable = (autoTableMod as { default: Function }).default;
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(14);
    doc.text("Gastos de Campanha", 14, 16);
    autoTable(doc, {
      startY: 22,
      head: [
        [
          "Cidade",
          "Carro",
          "Gasolina",
          "Hosp.",
          "Pedágio",
          "Alim.",
          "Gráfico",
          "Contratados",
          "Total Geral",
        ],
      ],
      body: filtrados.map((i) => [
        i.cidade,
        formatCurrency(i.aluguel_carro),
        formatCurrency(i.gastos_gasolina),
        formatCurrency(i.valor_total_hospedagem),
        formatCurrency(i.pedagio),
        formatCurrency(i.gastos_alimentacao),
        formatCurrency(i.gastos_material_grafico),
        formatCurrency(i.valor_total_contratados),
        formatCurrency(i.valor_total_geral),
      ]),
      styles: { fontSize: 8 },
      foot: [["TOTAL", "", "", "", "", "", "", "", formatCurrency(totalGeral)]],
    });
    doc.save("gastos-campanha.pdf");
  }

  async function exportExcel() {
    const XLSX = await import("xlsx");
    const ws = XLSX.utils.json_to_sheet(
      filtrados.map((i) => ({
        Cidade: i.cidade,
        "Aluguel Carro": i.aluguel_carro,
        "Gastos Gasolina": i.gastos_gasolina,
        "Litros Gasolina": i.litros_gasolina,
        "Diária Hotel": i.valor_diaria_hotel,
        "Qtd Diárias": i.quantidade_diarias,
        "Total Hospedagem": i.valor_total_hospedagem,
        Pedágio: i.pedagio,
        Alimentação: i.gastos_alimentacao,
        "Material Gráfico": i.gastos_material_grafico,
        "Nº Contratados": i.numero_contratados,
        "Valor Unit. Contrato": i.valor_unitario_contrato,
        "Total Contratados": i.valor_total_contratados,
        "Total Geral": i.valor_total_geral,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Gastos");
    XLSX.writeFile(wb, "gastos-campanha.xlsx");
  }

  function handleDelete() {
    if (!excluindo) return;
    startTransition(async () => {
      const res = await deleteGastoAction(excluindo.id);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Excluído");
        setExcluindo(null);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-3xl font-bold text-primary">
              {formatCurrency(totalGeral)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {filtrados.length} registro(s){busca ? " (filtrados)" : ""}
            </p>
          </CardContent>
        </Card>

        <Card className="md:min-w-[320px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Por cidade (top 5)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {porCidade.length === 0 ? (
              <p className="text-sm text-muted-foreground">—</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {porCidade.slice(0, 5).map(([cidade, total]) => (
                  <li key={cidade} className="flex justify-between gap-4">
                    <span className="truncate">{cidade}</span>
                    <span className="font-mono font-medium">
                      {formatCurrency(total)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Input
          placeholder="Buscar por cidade..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="md:max-w-sm"
        />
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={exportPdf}>
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={exportExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Excel
          </Button>
          <Button size="sm" onClick={() => setCriando(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar novo
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cidade</TableHead>
              <TableHead className="text-right">Carro</TableHead>
              <TableHead className="text-right">Gasolina</TableHead>
              <TableHead className="text-right">Hospedagem</TableHead>
              <TableHead className="text-right">Contratados</TableHead>
              <TableHead className="text-right">Total Geral</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                  Nenhum registro encontrado
                </TableCell>
              </TableRow>
            ) : (
              filtrados.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="font-medium">{i.cidade}</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(i.aluguel_carro)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(i.gastos_gasolina)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(i.valor_total_hospedagem)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(i.valor_total_contratados)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold text-primary">
                    {formatCurrency(i.valor_total_geral)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditando(i)}
                        aria-label="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setExcluindo(i)}
                        aria-label="Excluir"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={criando} onOpenChange={setCriando}>
        <DialogContent className="sm:max-w-2xl">
          <GastosForm onSuccess={() => setCriando(false)} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={editando !== null}
        onOpenChange={(o) => !o && setEditando(null)}
      >
        <DialogContent className="sm:max-w-2xl">
          {editando && (
            <GastosForm item={editando} onSuccess={() => setEditando(null)} />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={excluindo !== null}
        onOpenChange={(o) => !o && setExcluindo(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Excluir o gasto da cidade <strong>{excluindo?.cidade}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExcluindo(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
