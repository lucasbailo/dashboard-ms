-- CRUD 1: Assessores e Coordenadores
CREATE TABLE equipe (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'Mato Grosso do Sul',
  endereco TEXT NOT NULL,
  instagram TEXT NOT NULL,
  telefone TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('Assessor', 'Coordenador')),
  valor_contrato NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_equipe_cidade ON equipe (cidade);
CREATE INDEX idx_equipe_tipo ON equipe (tipo);

CREATE TRIGGER trg_equipe_updated_at
BEFORE UPDATE ON equipe
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
