/**
 * Import do CSV TSE (votacao_secao_2024_MS.csv, ~220MB, ~59k linhas).
 *
 * - Lê arquivo com encoding Latin1 (padrão dos dados do TSE).
 * - Agrega SUM(QT_VOTOS) GROUP BY (nome_candidato, municipio, turno, cargo).
 * - Faz UPSERT em lotes usando o UNIQUE constraint da tabela.
 *
 * Uso:  npm run import-csv
 * Requer SUPABASE_SERVICE_ROLE_KEY em .env.local (bypass de RLS).
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";
import Papa from "papaparse";
import { createClient } from "@supabase/supabase-js";

loadEnv({ path: resolve(process.cwd(), ".env.local") });

const CSV_PATH = resolve(process.cwd(), "votacao_secao_2024_MS.csv");
const BATCH_SIZE = 1000;

type CsvRow = Record<string, string>;

type VotacaoRow = {
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
};

function cleanStr(v: string | undefined): string | null {
  if (!v) return null;
  const t = v.trim();
  if (!t || t === "N/A" || t === "#NULO#") return null;
  return t;
}

function parseDistancia(raw: string | undefined): number | null {
  const cleaned = cleanStr(raw);
  if (!cleaned) return null;
  const num = Number.parseFloat(cleaned.replace(",", "."));
  return Number.isFinite(num) ? num : null;
}

function findHeader(headers: string[], needle: string): string | undefined {
  const target = needle.toLowerCase();
  return headers.find((h) => h.toLowerCase().includes(target));
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Variáveis NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY precisam estar em .env.local"
    );
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  console.log(`📂 Lendo CSV: ${CSV_PATH}`);
  const content = readFileSync(CSV_PATH, { encoding: "latin1" });
  console.log(`   ${(content.length / 1024 / 1024).toFixed(1)} MB carregados`);

  console.log("🔎 Parseando CSV (delimitador ; )...");
  const parsed = Papa.parse<CsvRow>(content, {
    header: true,
    delimiter: ";",
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    console.warn(`⚠️  ${parsed.errors.length} avisos de parsing (mostrando 3):`);
    parsed.errors.slice(0, 3).forEach((e) => console.warn("   -", e.message));
  }
  console.log(`   ${parsed.data.length} linhas lidas`);

  const headers = parsed.meta.fields ?? [];
  const hDistancia =
    findHeader(headers, "distância até ponta porã") ??
    findHeader(headers, "distancia");

  if (!hDistancia) {
    console.warn("⚠️  Coluna de distância não encontrada — ficará null");
  }

  console.log("🧮 Agregando por candidato + município + turno + cargo...");
  const map = new Map<string, VotacaoRow>();

  let skippedInvalid = 0;
  for (const row of parsed.data) {
    const nome = (row.NM_VOTAVEL ?? "").trim();
    const municipio = (row.NM_MUNICIPIO ?? "").trim();
    const cargo = (row.DS_CARGO ?? "").trim();
    const turno = Number.parseInt(row.NR_TURNO ?? "", 10);
    const votos = Number.parseInt(row.QT_VOTOS ?? "", 10);

    if (!nome || !municipio || !cargo || !Number.isFinite(turno)) {
      skippedInvalid++;
      continue;
    }

    const key = `${nome}|${municipio}|${turno}|${cargo}`;
    const existing = map.get(key);

    if (existing) {
      existing.votos += Number.isFinite(votos) ? votos : 0;
    } else {
      map.set(key, {
        cargo,
        nome_candidato: nome,
        partido: cleanStr(row.Partido),
        numero_candidato: cleanStr(row.NR_VOTAVEL),
        municipio,
        uf: cleanStr(row.SG_UF) ?? "MS",
        turno,
        votos: Number.isFinite(votos) ? votos : 0,
        situacao: cleanStr(row.DS_SIT_TOT_TURNO),
        distancia_ponta_pora: hDistancia ? parseDistancia(row[hDistancia]) : null,
        foto_url: cleanStr(row.LINK_FOTO),
      });
    }
  }

  const rows = Array.from(map.values());
  console.log(`   ${rows.length} candidatos únicos (${skippedInvalid} linhas puladas)`);

  console.log(`📤 UPSERT em lotes de ${BATCH_SIZE}...`);
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from("votacao")
      .upsert(batch, { onConflict: "nome_candidato,municipio,turno,cargo" });

    if (error) {
      console.error(`❌ Erro no lote ${i}-${i + batch.length}:`, error);
      throw error;
    }
    console.log(`   ${Math.min(i + BATCH_SIZE, rows.length)}/${rows.length}`);
  }

  console.log("✅ Import concluído com sucesso");
}

main().catch((err) => {
  console.error("❌ Falha no import:", err);
  process.exit(1);
});
