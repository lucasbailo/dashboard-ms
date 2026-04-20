-- CRUD 2: Gastos de campanha por cidade (totais calculados via GENERATED columns)
CREATE TABLE gastos_campanha (
  id BIGSERIAL PRIMARY KEY,
  cidade TEXT NOT NULL,
  aluguel_carro NUMERIC(10, 2) NOT NULL DEFAULT 0,
  gastos_gasolina NUMERIC(10, 2) NOT NULL DEFAULT 0,
  litros_gasolina NUMERIC(10, 2) NOT NULL DEFAULT 0,
  valor_diaria_hotel NUMERIC(10, 2) NOT NULL DEFAULT 0,
  quantidade_diarias INTEGER NOT NULL DEFAULT 0,
  pedagio NUMERIC(10, 2) NOT NULL DEFAULT 0,
  gastos_alimentacao NUMERIC(10, 2) NOT NULL DEFAULT 0,
  gastos_material_grafico NUMERIC(10, 2) NOT NULL DEFAULT 0,
  numero_contratados INTEGER NOT NULL DEFAULT 0,
  valor_unitario_contrato NUMERIC(10, 2) NOT NULL DEFAULT 0,
  valor_total_contratados NUMERIC(12, 2) GENERATED ALWAYS AS (
    numero_contratados * valor_unitario_contrato
  ) STORED,
  valor_total_hospedagem NUMERIC(12, 2) GENERATED ALWAYS AS (
    valor_diaria_hotel * quantidade_diarias
  ) STORED,
  valor_total_geral NUMERIC(12, 2) GENERATED ALWAYS AS (
    aluguel_carro
    + gastos_gasolina
    + (valor_diaria_hotel * quantidade_diarias)
    + pedagio
    + gastos_alimentacao
    + gastos_material_grafico
    + (numero_contratados * valor_unitario_contrato)
  ) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gastos_cidade ON gastos_campanha (cidade);

CREATE TRIGGER trg_gastos_updated_at
BEFORE UPDATE ON gastos_campanha
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
