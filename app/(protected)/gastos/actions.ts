"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const numericNonNeg = z.coerce.number().min(0, "Inválido");
const intNonNeg = z.coerce.number().int().min(0, "Inválido");

const gastosSchema = z.object({
  cidade: z.string().min(1, "Obrigatório"),
  aluguel_carro: numericNonNeg,
  gastos_gasolina: numericNonNeg,
  litros_gasolina: numericNonNeg,
  valor_diaria_hotel: numericNonNeg,
  quantidade_diarias: intNonNeg,
  pedagio: numericNonNeg,
  gastos_alimentacao: numericNonNeg,
  gastos_material_grafico: numericNonNeg,
  numero_contratados: intNonNeg,
  valor_unitario_contrato: numericNonNeg,
});

export type GastosFormState = {
  error: string | null;
  fieldErrors?: Partial<Record<keyof z.infer<typeof gastosSchema>, string>>;
};

export async function saveGastoAction(
  _prev: GastosFormState,
  formData: FormData
): Promise<GastosFormState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = gastosSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: GastosFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof z.infer<typeof gastosSchema>;
      fieldErrors[key] = issue.message;
    }
    return { error: "Revise os campos destacados.", fieldErrors };
  }

  const supabase = createClient();
  const id = formData.get("id");

  if (id) {
    const { error } = await supabase
      .from("gastos_campanha")
      .update(parsed.data)
      .eq("id", Number(id));
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("gastos_campanha").insert(parsed.data);
    if (error) return { error: error.message };
  }

  revalidatePath("/gastos");
  revalidatePath("/relatorios");
  return { error: null };
}

export async function deleteGastoAction(id: number): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.from("gastos_campanha").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/gastos");
  revalidatePath("/relatorios");
  return { error: null };
}
