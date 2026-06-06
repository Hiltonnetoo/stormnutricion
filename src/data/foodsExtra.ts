import type { Food } from "../types";

/**
 * Lote curado de alimentos comuns brasileiros (valores alinhados à TACO,
 * por 100 g salvo indicação), todos classificados por grupo NOVA e com índice
 * glicêmico nos carboidratos relevantes. Serve para ampliar a variedade do
 * banco já agora; o pipeline `scripts/build-foods.mjs` substitui/expande este
 * conjunto para ~1000 itens a partir das tabelas oficiais (TACO + IBGE).
 *
 * Nomes que coincidirem com o seed principal são removidos na mesclagem
 * (dedupe por nome em data/foods.ts).
 */
export const extraFoods: Food[] = [
  // ── Cereais e Derivados ──────────────────────────────────────────────────
  { id: "x1", name: "Aveia em flocos", category: "Cereais e Derivados", portion: "100", unit: "g", calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, fiber: 9.1, sodium: 5, glycemicIndex: 55, novaGroup: 1, micros: { iron: 4.3, magnesium: 177 } },
  { id: "x2", name: "Quinoa cozida", category: "Cereais e Derivados", portion: "100", unit: "g", calories: 120, protein: 4.4, carbs: 21.3, fat: 1.9, fiber: 2.8, sodium: 7, glycemicIndex: 53, novaGroup: 1, micros: { iron: 1.5, magnesium: 64 } },
  { id: "x3", name: "Arroz integral cozido", category: "Cereais e Derivados", portion: "100", unit: "g", calories: 124, protein: 2.6, carbs: 25.8, fat: 1.0, fiber: 2.7, sodium: 1, glycemicIndex: 68, novaGroup: 1, micros: { magnesium: 59 } },
  { id: "x4", name: "Pão integral", category: "Cereais e Derivados", portion: "50", unit: "g", calories: 253, protein: 9.4, carbs: 49.9, fat: 3.5, fiber: 6.9, sodium: 480, glycemicIndex: 71, novaGroup: 3 },
  { id: "x5", name: "Tapioca (goma hidratada)", category: "Cereais e Derivados", portion: "100", unit: "g", calories: 240, protein: 0.3, carbs: 59, fat: 0.1, fiber: 0.5, sodium: 1, glycemicIndex: 85, novaGroup: 1 },

  // ── Verduras e Legumes (inclui tubérculos) ───────────────────────────────
  { id: "x6", name: "Batata-doce cozida", category: "Verduras e Legumes", portion: "100", unit: "g", calories: 77, protein: 0.6, carbs: 18.4, fat: 0.1, fiber: 2.2, sodium: 3, glycemicIndex: 63, novaGroup: 1, micros: { potassium: 230 } },
  { id: "x7", name: "Mandioca cozida", category: "Verduras e Legumes", portion: "100", unit: "g", calories: 125, protein: 0.6, carbs: 30.1, fat: 0.3, fiber: 1.6, sodium: 1, glycemicIndex: 70, novaGroup: 1 },
  { id: "x8", name: "Brócolis cozido", category: "Verduras e Legumes", portion: "100", unit: "g", calories: 25, protein: 2.1, carbs: 4.4, fat: 0.5, fiber: 3.4, sodium: 8, novaGroup: 1, micros: { calcium: 51, vitaminC: 42 } },
  { id: "x9", name: "Cenoura crua", category: "Verduras e Legumes", portion: "100", unit: "g", calories: 34, protein: 1.3, carbs: 7.7, fat: 0.2, fiber: 3.2, sodium: 65, glycemicIndex: 35, novaGroup: 1, micros: { potassium: 315 } },
  { id: "x10", name: "Abóbora cozida", category: "Verduras e Legumes", portion: "100", unit: "g", calories: 48, protein: 1.4, carbs: 12, fat: 0.1, fiber: 2.5, sodium: 2, novaGroup: 1 },
  { id: "x11", name: "Tomate cru", category: "Verduras e Legumes", portion: "100", unit: "g", calories: 15, protein: 1.1, carbs: 3.1, fat: 0.2, fiber: 1.2, sodium: 1, novaGroup: 1, micros: { vitaminC: 21 } },
  { id: "x12", name: "Couve refogada", category: "Verduras e Legumes", portion: "100", unit: "g", calories: 90, protein: 3.0, carbs: 8.7, fat: 5.0, fiber: 5.7, sodium: 14, novaGroup: 1, micros: { calcium: 131 } },

  // ── Frutas ───────────────────────────────────────────────────────────────
  { id: "x13", name: "Banana prata", category: "Frutas", portion: "100", unit: "g", calories: 98, protein: 1.3, carbs: 26, fat: 0.1, fiber: 2.0, sodium: 1, glycemicIndex: 55, novaGroup: 1, micros: { potassium: 358 } },
  { id: "x14", name: "Maçã com casca", category: "Frutas", portion: "100", unit: "g", calories: 56, protein: 0.3, carbs: 15.2, fat: 0.4, fiber: 1.3, sodium: 0, glycemicIndex: 36, novaGroup: 1 },
  { id: "x15", name: "Mamão formosa", category: "Frutas", portion: "100", unit: "g", calories: 45, protein: 0.8, carbs: 11.6, fat: 0.1, fiber: 1.8, sodium: 2, glycemicIndex: 59, novaGroup: 1, micros: { vitaminC: 82 } },
  { id: "x16", name: "Laranja pera", category: "Frutas", portion: "100", unit: "g", calories: 37, protein: 1.0, carbs: 8.9, fat: 0.1, fiber: 0.8, sodium: 0, glycemicIndex: 43, novaGroup: 1, micros: { vitaminC: 53 } },
  { id: "x17", name: "Morango", category: "Frutas", portion: "100", unit: "g", calories: 30, protein: 0.9, carbs: 6.8, fat: 0.3, fiber: 1.7, sodium: 0, glycemicIndex: 40, novaGroup: 1, micros: { vitaminC: 63 } },
  { id: "x18", name: "Abacate", category: "Frutas", portion: "100", unit: "g", calories: 96, protein: 1.2, carbs: 6.0, fat: 8.4, fiber: 6.3, sodium: 0, novaGroup: 1, micros: { potassium: 206 } },

  // ── Carnes e Derivados / Pescados ────────────────────────────────────────
  { id: "x19", name: "Peito de frango grelhado", category: "Carnes e Derivados", portion: "100", unit: "g", calories: 159, protein: 32, carbs: 0, fat: 2.5, fiber: 0, sodium: 60, novaGroup: 1 },
  { id: "x20", name: "Patinho bovino cozido", category: "Carnes e Derivados", portion: "100", unit: "g", calories: 219, protein: 35.9, carbs: 0, fat: 7.3, fiber: 0, sodium: 52, novaGroup: 1, micros: { iron: 3.0 } },
  { id: "x21", name: "Tilápia grelhada", category: "Carnes e Derivados", portion: "100", unit: "g", calories: 96, protein: 20.1, carbs: 0, fat: 1.7, fiber: 0, sodium: 52, novaGroup: 1 },
  { id: "x22", name: "Sardinha assada", category: "Carnes e Derivados", portion: "100", unit: "g", calories: 164, protein: 21, carbs: 0, fat: 8.4, fiber: 0, sodium: 113, novaGroup: 1, micros: { calcium: 90 } },
  { id: "x23", name: "Ovo de galinha cozido", category: "Carnes e Derivados", portion: "50", unit: "g", calories: 146, protein: 13.3, carbs: 0.6, fat: 9.5, fiber: 0, sodium: 140, novaGroup: 1 },

  // ── Leguminosas ──────────────────────────────────────────────────────────
  { id: "x24", name: "Lentilha cozida", category: "Leguminosas", portion: "100", unit: "g", calories: 93, protein: 6.3, carbs: 16.3, fat: 0.5, fiber: 7.9, sodium: 2, glycemicIndex: 29, novaGroup: 1, micros: { iron: 1.5 } },
  { id: "x25", name: "Grão-de-bico cozido", category: "Leguminosas", portion: "100", unit: "g", calories: 164, protein: 8.9, carbs: 27.4, fat: 2.6, fiber: 7.6, sodium: 7, glycemicIndex: 28, novaGroup: 1, micros: { iron: 2.9 } },
  { id: "x26", name: "Ervilha cozida", category: "Leguminosas", portion: "100", unit: "g", calories: 88, protein: 5.4, carbs: 14.3, fat: 0.4, fiber: 5.5, sodium: 2, glycemicIndex: 22, novaGroup: 1 },

  // ── Oleaginosas / Gorduras boas ──────────────────────────────────────────
  { id: "x27", name: "Castanha-do-pará", category: "Oleaginosas", portion: "100", unit: "g", calories: 643, protein: 14.5, carbs: 15.1, fat: 63.5, fiber: 7.9, sodium: 1, novaGroup: 1, micros: { magnesium: 376 } },
  { id: "x28", name: "Amêndoa", category: "Oleaginosas", portion: "100", unit: "g", calories: 581, protein: 18.6, carbs: 29.5, fat: 47.3, fiber: 11.6, sodium: 1, novaGroup: 1, micros: { calcium: 237, magnesium: 270 } },
  { id: "x29", name: "Azeite de oliva extravirgem", category: "Óleos e Gorduras", portion: "100", unit: "g", calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, sodium: 0, novaGroup: 2 },

  // ── Leite e Derivados ────────────────────────────────────────────────────
  { id: "x30", name: "Iogurte natural integral", category: "Leite e Derivados", portion: "100", unit: "g", calories: 51, protein: 4.1, carbs: 1.9, fat: 3.0, fiber: 0, sodium: 52, novaGroup: 3, micros: { calcium: 143 } },
  { id: "x31", name: "Queijo minas frescal", category: "Leite e Derivados", portion: "100", unit: "g", calories: 264, protein: 17.4, carbs: 3.2, fat: 20.2, fiber: 0, sodium: 30, novaGroup: 3, micros: { calcium: 579 } },
  { id: "x32", name: "Leite desnatado", category: "Leite e Derivados", portion: "200", unit: "ml", calories: 35, protein: 3.4, carbs: 5.0, fat: 0.2, fiber: 0, sodium: 52, novaGroup: 1, micros: { calcium: 123 } },
];
