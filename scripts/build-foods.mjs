#!/usr/bin/env node
/**
 * build-foods.mjs — Pipeline de importação do banco de alimentos (~1000 itens)
 * ============================================================================
 *
 * Converte as tabelas OFICIAIS brasileiras (TACO/UNICAMP e IBGE/POF) para o
 * formato `Food` do sistema, classificando por grupo NOVA e descartando
 * ultraprocessados de baixa relevância clínica. O resultado é gravado em
 * `src/data/foods.ts`, substituindo o seed atual.
 *
 *  POR QUE UM SCRIPT (e não digitar à mão):
 *  ----------------------------------------
 *  São ~600 (TACO) + ~1.900 (IBGE) registros com dezenas de nutrientes cada.
 *  Digitar à mão é inviável e perigoso para um app clínico (risco de inventar
 *  valores). O script lê os dados reais e produz um arquivo confiável.
 *
 *  COMO USAR:
 *  ----------
 *  1. Baixe os CSVs oficiais (uma vez):
 *       - TACO 4ª ed. (NEPA/UNICAMP)  → taco.csv
 *       - IBGE/POF (Tabela de Composição Nutricional dos Alimentos
 *         Consumidos no Brasil)        → ibge.csv
 *     Salve-os em `scripts/data/`.
 *
 *  2. Rode:
 *       node scripts/build-foods.mjs scripts/data/taco.csv scripts/data/ibge.csv
 *
 *  3. Ajuste o mapeamento de colunas (COLUMN_MAP) e de categorias
 *     (CATEGORY_MAP) abaixo conforme os cabeçalhos reais dos seus CSVs —
 *     esses nomes variam entre as versões publicadas.
 *
 *  REGRAS DE CURADORIA (decididas com o cliente):
 *  ---------------------------------------------
 *   • NOVA 4 (ultraprocessados) entram no banco apenas marcados, para consulta,
 *     mas NUNCA na geração automática de dietas (o gerador filtra NOVA 4).
 *   • Mira em "até ~1000 itens curados" — prioriza NOVA 1–3 e variedade por
 *     categoria; o excedente de NOVA 4 é limitado.
 *   • Índice Glicêmico fica PARCIAL (só nos carboidratos onde houver dado
 *     confiável). A Carga Glicêmica é calculada no app (IG × carbo disponível).
 */

import fs from "node:fs";
import path from "node:path";

const TARGET_TOTAL = 1000;
const OUTPUT = path.resolve(process.cwd(), "src/data/foods.ts");

/* As 12 categorias canônicas do sistema (o gerador depende destes nomes). */
const CANONICAL_CATEGORIES = [
  "Cereais e Derivados", "Verduras e Legumes", "Frutas", "Carnes e Derivados",
  "Leite e Derivados", "Leguminosas", "Oleaginosas", "Óleos e Gorduras",
  "Açúcares e Doces", "Industrializados", "Bebidas", "Preparações",
];

/* Mapeie aqui os nomes de categoria da fonte → categoria canônica.
   Ajuste conforme os rótulos reais da TACO/IBGE que você baixou. */
const CATEGORY_MAP = {
  "cereais e derivados": "Cereais e Derivados",
  "verduras, hortaliças e derivados": "Verduras e Legumes",
  "frutas e derivados": "Frutas",
  "carnes e derivados": "Carnes e Derivados",
  "pescados e frutos do mar": "Carnes e Derivados",
  "ovos e derivados": "Carnes e Derivados",
  "leite e derivados": "Leite e Derivados",
  "leguminosas e derivados": "Leguminosas",
  "nozes e sementes": "Oleaginosas",
  "óleos e gorduras": "Óleos e Gorduras",
  "açúcares e produtos de confeitaria": "Açúcares e Doces",
  "produtos açucarados": "Açúcares e Doces",
  "miscelâneas": "Industrializados",
  "alimentos preparados": "Preparações",
  "bebidas (alcoólicas e não alcoólicas)": "Bebidas",
  "bebidas": "Bebidas",
};

/* Cabeçalhos esperados no CSV → campos do nosso Food (em minúsculas, sem acento
   no lookup). Ajuste conforme as colunas reais do seu arquivo. */
const COLUMN_MAP = {
  name: ["alimento", "descricao", "description", "nome"],
  category: ["categoria", "grupo", "category", "group"],
  calories: ["energia", "energia (kcal)", "kcal", "energy_kcal", "calories"],
  protein: ["proteina", "proteína", "protein", "protein_g"],
  carbs: ["carboidrato", "carboidrato total", "carbs", "carbohydrate"],
  fat: ["lipideos", "lipídios", "gordura", "fat", "lipid"],
  fiber: ["fibra", "fibra alimentar", "fiber"],
  sodium: ["sodio", "sódio", "sodium"],
};

/* ----------------------------------------------------------- Heurística NOVA
   (mantida em sincronia com src/services/foodService.ts:getNovaGroup) */
const ULTRA = [
  "refrigerante", "salgadinho", "biscoito recheado", "nugget", "empanado",
  "salsicha", "mortadela", "presunto", "linguiça", "bacon", "miojo",
  "macarrão instantâneo", "margarina", "achocolatado", "gelatina", "sorvete",
  "barra de cereal", "cereal matinal", "energético", "suco em pó", "ketchup",
  "maionese", "molho pronto", "tempero pronto", "embutido", "hambúrguer",
  "leite condensado", "chocolate", "bombom", "bala", "chiclete",
];
function inferNova(name, category) {
  const n = name.toLowerCase();
  if (ULTRA.some((u) => n.includes(u))) return 4;
  switch (category) {
    case "Industrializados": return 4;
    case "Açúcares e Doces": return /açúcar|mel|rapadura/.test(n) ? 2 : 4;
    case "Bebidas":
      if (/água|café|chá|suco natural|suco de/.test(n)) return 1;
      if (/refrigerante|energético|isotônico/.test(n)) return 4;
      return 3;
    case "Óleos e Gorduras": return n.includes("manteiga") ? 3 : 2;
    case "Leite e Derivados": return n.includes("leite") && !n.includes("condensado") ? 1 : 3;
    case "Cereais e Derivados": return /pão|biscoito|bolacha|torrada/.test(n) ? 3 : 1;
    case "Preparações": return 3;
    default: return 1; // Carnes frescas, Frutas, Verduras, Leguminosas, Oleaginosas
  }
}

/* ------------------------------------------------------------- CSV parsing */
function parseCSV(text) {
  const rows = [];
  let field = "", row = [], inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === "," || c === ";") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c !== "\r") field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((x) => x.trim() !== ""));
}

const norm = (s) => s.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const toNum = (s) => {
  const v = parseFloat(String(s).replace(",", ".").replace(/[^\d.-]/g, ""));
  return Number.isFinite(v) ? v : 0;
};

function buildColumnIndex(header) {
  const idx = {};
  const hn = header.map(norm);
  for (const [field, names] of Object.entries(COLUMN_MAP)) {
    idx[field] = hn.findIndex((h) => names.some((n) => h === norm(n) || h.includes(norm(n))));
  }
  return idx;
}

function rowsToFoods(rows, startId) {
  const [header, ...data] = rows;
  const idx = buildColumnIndex(header);
  const foods = [];
  let id = startId;
  for (const r of data) {
    const rawName = (r[idx.name] || "").trim();
    if (!rawName) continue;
    const rawCat = (r[idx.category] || "").trim();
    const category = CATEGORY_MAP[norm(rawCat)] || "Preparações";
    const calories = toNum(r[idx.calories]);
    const protein = toNum(r[idx.protein]);
    const carbs = toNum(r[idx.carbs]);
    const fat = toNum(r[idx.fat]);
    if (calories <= 0 && protein <= 0 && carbs <= 0 && fat <= 0) continue; // linha vazia/inválida
    foods.push({
      id: `f${id++}`,
      name: rawName,
      category,
      portion: "100",
      unit: "g",
      calories: +calories.toFixed(1),
      protein: +protein.toFixed(1),
      carbs: +carbs.toFixed(1),
      fat: +fat.toFixed(1),
      fiber: +toNum(r[idx.fiber]).toFixed(1),
      sodium: Math.round(toNum(r[idx.sodium])),
      novaGroup: inferNova(rawName, category),
    });
  }
  return foods;
}

/* --------------------------------------------------------------- Pipeline */
function main() {
  const inputs = process.argv.slice(2);
  if (inputs.length === 0) {
    console.error("Uso: node scripts/build-foods.mjs <taco.csv> [ibge.csv ...]");
    process.exit(1);
  }

  let all = [];
  let nextId = 1;
  for (const file of inputs) {
    const text = fs.readFileSync(path.resolve(file), "utf8");
    const foods = rowsToFoods(parseCSV(text), nextId);
    nextId += foods.length + 1;
    all.push(...foods);
    console.log(`• ${file}: ${foods.length} itens`);
  }

  // Dedupe por nome (mantém o primeiro — TACO antes de IBGE).
  const seen = new Set();
  all = all.filter((f) => {
    const k = norm(f.name);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  // Prioriza NOVA 1–3; limita NOVA 4 a no máximo 8% do total.
  const clean = all.filter((f) => f.novaGroup !== 4);
  const ultra = all.filter((f) => f.novaGroup === 4).slice(0, Math.round(TARGET_TOTAL * 0.08));
  let curated = [...clean, ...ultra].slice(0, TARGET_TOTAL);

  const novaCounts = curated.reduce((a, f) => ((a[f.novaGroup] = (a[f.novaGroup] || 0) + 1), a), {});
  console.log(`\nTotal curado: ${curated.length}`);
  console.log("Distribuição NOVA:", novaCounts);
  console.log("Categorias:", [...new Set(curated.map((f) => f.category))].length, "de", CANONICAL_CATEGORIES.length);

  const body = curated
    .map((f) => "  " + JSON.stringify(f).replace(/"([a-zA-Z]+)":/g, "$1: "))
    .join(",\n");
  const out = `import type { Food } from "../types";\n\n// Gerado por scripts/build-foods.mjs a partir de TACO + IBGE. Não editar à mão.\nexport const brazilianFoods: Food[] = [\n${body},\n];\n`;
  fs.writeFileSync(OUTPUT, out, "utf8");
  console.log(`\n✓ Gravado em ${OUTPUT}`);
}

main();
