import { brazilianFoods } from "../data/foods";
import type { Food, NovaGroup } from "../types";

/* ============================================================================
   Classificação NOVA (processamento) + Carga Glicêmica
   ========================================================================== */

export const NOVA_LABELS: Record<NovaGroup, { short: string; full: string; tone: string }> = {
  1: { short: "In natura", full: "In natura / minimamente processado", tone: "bg-emerald-50 text-emerald-700" },
  2: { short: "Ingrediente culinário", full: "Ingrediente culinário processado", tone: "bg-sky-50 text-sky-700" },
  3: { short: "Processado", full: "Alimento processado", tone: "bg-amber-50 text-amber-700" },
  4: { short: "Ultraprocessado", full: "Ultraprocessado", tone: "bg-rose-50 text-rose-700" },
};

const ULTRAPROCESSED_HINTS = [
  "refrigerante", "salgadinho", "biscoito recheado", "bolacha recheada", "nugget",
  "empanado", "salsicha", "mortadela", "presunto", "linguiça", "bacon", "miojo",
  "macarrão instantâneo", "margarina", "achocolatado", "gelatina", "sorvete",
  "barra de cereal", "cereal matinal", "energético", "suco em pó", "ketchup",
  "catchup", "maionese", "molho pronto", "tempero pronto", "embutido",
  "hambúrguer", "leite condensado", "chocolate", "bombom", "bala", "chiclete",
];

/**
 * Infere o grupo NOVA de um alimento a partir do campo explícito `novaGroup`
 * ou, na ausência dele, por heurística de categoria + nome. Usado tanto na
 * tela de Alimentos quanto pelo gerador (que exclui NOVA 4).
 */
export const getNovaGroup = (food: Food): NovaGroup => {
  if (food.novaGroup) return food.novaGroup;
  const n = food.name.toLowerCase();
  if (ULTRAPROCESSED_HINTS.some((u) => n.includes(u))) return 4;

  switch (food.category) {
    case "Industrializados":
      return 4;
    case "Açúcares e Doces":
      return n.includes("açúcar") || n.includes("mel") || n.includes("rapadura") ? 2 : 4;
    case "Bebidas":
      if (n.includes("água") || n.includes("café") || n.includes("chá") || n.includes("suco natural") || n.includes("suco de"))
        return 1;
      if (n.includes("refrigerante") || n.includes("energético") || n.includes("isotônico"))
        return 4;
      return 3;
    case "Óleos e Gorduras":
      if (n.includes("manteiga")) return 3;
      return 2; // óleo, azeite, banha
    case "Leite e Derivados":
      if (n.includes("leite") && !n.includes("condensado")) return 1;
      return 3; // queijo, iogurte, requeijão
    case "Cereais e Derivados":
      if (n.includes("pão") || n.includes("biscoito") || n.includes("bolacha") || n.includes("torrada"))
        return 3;
      return 1; // arroz, aveia, fubá, milho
    case "Preparações":
      return 3;
    case "Carnes e Derivados":
    case "Frutas":
    case "Verduras e Legumes":
    case "Leguminosas":
    case "Oleaginosas":
    default:
      return 1;
  }
};

/** Carboidrato disponível (total − fibra), base da carga glicêmica. */
export const getAvailableCarbs = (food: Food): number =>
  Math.max(0, food.carbs - (food.fiber || 0));

/** Carga Glicêmica da porção listada = IG × carbo disponível ÷ 100. */
export const glycemicLoad = (food: Food): number | undefined => {
  if (food.glycemicIndex == null) return undefined;
  return Math.round((food.glycemicIndex * getAvailableCarbs(food)) / 100);
};

export type GlycemicLevel = "low" | "medium" | "high";

export const giLevel = (gi?: number): GlycemicLevel | null => {
  if (gi == null) return null;
  if (gi <= 55) return "low";
  if (gi <= 69) return "medium";
  return "high";
};

export const glLevel = (gl?: number): GlycemicLevel | null => {
  if (gl == null) return null;
  if (gl <= 10) return "low";
  if (gl <= 19) return "medium";
  return "high";
};

export const GLYCEMIC_TONE: Record<GlycemicLevel, string> = {
  low: "bg-emerald-50 text-emerald-700",
  medium: "bg-amber-50 text-amber-700",
  high: "bg-rose-50 text-rose-700",
};

export const GLYCEMIC_LABEL: Record<GlycemicLevel, string> = {
  low: "baixa",
  medium: "média",
  high: "alta",
};

export const foodCategories = [
  "Cereais e Derivados",
  "Verduras e Legumes",
  "Frutas",
  "Carnes e Derivados",
  "Leite e Derivados",
  "Leguminosas",
  "Oleaginosas",
  "Óleos e Gorduras",
  "Açúcares e Doces",
  "Industrializados",
  "Bebidas",
  "Preparações",
];

/**
 * Retrieves all foods belonging to a specific category.
 * @param category The category to filter by.
 * @returns An array of Food objects.
 */
export const getFoodsByCategory = (category: string): Food[] => {
  return brazilianFoods.filter((food) => food.category === category);
};

/**
 * Searches for foods by name.
 * @param query The search term.
 * @returns An array of Food objects that match the query.
 */
export const searchFoods = (query: string): Food[] => {
  if (!query) return [];
  const lowercasedQuery = query.toLowerCase();
  return brazilianFoods.filter((food) =>
    food.name.toLowerCase().includes(lowercasedQuery),
  );
};

/**
 * Retrieves a single food by its unique ID.
 * @param id The ID of the food to retrieve.
 * @returns A Food object or undefined if not found.
 */
export const getFoodById = (id: string): Food | undefined => {
  return brazilianFoods.find((food) => food.id === id);
};

export interface NutrientTotals {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  totalSodium: number;
}

/**
 * Calculates the total nutritional values for a list of foods and their quantities.
 * @param items An array of objects, each containing a Food object and the quantity in portions.
 * @returns An object with the summed nutritional values.
 */
export const calculateNutrition = (
  items: { food: Food; quantity: number }[],
): NutrientTotals => {
  const totals: NutrientTotals = {
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    totalFiber: 0,
    totalSodium: 0,
  };

  items.forEach((item) => {
    totals.totalCalories += item.food.calories * item.quantity;
    totals.totalProtein += item.food.protein * item.quantity;
    totals.totalCarbs += item.food.carbs * item.quantity;
    totals.totalFat += item.food.fat * item.quantity;
    totals.totalFiber += item.food.fiber * item.quantity;
    totals.totalSodium += item.food.sodium * item.quantity;
  });

  // Rounding to 2 decimal places for cleaner display
  for (const key in totals) {
    totals[key as keyof NutrientTotals] = parseFloat(
      totals[key as keyof NutrientTotals].toFixed(2),
    );
  }

  return totals;
};
