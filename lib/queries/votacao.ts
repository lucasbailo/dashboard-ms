import { createClient } from "@/lib/supabase/server";
import type { Votacao } from "@/lib/types";

export type VotacaoFiltros = {
  municipio?: string;
  turno?: number;
  distanciaMax?: number;
  cargo?: "Prefeito" | "Vereador";
  votosMax?: number;
};

const MAX_ROWS = 10000;

export async function listMunicipios(): Promise<string[]> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("list_municipios");
  if (!error && data) {
    return (data as Array<{ municipio: string }>).map((r) => r.municipio);
  }

  const fallback = await supabase
    .from("votacao")
    .select("municipio")
    .order("municipio")
    .limit(MAX_ROWS);

  if (fallback.error) throw fallback.error;
  return Array.from(
    new Set((fallback.data ?? []).map((r) => r.municipio))
  );
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

  const { data, error } = await query
    .order("votos", { ascending: false })
    .limit(MAX_ROWS);
  if (error) throw error;
  return (data ?? []) as Votacao[];
}
