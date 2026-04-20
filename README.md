# Dashboard Eleitoral — Ponta Porã/MS

Aplicação web para análise da votação de prefeitos e vereadores na região de Ponta Porã (MS), com CRUDs de equipe de campanha (assessores/coordenadores) e controle de gastos por cidade.

Os dados de votação vêm do CSV oficial do TSE (eleições 2024), agregados por candidato/município/turno para queries rápidas.

---

## ✨ Funcionalidades

- **Login restrito** via Supabase Auth (sem autocadastro — admin cria usuários)
- **Painel geral** (`/dashboard`) com:
  - Filtros por cidade, turno e distância de Ponta Porã
  - Gráfico de barras com os candidatos a prefeito (eleitos destacados)
  - Mapa interativo (Leaflet + OpenStreetMap) com geocoding automático
  - Card com a distância da cidade selecionada
  - Gráfico de vereadores da cidade filtrada
- **Vereadores** (`/vereadores`) — split view com tabela à esquerda e card de detalhes (foto, partido, situação, votos) à direita
- **Equipe** (`/equipe`) — CRUD de assessores/coordenadores com export PDF/Excel
- **Gastos** (`/gastos`) — CRUD de gastos por cidade; totais de hospedagem, contratados e geral recalculados em tempo real no formulário e também armazenados como colunas `GENERATED` no Postgres
- **Relatórios** (`/relatorios`) — abas consolidadas de equipe e gastos
- **Responsivo** (Tailwind mobile-first)

---

## 🛠️ Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| UI | Tailwind CSS + shadcn/ui (Radix UI) |
| Gráficos | Recharts |
| Mapa | Leaflet + react-leaflet + Nominatim (geocoding) |
| Forms | React Hook Form + Zod |
| Banco | Supabase (PostgreSQL) com Row Level Security |
| Auth | Supabase Auth (e-mail + senha) |
| Export | `jspdf` + `jspdf-autotable` (PDF), `xlsx` (Excel) |
| Feedback | Sonner (toasts) |
| Deploy | Vercel (frontend) + Supabase Cloud (backend) |

---

## 📋 Pré-requisitos

- **Node.js 20+** ([download](https://nodejs.org))
- **npm** (vem com o Node)
- Conta no **Supabase** ([supabase.com](https://supabase.com)) — plano gratuito é suficiente
- Arquivo **`votacao_secao_2024_MS.csv`** do TSE na raiz do projeto (para o import)

---

## 🚀 Setup local

### 1. Instalar dependências

```bash
npm install
```

### 2. Criar projeto no Supabase

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Região recomendada: **São Paulo**
3. Anote a **Database password** em local seguro
4. Aguarde ~2 min até o projeto ficar disponível

### 3. Configurar variáveis de ambiente

Copie o template e preencha com as credenciais do Supabase:

```bash
cp .env.example .env.local
```

Preencha `.env.local` com os valores de **Supabase Dashboard → Settings → API**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` é **secreto** (bypassa RLS). Nunca commit e nunca exponha no frontend. Só é usado pelo script de import.

### 4. Aplicar as migrations

No **Supabase Dashboard → SQL Editor → New query**, cole e execute cada arquivo na ordem:

1. [`supabase/migrations/20260419000001_create_votacao.sql`](supabase/migrations/20260419000001_create_votacao.sql)
2. [`supabase/migrations/20260419000002_updated_at_trigger.sql`](supabase/migrations/20260419000002_updated_at_trigger.sql)
3. [`supabase/migrations/20260419000003_create_equipe.sql`](supabase/migrations/20260419000003_create_equipe.sql)
4. [`supabase/migrations/20260419000004_create_gastos_campanha.sql`](supabase/migrations/20260419000004_create_gastos_campanha.sql)
5. [`supabase/migrations/20260419000005_enable_rls.sql`](supabase/migrations/20260419000005_enable_rls.sql)

Ao criar `votacao`, o Supabase exibe aviso sobre RLS — clique em **"Run and enable RLS"** (a migration 5 adiciona as policies).

### 5. Importar o CSV

Coloque o `votacao_secao_2024_MS.csv` na raiz do projeto e rode:

```bash
npm run import-csv
```

O script:
- Lê o CSV com encoding **Latin1** (padrão do TSE)
- Agrega `SUM(QT_VOTOS)` agrupando por candidato + município + turno + cargo
- Reduz ~59k linhas (por seção) em ~2,5k candidatos únicos
- Faz **upsert em lotes de 1000** (idempotente — pode rodar várias vezes)

Leva 30s–2min dependendo da máquina.

### 6. Criar o primeiro usuário

**Supabase Dashboard → Authentication → Users → Add user → Create new user**
- E-mail + senha
- ✅ Marque **Auto Confirm User** (senão o Supabase exige confirmação por e-mail)

### 7. Rodar

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) e entre com as credenciais criadas no passo 6.

---

## ☁️ Deploy na Vercel

1. Faça push do repositório pro GitHub
2. [vercel.com/new](https://vercel.com/new) → importe o repositório
3. **Antes de deployar**, adicione em **Settings → Environment Variables** as 3 vars:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - Marque os 3 environments (Production, Preview, Development)
4. **Deploy**

> ⚠️ Se adicionar env vars depois do primeiro deploy, é obrigatório **redeployar** (elas não pegam retroativamente). Faça **Deployments → ... → Redeploy** (sem cache).

---

## 📁 Estrutura do projeto

```
dashboard-ms/
├── app/
│   ├── (protected)/          # Route group com layout autenticado
│   │   ├── dashboard/        # Painel geral (filtros + gráficos + mapa)
│   │   ├── vereadores/       # Split view
│   │   ├── equipe/           # CRUD
│   │   ├── gastos/           # CRUD
│   │   ├── relatorios/       # Abas consolidadas
│   │   └── layout.tsx        # Header com nav + guard de auth
│   ├── auth/signout/         # Route handler de logout
│   ├── login/                # Tela de login + Server Action
│   ├── icon.png              # Favicon (brasão MS)
│   ├── layout.tsx            # Root layout + Toaster
│   ├── globals.css           # Tokens shadcn/ui
│   └── page.tsx              # Redirect para /dashboard
├── components/
│   ├── ui/                   # Primitivas shadcn/ui (Button, Card, Table, Dialog, Select, Slider, Badge, Tabs...)
│   ├── charts/               # Recharts
│   ├── map/                  # Leaflet (com dynamic import pra desabilitar SSR)
│   ├── filters/              # Filtros (client) que atualizam URL search params
│   ├── equipe/, gastos/, vereadores/   # Componentes específicos por domínio
│   └── signout-button.tsx
├── lib/
│   ├── supabase/             # Clients: browser, server, middleware
│   ├── queries/              # Helpers de leitura do banco
│   ├── types.ts              # Tipos do domínio
│   └── utils.ts              # cn, formatCurrency, formatNumber
├── scripts/
│   └── import-csv.ts         # Import do CSV do TSE
├── supabase/
│   ├── migrations/           # SQL numerado (aplicar na ordem)
│   └── README.md
├── middleware.ts             # Supabase session refresh + redirecionamento
└── .env.example
```

---

## 🗄️ Modelo de dados

### `votacao` (dados agregados do TSE)

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | BIGSERIAL | PK |
| `cargo` | TEXT | "Prefeito" ou "Vereador" |
| `nome_candidato` | TEXT | |
| `partido` | TEXT | |
| `numero_candidato` | TEXT | |
| `municipio` | TEXT | |
| `uf` | TEXT | Default "MS" |
| `turno` | INTEGER | 1 ou 2 |
| `votos` | INTEGER | **SUM** agregado do CSV |
| `situacao` | TEXT | "Eleito", "Não eleito", etc. |
| `distancia_ponta_pora` | NUMERIC | Em km (vem do CSV) |
| `foto_url` | TEXT | Link TSE |

**UNIQUE** em `(nome_candidato, municipio, turno, cargo)` → permite re-import idempotente com upsert.

### `equipe`

Campos: `nome`, `email`, `cidade`, `estado` (default MS), `endereco`, `instagram`, `telefone`, `tipo` (Assessor/Coordenador), `valor_contrato`, `created_at`, `updated_at`.

### `gastos_campanha`

Campos principais: `cidade`, `aluguel_carro`, `gastos_gasolina`, `litros_gasolina`, `valor_diaria_hotel`, `quantidade_diarias`, `pedagio`, `gastos_alimentacao`, `gastos_material_grafico`, `numero_contratados`, `valor_unitario_contrato`.

Colunas **GENERATED ALWAYS AS ... STORED** (calculadas pelo Postgres):
- `valor_total_hospedagem` = diária × quantidade
- `valor_total_contratados` = nº × valor unitário
- `valor_total_geral` = soma de todos os gastos

### RLS

- `votacao` → `SELECT` para `authenticated`. Writes apenas via `service_role` (script de import).
- `equipe`, `gastos_campanha` → CRUD completo para `authenticated`.

---

## 🧪 Scripts npm

| Comando | Descrição |
|---|---|
| `npm run dev` | Dev server em http://localhost:3000 |
| `npm run build` | Build de produção |
| `npm run start` | Roda o build (após `build`) |
| `npm run lint` | ESLint |
| `npm run import-csv` | Import do CSV do TSE (usa `.env.local`) |

---

## 🔐 Gerenciamento de usuários

A tela de login não tem opção de cadastro (projeto é ferramenta interna). Para adicionar alguém:

1. **Supabase Dashboard → Authentication → Users**
2. **Add user → Create new user**
3. Definir e-mail, senha e marcar **Auto Confirm User**

Pra remover acesso: mesma tela, botão de exclusão ao lado do usuário.

---

## 📤 Exportações

Em `/equipe`, `/gastos` e `/relatorios`, clique em **PDF** ou **Excel**:
- **PDF:** `jspdf` + `jspdf-autotable` com cabeçalho e totalizadores
- **Excel:** `xlsx` com uma planilha por tabela, colunas nomeadas

Os arquivos são gerados **no cliente** (navegador) — nada é enviado ao servidor.

---

## 🗺️ Sobre o mapa

O Leaflet usa tiles gratuitos do OpenStreetMap. Para traduzir o nome do município em coordenadas, chama a API **Nominatim** (também gratuita, com rate limit de 1 req/s).

Cada coordenada resolvida é **cacheada em `localStorage`** do navegador, então após a primeira visita não há chamadas repetidas.

Se precisar maior escala, a próxima evolução seria criar uma tabela `municipios(codigo_ibge, nome, lat, lon)` pré-populada e consultar direto do banco.

---

## 🐛 Troubleshooting

### "Application error" na Vercel

Provavelmente env vars faltando. Verifique **Settings → Environment Variables** e faça redeploy (Deployments → ... → Redeploy, **sem cache**).

O erro real fica em **Vercel → Logs** filtrando pelo `Digest` que aparece no browser.

### Login "E-mail ou senha inválidos"

- Confirme que o usuário foi criado com **Auto Confirm User** marcado
- Ou marque manualmente em Supabase → Authentication → Users → clicar no user → Confirm

### Import do CSV travando

- Confirme que `.env.local` tem `SUPABASE_SERVICE_ROLE_KEY` (não o anon)
- Confirme que o CSV está na raiz com nome exato `votacao_secao_2024_MS.csv`
- O arquivo tem ~220MB; se o Node reclamar de memória, rode `NODE_OPTIONS=--max-old-space-size=4096 npm run import-csv`

### Mapa não carrega em mobile

Pode ser bloqueio do Nominatim (rate limit). Recarregue — as cidades já visitadas são servidas pelo cache.

---

## 📄 Licença

Projeto privado.
