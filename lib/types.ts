export type Votacao = {
  id: number;
  cargo: string;
  nome_candidato: string;
  partido: string | null;
  numero_candidato: string | null;
  municipio: string;
  uf: string;
  turno: number;
  votos: number;
  situacao: string | null;
  distancia_ponta_pora: number | null;
  foto_url: string | null;
  created_at: string;
};

export type TipoEquipe = "Assessor" | "Coordenador";

export type Equipe = {
  id: number;
  nome: string;
  email: string;
  cidade: string;
  estado: string;
  endereco: string;
  instagram: string;
  telefone: string;
  tipo: TipoEquipe;
  valor_contrato: number;
  created_at: string;
  updated_at: string;
};

export type EquipeInput = Omit<Equipe, "id" | "created_at" | "updated_at">;

export type GastoCampanha = {
  id: number;
  cidade: string;
  aluguel_carro: number;
  gastos_gasolina: number;
  litros_gasolina: number;
  valor_diaria_hotel: number;
  quantidade_diarias: number;
  pedagio: number;
  gastos_alimentacao: number;
  gastos_material_grafico: number;
  numero_contratados: number;
  valor_unitario_contrato: number;
  valor_total_contratados: number;
  valor_total_hospedagem: number;
  valor_total_geral: number;
  created_at: string;
  updated_at: string;
};

export type GastoCampanhaInput = Omit<
  GastoCampanha,
  | "id"
  | "created_at"
  | "updated_at"
  | "valor_total_contratados"
  | "valor_total_hospedagem"
  | "valor_total_geral"
>;
