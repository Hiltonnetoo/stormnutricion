// --- V1 Diet Plan Types (Legacy from old AI generator) ---
export interface V1_Meal {
  name: string;
  description: string;
  calories: number;
}

export interface V1_DietPlan {
  id?: string;
  patientId: string;
  patientName: string;
  createdAt: string;
  daily_calories: number;
  macronutrients: {
    protein_grams: number;
    carbs_grams: number;
    fat_grams: number;
  };
  meals: {
    breakfast: V1_Meal;
    lunch: V1_Meal;
    dinner: V1_Meal;
    snacks: V1_Meal[];
  };
  recommendations: string[];
}

// --- V2 Diet Plan Types (New 3-Step Generator) ---
export interface Micronutrients {
  vitaminA?: number; // mcg or IU
  vitaminC?: number; // mg
  vitaminD?: number; // mcg
  calcium?: number; // mg
  iron?: number; // mg
  magnesium?: number; // mg
  zinc?: number; // mg
  potassium?: number; // mg
  sodium?: number; // mg
  fiber?: number; // g
}

export interface MealOptionItem {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  micros?: Micronutrients;
  clinicalWarnings?: string[];
}

export interface MealOption {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  items?: MealOptionItem[];
  details?: string;
  micros?: Micronutrients;
  clinicalWarnings?: string[];
}

/**
 * Representa uma refeição dentro de um plano alimentar V2.
 * Cada refeição possui uma opção principal e até duas alternativas de substituição,
 * todas com porções ajustadas para atingir as metas calóricas daquela refeição.
 */
export interface Meal {
  mealName: string; // "Café da Manhã"
  time: string; // "08:00"
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  micros?: Micronutrients;
  mainOption: MealOption;
  alternatives: MealOption[];
}

/**
 * Modo de geração do plano alimentar. Controla filtros de segurança aplicados
 * pelo `dietAlgorithmService` durante a seleção de alimentos.
 *
 * - `general`     — Sem filtros adicionais além do tipo de dieta.
 * - `clinical`    — Restringe alimentos com sódio ≥ 600 mg por porção.
 * - `performance` — Otimizado para atletas (alta proteína e carboidratos de qualidade).
 * - `pediatric`   — Remove bebidas estimulantes e alcoólicas.
 * - `recovery`    — Foco em alimentos anti-inflamatórios e de fácil digestão.
 */
export type DietMode =
  | "general"
  | "clinical"
  | "performance"
  | "pediatric"
  | "recovery";

/**
 * Tags de condições clínicas do paciente. Utilizadas pelo `dietAlgorithmService`
 * para aplicar filtros nutricionais específicos por patologia:
 *
 * | Tag                  | Filtro aplicado pelo gerador                         |
 * |----------------------|------------------------------------------------------|
 * | `diabetes_t1/t2`     | Remove açúcares refinados e industrializados         |
 * | `hypertension`       | Sódio < 300 mg por porção                            |
 * | `renal_ckd`          | Sódio ultra-baixo < 200 mg (proteção renal)          |
 * | `hepatic_steatosis`  | Remove óleos saturados (exceto azeite)               |
 * | Demais               | Visíveis no prontuário, sem filtro automático ainda  |
 */
export type ClinicalTag =
  | "diabetes_t1"
  | "diabetes_t2"
  | "hypertension"
  | "renal_ckd"
  | "hepatic_steatosis"
  | "ibs"
  | "obesity"
  | "dyslipidemia"
  | "anemia"
  | "hyperthyroidism"
  | "hypothyroidism";

export interface LabTest {
  name: string;
  value: string;
  unit: string;
  referenceRange?: string;
  status?: "normal" | "alert" | "critical";
  date?: string;
  category?: string;
}

export interface DecisionEntry {
  type: "filter" | "substitution" | "warning";
  reason: string;
  affectedCount?: number;
  /** Nomes dos alimentos removidos por este filtro (exibidos no log clínico). */
  removedFoods?: string[];
  tag?: string;
}

/**
 * Plano alimentar completo gerado pelo sistema (versão 2).
 *
 * A versão 2 substitui o formato V1 (gerado por IA/Gemini) e é produzida pelo
 * `dietAlgorithmService`. O campo `version: 2` é usado como discriminante
 * para distinguir planos antigos de novos ao exibir o histórico.
 *
 * Os campos `labExams` e `decisionLog` são opcionais e podem ser anexados
 * após a geração (exames do paciente e auditoria algorítmica, respectivamente).
 */
export interface DietPlan {
  version: 2; // To distinguish from V1 plans
  id?: string;
  patientId: string;
  patientName: string;
  mode: DietMode;
  clinicalTags?: ClinicalTag[];
  createdAt: string;
  durationDays: number;
  startDate: string;
  dailyCalories: number;
  macronutrients: {
    proteinGrams: number;
    proteinPercentage: number;
    carbsGrams: number;
    carbsPercentage: number;
    fatGrams: number;
    fatPercentage: number;
  };
  meals: Meal[];
  waterRecommendationLiters: number;
  generalObservations: string[];
  dietType: string;
  labExams?: LabTest[];
  decisionLog?: DecisionEntry[];
}

// Combined type for use in listings and history
export type AnyDietPlan =
  | (V1_DietPlan & { version?: 1 | undefined })
  | DietPlan;
