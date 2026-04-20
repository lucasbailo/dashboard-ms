# Supabase — Migrations

Migrations SQL do projeto dashboard-ms, na ordem de execução:

| # | Arquivo | Descrição |
|---|---|---|
| 1 | `20260419000001_create_votacao.sql` | Tabela `votacao` + índices + UNIQUE(nome_candidato, municipio, turno, cargo) |
| 2 | `20260419000002_updated_at_trigger.sql` | Função `set_updated_at()` compartilhada |
| 3 | `20260419000003_create_equipe.sql` | Tabela `equipe` + trigger updated_at |
| 4 | `20260419000004_create_gastos_campanha.sql` | Tabela `gastos_campanha` com 3 colunas GENERATED |
| 5 | `20260419000005_enable_rls.sql` | RLS + policies (authenticated → CRUD em equipe/gastos, SELECT em votacao) |

## Como aplicar

### Opção 1 — Supabase Dashboard (SQL Editor)

Abrir cada arquivo na ordem e colar/executar no SQL Editor do projeto.

### Opção 2 — Supabase CLI (recomendado para controle de versão)

```bash
# link ao projeto (uma vez)
supabase link --project-ref <seu-ref>

# aplicar migrations
supabase db push
```

## Observações

- **`votacao.UNIQUE(nome_candidato, municipio, turno, cargo)`** permite re-import idempotente com `ON CONFLICT`.
- **Writes em `votacao`** devem usar `service_role` (ex: script de import). Policies só liberam SELECT para `authenticated`.
- **Colunas GENERATED** em `gastos_campanha` são calculadas pelo Postgres — não enviar esses campos em INSERT/UPDATE.
