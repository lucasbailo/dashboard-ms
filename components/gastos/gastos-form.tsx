"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import {
  saveGastoAction,
  type GastosFormState,
} from "@/app/(protected)/gastos/actions";
import type { GastoCampanha } from "@/lib/types";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : label}
    </Button>
  );
}

type Props = {
  item?: GastoCampanha | null;
  onSuccess: () => void;
};

type Vals = {
  aluguel_carro: number;
  gastos_gasolina: number;
  valor_diaria_hotel: number;
  quantidade_diarias: number;
  pedagio: number;
  gastos_alimentacao: number;
  gastos_material_grafico: number;
  numero_contratados: number;
  valor_unitario_contrato: number;
};

function toNum(v: string): number {
  const n = Number.parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

export function GastosForm({ item, onSuccess }: Props) {
  const [state, formAction] = useFormState<GastosFormState, FormData>(
    saveGastoAction,
    { error: null }
  );

  const [vals, setVals] = useState<Vals>({
    aluguel_carro: item?.aluguel_carro ?? 0,
    gastos_gasolina: item?.gastos_gasolina ?? 0,
    valor_diaria_hotel: item?.valor_diaria_hotel ?? 0,
    quantidade_diarias: item?.quantidade_diarias ?? 0,
    pedagio: item?.pedagio ?? 0,
    gastos_alimentacao: item?.gastos_alimentacao ?? 0,
    gastos_material_grafico: item?.gastos_material_grafico ?? 0,
    numero_contratados: item?.numero_contratados ?? 0,
    valor_unitario_contrato: item?.valor_unitario_contrato ?? 0,
  });

  useEffect(() => {
    if (state.error === null && state.fieldErrors === undefined) return;
    if (state.error === null) {
      toast.success(item ? "Atualizado com sucesso" : "Adicionado com sucesso");
      onSuccess();
    } else if (!state.fieldErrors) {
      toast.error(state.error);
    }
  }, [state, item, onSuccess]);

  const totalContratados = vals.numero_contratados * vals.valor_unitario_contrato;
  const totalHospedagem = vals.valor_diaria_hotel * vals.quantidade_diarias;
  const totalGeral =
    vals.aluguel_carro +
    vals.gastos_gasolina +
    totalHospedagem +
    vals.pedagio +
    vals.gastos_alimentacao +
    vals.gastos_material_grafico +
    totalContratados;

  const fe = state.fieldErrors ?? {};

  function bindNum<K extends keyof Vals>(k: K) {
    return {
      defaultValue: item?.[k as keyof GastoCampanha] as number | undefined ?? 0,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setVals((v) => ({ ...v, [k]: toNum(e.target.value) })),
    };
  }

  return (
    <form action={formAction} className="space-y-4">
      <DialogHeader>
        <DialogTitle>{item ? "Editar gasto" : "Adicionar gasto por cidade"}</DialogTitle>
      </DialogHeader>

      {item?.id && <input type="hidden" name="id" value={item.id} />}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field label="Cidade" error={fe.cidade} className="md:col-span-2">
          <Input name="cidade" defaultValue={item?.cidade ?? ""} required />
        </Field>

        <Field label="Aluguel de carro (R$)" error={fe.aluguel_carro}>
          <Input name="aluguel_carro" type="number" step="0.01" min="0" {...bindNum("aluguel_carro")} required />
        </Field>
        <Field label="Gastos com gasolina (R$)" error={fe.gastos_gasolina}>
          <Input name="gastos_gasolina" type="number" step="0.01" min="0" {...bindNum("gastos_gasolina")} required />
        </Field>
        <Field label="Litros de gasolina" error={fe.litros_gasolina}>
          <Input
            name="litros_gasolina"
            type="number"
            step="0.01"
            min="0"
            defaultValue={item?.litros_gasolina ?? 0}
            required
          />
        </Field>
        <Field label="Pedágio (R$)" error={fe.pedagio}>
          <Input name="pedagio" type="number" step="0.01" min="0" {...bindNum("pedagio")} required />
        </Field>

        <Field label="Diária hotel (R$)" error={fe.valor_diaria_hotel}>
          <Input name="valor_diaria_hotel" type="number" step="0.01" min="0" {...bindNum("valor_diaria_hotel")} required />
        </Field>
        <Field label="Qtd. diárias" error={fe.quantidade_diarias}>
          <Input name="quantidade_diarias" type="number" min="0" step="1" {...bindNum("quantidade_diarias")} required />
        </Field>

        <Field label="Gastos com alimentação (R$)" error={fe.gastos_alimentacao}>
          <Input name="gastos_alimentacao" type="number" step="0.01" min="0" {...bindNum("gastos_alimentacao")} required />
        </Field>
        <Field label="Gastos com material gráfico (R$)" error={fe.gastos_material_grafico}>
          <Input name="gastos_material_grafico" type="number" step="0.01" min="0" {...bindNum("gastos_material_grafico")} required />
        </Field>

        <Field label="Nº contratados" error={fe.numero_contratados}>
          <Input name="numero_contratados" type="number" min="0" step="1" {...bindNum("numero_contratados")} required />
        </Field>
        <Field label="Valor unitário por contrato (R$)" error={fe.valor_unitario_contrato}>
          <Input name="valor_unitario_contrato" type="number" step="0.01" min="0" {...bindNum("valor_unitario_contrato")} required />
        </Field>
      </div>

      <div className="rounded-lg border bg-muted/40 p-4 text-sm">
        <div className="grid grid-cols-3 gap-2">
          <div>
            <p className="text-muted-foreground">Total hospedagem</p>
            <p className="font-mono font-semibold">{formatCurrency(totalHospedagem)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total contratados</p>
            <p className="font-mono font-semibold">{formatCurrency(totalContratados)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total geral</p>
            <p className="font-mono font-semibold text-primary">
              {formatCurrency(totalGeral)}
            </p>
          </div>
        </div>
      </div>

      {state.error && !state.fieldErrors && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <DialogFooter>
        <SubmitButton label={item ? "Salvar alterações" : "Adicionar"} />
      </DialogFooter>
    </form>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
