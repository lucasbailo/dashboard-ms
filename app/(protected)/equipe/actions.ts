"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const equipeSchema = z.object({
  nome: z.string().min(1, "Obrigatório"),
  email: z.string().email("E-mail inválido"),
  cidade: z.string().min(1, "Obrigatório"),
  estado: z.string().min(1, "Obrigatório"),
  endereco: z.string().min(1, "Obrigatório"),
  instagram: z.string().min(1, "Obrigatório"),
  telefone: z.string().min(8, "Telefone inválido"),
  tipo: z.enum(["Assessor", "Coordenador"]),
  valor_contrato: z.coerce.number().min(0, "Valor inválido"),
});

export type EquipeFormState = {
  error: string | null;
  fieldErrors?: Partial<Record<keyof z.infer<typeof equipeSchema>, string>>;
};

function parseForm(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  return equipeSchema.safeParse(raw);
}

export async function saveEquipeAction(
  _prev: EquipeFormState,
  formData: FormData
): Promise<EquipeFormState> {
  const parsed = parseForm(formData);
  if (!parsed.success) {
    const fieldErrors: EquipeFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof z.infer<typeof equipeSchema>;
      fieldErrors[key] = issue.message;
    }
    return { error: "Revise os campos destacados.", fieldErrors };
  }

  const supabase = createClient();
  const id = formData.get("id");

  if (id) {
    const { error } = await supabase
      .from("equipe")
      .update(parsed.data)
      .eq("id", Number(id));
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("equipe").insert(parsed.data);
    if (error) return { error: error.message };
  }

  revalidatePath("/equipe");
  revalidatePath("/relatorios");
  return { error: null };
}

export async function deleteEquipeAction(id: number): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.from("equipe").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/equipe");
  revalidatePath("/relatorios");
  return { error: null };
}
