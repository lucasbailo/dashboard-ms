"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { saveEquipeAction, type EquipeFormState } from "@/app/(protected)/equipe/actions";
import type { Equipe } from "@/lib/types";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : label}
    </Button>
  );
}

type Props = {
  item?: Equipe | null;
  onSuccess: () => void;
};

export function EquipeForm({ item, onSuccess }: Props) {
  const [state, formAction] = useFormState<EquipeFormState, FormData>(
    saveEquipeAction,
    { error: null }
  );

  useEffect(() => {
    if (state.error === null && state.fieldErrors === undefined) return;
    if (state.error === null) {
      toast.success(item ? "Atualizado com sucesso" : "Adicionado com sucesso");
      onSuccess();
    } else if (!state.fieldErrors) {
      toast.error(state.error);
    }
  }, [state, item, onSuccess]);

  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-4">
      <DialogHeader>
        <DialogTitle>{item ? "Editar membro" : "Adicionar novo membro"}</DialogTitle>
      </DialogHeader>

      {item?.id && <input type="hidden" name="id" value={item.id} />}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field label="Nome completo" error={fe.nome}>
          <Input name="nome" defaultValue={item?.nome ?? ""} required />
        </Field>
        <Field label="E-mail" error={fe.email}>
          <Input name="email" type="email" defaultValue={item?.email ?? ""} required />
        </Field>
        <Field label="Cidade" error={fe.cidade}>
          <Input name="cidade" defaultValue={item?.cidade ?? ""} required />
        </Field>
        <Field label="Estado" error={fe.estado}>
          <Input
            name="estado"
            defaultValue={item?.estado ?? "Mato Grosso do Sul"}
            required
          />
        </Field>
        <Field label="Endereço" error={fe.endereco} className="md:col-span-2">
          <Input
            name="endereco"
            defaultValue={item?.endereco ?? ""}
            placeholder="Rua/Av, nº, Bairro - complemento"
            required
          />
        </Field>
        <Field label="Instagram" error={fe.instagram}>
          <Input
            name="instagram"
            defaultValue={item?.instagram ?? ""}
            placeholder="@usuario"
            required
          />
        </Field>
        <Field label="Telefone (WhatsApp)" error={fe.telefone}>
          <Input
            name="telefone"
            defaultValue={item?.telefone ?? ""}
            placeholder="(67) 99999-9999"
            required
          />
        </Field>
        <Field label="Tipo" error={fe.tipo}>
          <Select name="tipo" defaultValue={item?.tipo ?? "Assessor"}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Assessor">Assessor</SelectItem>
              <SelectItem value="Coordenador">Coordenador</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Valor do contrato (R$)" error={fe.valor_contrato}>
          <Input
            name="valor_contrato"
            type="number"
            step="0.01"
            min="0"
            defaultValue={item?.valor_contrato ?? ""}
            required
          />
        </Field>
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
