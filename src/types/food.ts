import type { Micronutrients } from "./diet";

/**
 * NOVA Classification (Dietary Guidelines for the Brazilian Population):
 * 1 = minimally processed / in natura
 * 2 = processed culinary ingredient
 * 3 = processed food
 * 4 = ultra-processed
 *
 * NOVA 4 foods are excluded from automatic diet generation.
 */
export type NovaGroup = 1 | 2 | 3 | 4;

/**
 * Represents a food in the nutritional database.
 */
export interface Food {
  id: string;
  name: string;
  nameEn?: string;
  category: string;
  portion: string;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
  glycemicIndex?: number;
  /** NOVA group. If absent, it is inferred by category/name in foodService. */
  novaGroup?: NovaGroup;
  micros?: Micronutrients;
}
