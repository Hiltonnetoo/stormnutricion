import type { DietMode, ClinicalTag, LabTest } from "../../types";

/** Distribuição percentual de macronutrientes. */
export interface MacroSplit {
  protein: number;
  carbs: number;
  fat: number;
}

/** Uma refeição configurada no plano (nome, horário e % calórico do dia). */
export interface MealSlot {
  name: string;
  time: string;
  percentage: number;
}

/**
 * Estado do formulário do Gerador de Dietas. É preenchido de forma incremental
 * (por isso os campos são opcionais) e alguns campos vêm de inputs como texto,
 * por isso aceitam `string | number`. As conversões numéricas são feitas na
 * leitura (Number(...)).
 */
export interface DietFormData {
  goal?: string;
  currentWeight?: string | number;
  targetWeight?: string | number;
  deadlineWeeks?: string | number;
  activityLevel?: string;
  dietType?: string;
  dailyCalories?: string | number;
  macros?: MacroSplit;
  durationDays?: string | number;
  startDate?: string;
  numberOfMeals?: number;
  meals?: MealSlot[];
  finalObservations?: string;
  specialObservations?: string;
  mode?: DietMode;
  clinicalTags?: ClinicalTag[];
  lastLabExams?: LabTest[];
  mealsPerDay?: number;
}

/** Resultado dos cálculos metabólicos derivados do paciente + formulário. */
export interface DietCalculations {
  bmr: number;
  tdee: number;
  targetCalories: number;
  water: number;
  macrosInGrams: { proteinGrams: number; carbsGrams: number; fatGrams: number };
  validationWarnings: string[];
}
