-- Row Level Security: usuários autenticados têm acesso completo às 3 tabelas.
-- (Projeto é ferramenta interna de equipe; sem multi-tenancy por usuário.)

ALTER TABLE votacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipe ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos_campanha ENABLE ROW LEVEL SECURITY;

-- votacao: somente leitura para autenticados (writes apenas via service_role / import script)
CREATE POLICY votacao_select_auth ON votacao
  FOR SELECT TO authenticated
  USING (true);

-- equipe: CRUD completo para autenticados
CREATE POLICY equipe_all_auth ON equipe
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- gastos_campanha: CRUD completo para autenticados
CREATE POLICY gastos_all_auth ON gastos_campanha
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);
