import { createClient } from "@/lib/supabase/server";
import type { Votacao } from "@/lib/types";

export type VotacaoFiltros = {
  municipio?: string;
  turno?: number;
  distanciaMax?: number;
  cargo?: "Prefeito" | "Vereador";
  votosMax?: number;
};

export async function listMunicipios(): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("votacao")
    .select("municipio")
    .order("municipio");

  if (error) throw error;
  const unicos = Array.from(new Set((data ?? []).map((r) => r.municipio)));
  return unicos;
}

export async function listVotacao(
  filtros: VotacaoFiltros = {}
): Promise<Votacao[]> {
  const supabase = createClient();
  let query = supabase.from("votacao").select("*");

  if (filtros.municipio) query = query.eq("municipio", filtros.municipio);
  if (filtros.turno) query = query.eq("turno", filtros.turno);
  if (filtros.cargo) query = query.eq("cargo", filtros.cargo);
  if (filtros.distanciaMax != null) {
    query = query.lte("distancia_ponta_pora", filtros.distanciaMax);
  }
  if (filtros.votosMax != null) {
    query = query.lte("votos", filtros.votosMax);
  }

  const { data, error } = await query.order("votos", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Votacao[];
}
