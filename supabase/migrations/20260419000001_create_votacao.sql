-- Tabela de votação (dados agregados do CSV do TSE)
-- Import agrega SUM(QT_VOTOS) GROUP BY candidato + município + turno + cargo
CREATE TABLE votacao (
  id BIGSERIAL PRIMARY KEY,
  cargo TEXT NOT NULL,
  nome_candidato TEXT NOT NULL,
  partido TEXT,
  numero_candidato TEXT,
  municipio TEXT NOT NULL,
  uf TEXT NOT NULL DEFAULT 'MS',
  turno INTEGER NOT NULL,
  votos INTEGER NOT NULL,
  situacao TEXT,
  distancia_ponta_pora NUMERIC,
  foto_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT votacao_unique_candidato UNIQUE (nome_candidato, municipio, turno, cargo)
);

CREATE INDEX idx_votacao_municipio ON votacao (municipio);
CREATE INDEX idx_votacao_cargo ON votacao (cargo);
CREATE INDEX idx_votacao_turno ON votacao (turno);
CREATE INDEX idx_votacao_votos ON votacao (votos DESC);
CREATE INDEX idx_votacao_distancia ON votacao (distancia_ponta_pora);
CREATE INDEX idx_votacao_municipio_cargo_turno ON votacao (municipio, cargo, turno);
