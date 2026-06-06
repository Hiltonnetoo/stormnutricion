import type { Micronutrients } from "./diet";

/**
 * Classificação NOVA (Guia Alimentar para a População Brasileira):
 * 1 = in natura / minimamente processado
 * 2 = ingrediente culinário processado
 * 3 = alimento processado
 * 4 = ultraprocessado
 *
 * Alimentos NOVA 4 são excluídos da geração automática de dietas.
 */
export type NovaGroup = 1 | 2 | 3 | 4;

/**
 * Representa um alimento do banco de dados nutricional.
 */
export interface Food {
  id: string;
  name: string;
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
  /** Grupo NOVA. Se ausente, é inferido por categoria/nome em foodService. */
  novaGroup?: NovaGroup;
  micros?: Micronutrients;
}
