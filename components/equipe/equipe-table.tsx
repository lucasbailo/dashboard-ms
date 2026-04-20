"use client";

import { useMemo, useState, useTransition } from "react";
import { FileSpreadsheet, FileText, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { EquipeForm } from "./equipe-form";
import { deleteEquipeAction } from "@/app/(protected)/equipe/actions";
import { formatCurrency } from "@/lib/utils";
import type { Equipe } from "@/lib/types";

const PAGE_SIZE = 10;

type Props = { items: Equipe[] };

export function EquipeTable({ items }: Props) {
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(0);
  const [editando, setEditando] = useState<Equipe | null>(null);
  const [criando, setCriando] = useState(false);
  const [excluindo, setExcluindo] = useState<Equipe | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.nome.toLowerCase().includes(q) ||
        i.cidade.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q)
    );
  }, [items, busca]);

  const paginaItems = filtrados.slice(pagina * PAGE_SIZE, (pagina + 1) * PAGE_SIZE);
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));

  async function exportPdf() {
    const [{ default: jsPDF }, autoTableMod] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);
    const autoTable = (autoTableMod as { default: Function }).default;
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Equipe - Assessores e Coordenadores", 14, 16);
    autoTable(doc, {
      startY: 22,
      head: [["Nome", "Tipo", "Cidade", "Telefone", "Valor"]],
      body: filtrados.map((i) => [
        i.nome,
        i.tipo,
        i.cidade,
        i.telefone,
        formatCurrency(i.valor_contrato),
      ]),
      styles: { fontSize: 9 },
    });
    doc.save("equipe.pdf");
  }

  async function exportExcel() {
    const XLSX = await import("xlsx");
    const ws = XLSX.utils.json_to_sheet(
      filtrados.map((i) => ({
        Nome: i.nome,
        Email: i.email,
        Cidade: i.cidade,
        Estado: i.estado,
        Endereco: i.endereco,
        Instagram: i.instagram,
        Telefone: i.telefone,
        Tipo: i.tipo,
        "Valor Contrato": i.valor_contrato,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Equipe");
    XLSX.writeFile(wb, "equipe.xlsx");
  }

  function handleDelete() {
    if (!excluindo) return;
    startTransition(async () => {
      const res = await deleteEquipeAction(excluindo.id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Excluído");
        setExcluindo(null);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Input
          placeholder="Buscar por nome, cidade ou e-mail..."
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setPagina(0);
          }}
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
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginaItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                  Nenhum registro encontrado
                </TableCell>
              </TableRow>
            ) : (
              paginaItems.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="font-medium">{i.nome}</TableCell>
                  <TableCell>
                    <Badge variant={i.tipo === "Coordenador" ? "default" : "secondary"}>
                      {i.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell>{i.cidade}</TableCell>
                  <TableCell className="text-muted-foreground">{i.email}</TableCell>
                  <TableCell>{i.telefone}</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(i.valor_contrato)}
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

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {filtrados.length} registro(s) — página {pagina + 1} de {totalPaginas}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagina((p) => Math.max(0, p - 1))}
            disabled={pagina === 0}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagina((p) => Math.min(totalPaginas - 1, p + 1))}
            disabled={pagina >= totalPaginas - 1}
          >
            Próxima
          </Button>
        </div>
      </div>

      <Dialog open={criando} onOpenChange={setCriando}>
        <DialogContent className="sm:max-w-xl">
          <EquipeForm onSuccess={() => setCriando(false)} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={editando !== null}
        onOpenChange={(o) => !o && setEditando(null)}
      >
        <DialogContent className="sm:max-w-xl">
          {editando && (
            <EquipeForm item={editando} onSuccess={() => setEditando(null)} />
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
              Excluir <strong>{excluindo?.nome}</strong>? Esta ação não pode ser desfeita.
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
