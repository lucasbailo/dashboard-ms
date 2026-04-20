import { createClient } from "@/lib/supabase/server";
import type { Equipe } from "@/lib/types";

export async function listEquipe(): Promise<Equipe[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("equipe")
    .select("*")
    .order("nome");
  if (error) throw error;
  return (data ?? []) as Equipe[];
}
