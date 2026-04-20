-- RPC que retorna a lista distinta de municípios na tabela votacao.
-- Evita trazer ~2500 linhas ao cliente só para deduplicar em JS.
CREATE OR REPLACE FUNCTION list_municipios()
RETURNS TABLE (municipio TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT votacao.municipio
  FROM votacao
  ORDER BY votacao.municipio;
$$;

GRANT EXECUTE ON FUNCTION list_municipios() TO authenticated;
