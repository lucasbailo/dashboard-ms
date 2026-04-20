# Prompt: Dashboard Eleitoral - Ponta Porã/MS

## 🎯 Objetivo
Desenvolver uma aplicação web completa de dashboard eleitoral para análise de votação de prefeitos e vereadores na região de Ponta Porã/MS, com sistema de cadastro de assessores/coordenadores e controle de gastos de campanha.

---

## 🛠️ Stack Técnica

### Frontend
- **Framework:** Next.js 14 (App Router) + TypeScript
- **Estilização:** Tailwind CSS + shadcn/ui
- **Gráficos:** Recharts (gráficos de barras) + Leaflet ou Mapbox (mapa)
- **Forms:** React Hook Form + Zod (validação)
- **Tabelas:** TanStack Table (v8)
- **Exportação:** `jspdf` + `jspdf-autotable` (PDF) e `xlsx` (Excel)

### Backend / Banco de Dados
- **Supabase** (PostgreSQL gerenciado)
  - Auth: Supabase Auth (email/senha)
  - Database: PostgreSQL
  - Storage: para armazenar fotos dos vereadores (se necessário)
  - Row Level Security (RLS) habilitado

### Deploy sugerido
- **Vercel** (frontend)
- **Supabase Cloud** (backend)

---

## 📊 Estrutura do Banco de Dados (Supabase)

### Tabela 1: `votacao` (dados importados do CSV - 59 mil linhas)
```sql
CREATE TABLE votacao (
  id BIGSERIAL PRIMARY KEY,
  cargo TEXT NOT NULL, -- 'Prefeito' ou 'Vereador'
  nome_candidato TEXT NOT NULL,
  partido TEXT,
  numero_candidato TEXT,
  municipio TEXT NOT NULL,
  uf TEXT DEFAULT 'MS',
  turno INTEGER, -- 1 ou 2
  votos INTEGER NOT NULL,
  situacao TEXT, -- 'Eleito', 'Não eleito', 'Suplente', etc.
  distancia_ponta_pora NUMERIC, -- em km
  foto_url TEXT, -- link para foto do candidato
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance com 59k linhas
CREATE INDEX idx_votacao_municipio ON votacao(municipio);
CREATE INDEX idx_votacao_cargo ON votacao(cargo);
CREATE INDEX idx_votacao_turno ON votacao(turno);
CREATE INDEX idx_votacao_votos ON votacao(votos);
CREATE INDEX idx_votacao_distancia ON votacao(distancia_ponta_pora);
```

### Tabela 2: `equipe` (CRUD 1 - Assessores/Coordenadores)
```sql
CREATE TABLE equipe (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  cidade TEXT NOT NULL,
  estado TEXT DEFAULT 'Mato Grosso do Sul',
  endereco TEXT NOT NULL,
  instagram TEXT NOT NULL,
  telefone TEXT NOT NULL, -- formato: (XX) XXXXX-XXXX
  tipo TEXT NOT NULL CHECK (tipo IN ('Assessor', 'Coordenador')),
  valor_contrato NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabela 3: `gastos_campanha` (CRUD 2 - Gastos por cidade)
```sql
CREATE TABLE gastos_campanha (
  id BIGSERIAL PRIMARY KEY,
  cidade TEXT NOT NULL,
  aluguel_carro NUMERIC(10,2) NOT NULL DEFAULT 0,
  gastos_gasolina NUMERIC(10,2) NOT NULL DEFAULT 0,
  litros_gasolina NUMERIC(10,2) NOT NULL DEFAULT 0,
  valor_diaria_hotel NUMERIC(10,2) NOT NULL DEFAULT 0,
  quantidade_diarias INTEGER NOT NULL DEFAULT 0,
  pedagio NUMERIC(10,2) NOT NULL DEFAULT 0,
  gastos_alimentacao NUMERIC(10,2) NOT NULL DEFAULT 0,
  gastos_material_grafico NUMERIC(10,2) NOT NULL DEFAULT 0,
  numero_contratados INTEGER NOT NULL DEFAULT 0,
  valor_unitario_contrato NUMERIC(10,2) NOT NULL DEFAULT 0,
  valor_total_contratados NUMERIC(10,2) GENERATED ALWAYS AS 
    (numero_contratados * valor_unitario_contrato) STORED,
  valor_total_hospedagem NUMERIC(10,2) GENERATED ALWAYS AS 
    (valor_diaria_hotel * quantidade_diarias) STORED,
  valor_total_geral NUMERIC(10,2) GENERATED ALWAYS AS (
    aluguel_carro + gastos_gasolina + (valor_diaria_hotel * quantidade_diarias) 
    + pedagio + gastos_alimentacao + gastos_material_grafico 
    + (numero_contratados * valor_unitario_contrato)
  ) STORED,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔐 Autenticação

- **Supabase Auth** com login por e-mail e senha
- Middleware no Next.js protegendo todas as rotas (exceto `/login`)
- Página de login simples com logo/branding
- Logout no header do dashboard

---

## 📱 Estrutura de Páginas

### 1. `/login` - Tela de autenticação

### 2. `/dashboard` - **Painel Geral** (página principal)
**Filtros no topo (aplicam-se a toda a página):**
- 🏙️ Cidade (dropdown com busca)
- 🕐 Turno (1º ou 2º)
- 📍 Distância de Ponta Porã (slider em km)

**Seção Prefeitos (parte superior):**
- **Esquerda:** Gráfico de barras com nomes dos candidatos a prefeito e quantidade de votos (ordenado do maior para o menor)
- **Direita:** Mapa interativo (Leaflet) destacando a cidade selecionada, com marcador e nome

**Seção Vereadores (parte inferior):**
- Gráfico de barras com nomes dos vereadores e quantidade de votos da cidade filtrada

### 3. `/vereadores` - **Aba Vereadores**
**Filtros no topo:**
- 🏙️ Cidade
- 📍 Distância de Ponta Porã
- 🗳️ Faixa de votos: **input numérico "até X votos"** (ex: digitar 200 mostra só quem teve ≤ 200 votos)

**Layout: Split view**
- **Lado esquerdo (lista):** Tabela com colunas: `Nome do Candidato | Votos | Situação | Município`
- **Lado direito (card de detalhes):** Ao clicar em uma linha, exibe card com:
  - Foto do vereador
  - Nome
  - Situação (Eleito / Não eleito) — badge colorido
  - Partido
  - Município
  - Votos recebidos

### 4. `/equipe` - **CRUD 1: Assessores e Coordenadores**
- Listagem em tabela (com busca e paginação)
- Botão "Adicionar novo" → abre modal/formulário
- **Campos do formulário:**
  - Nome completo *
  - E-mail *
  - Cidade *
  - Estado * (default: Mato Grosso do Sul, com opção "Outro")
  - Endereço * (Rua/Avenida/Travessa, número e Bairro - complemento)
  - Instagram *
  - Telefone com DDD (WhatsApp) *
  - Tipo * (Assessor / Coordenador)
  - Valor do contrato * (apenas número, formatação em R$)
- Ações por linha: Editar ✏️ e Excluir 🗑️ (com confirmação)
- **Exportar:** botões PDF e Excel

### 5. `/gastos` - **CRUD 2: Gastos de Campanha por Cidade**
- Listagem em tabela com os valores + totais calculados automaticamente
- Botão "Adicionar novo" → abre modal/formulário
- **Campos do formulário:**
  - Cidade *
  - Aluguel de carro (R$) *
  - Gastos com Gasolina (R$) *
  - Litros de Gasolina *
  - Valor da diária Hotel/Hospedagem (R$) *
  - Diárias (quantos dias) *
  - Pedágio (R$) *
  - Gastos com Alimentação (R$) *
  - Gastos com Material Gráfico (R$) *
  - Número de contratados *
  - Valor unitário por contrato (R$) *
  - **Valor total contratados** (calculado automaticamente: nº × valor unitário)
  - **Valor total geral** (calculado automaticamente: soma de tudo)
- Ações por linha: Editar ✏️ e Excluir 🗑️
- **Card resumo:** total gasto geral + total por cidade
- **Exportar:** botões PDF e Excel

### 6. `/relatorios` - **Painéis de Resultados dos CRUDs**
Duas tabelas/painéis consolidados:
- **Painel A:** Tabela completa da equipe (com filtro por tipo e cidade)
- **Painel B:** Tabela completa de gastos (com totalizadores e filtro por cidade)
- Ambos com exportação PDF/Excel

---

## 📥 Importação do CSV (59 mil linhas)

Como o arquivo é grande, **NÃO** fazer upload direto pelo navegador. Opções recomendadas:

1. **Via Supabase Dashboard** (mais simples):
   - Table Editor → Import data from CSV
   - Suporta até ~100MB nativamente

2. **Via script Node.js** (se precisar de transformações):
   - Criar script em `/scripts/import-csv.ts`
   - Usar `papaparse` + `@supabase/supabase-js`
   - Inserir em lotes de 1000 linhas (batch insert)
   - Calcular distância de Ponta Porã antes de inserir (pode usar API de geocoding ou tabela estática de distâncias)

3. **Normalizações sugeridas antes do import:**
   - Padronizar nomes de municípios (uppercase/title case)
   - Converter votos para INTEGER
   - Remover linhas duplicadas
   - Validar campo `situacao` e `cargo`

---

## ⚡ Considerações de Performance

- **Paginação server-side** nas listagens (Supabase com `.range()`)
- **Índices** nas colunas mais filtradas (município, cargo, turno, votos)
- **Cache** de queries frequentes com React Query (TanStack Query)
- **Views materializadas** no Supabase para agregações pesadas (ex: total de votos por cidade)
- **Debounce** nos filtros de busca (300ms)

---

## 📱 Responsividade

- Layout mobile-first com Tailwind
- Em telas pequenas:
  - Gráficos empilhados verticalmente
  - Mapa em altura reduzida (300px)
  - Tabelas com scroll horizontal
  - Menu lateral vira drawer (hamburger)

---

## 📤 Exportação de Dados

Em todas as tabelas principais, botões de exportação:
- **PDF:** via `jspdf` + `jspdf-autotable` com logo/cabeçalho personalizado
- **Excel (.xlsx):** via biblioteca `xlsx` com formatação de moeda

---

## ✅ Entregáveis

1. Repositório Git com código-fonte completo
2. Scripts SQL de criação das tabelas (migrations)
3. Script de importação do CSV
4. README.md com instruções de setup local e deploy
5. Variáveis de ambiente documentadas (`.env.example`)
6. Projeto deployado (URL de produção)

---

## 🎨 Design

- Interface limpa e profissional (estilo shadcn/ui)
- Paleta: tons de azul/verde (política) ou neutro corporativo
- Tipografia: Inter ou Geist
- Ícones: Lucide React
- Feedback visual em todas as ações (toasts com sonner)
