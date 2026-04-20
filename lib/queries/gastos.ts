import { createClient } from "@/lib/supabase/server";
import type { GastoCampanha } from "@/lib/types";

export async function listGastos(): Promise<GastoCampanha[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("gastos_campanha")
    .select("*")
    .order("cidade");
  if (error) throw error;
  return (data ?? []) as GastoCampanha[];
}
