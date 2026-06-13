import type { DietMode, ClinicalTag, LabTest } from "../../types";

/** Macronutrient percentage distribution. */
export interface MacroSplit {
  protein: number;
  carbs: number;
  fat: number;
}

/** A configured meal slot in the plan (name, time, and daily calorie %). */
export interface MealSlot {
  name: string;
  time: string;
  percentage: number;
}

/**
 * Diet Generator form state. It is filled in incrementally
 * (which is why fields are optional) and some fields come from text inputs,
 * so they accept `string | number`. Numeric conversions are done when
 * reading (Number(...)).
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

/** Result of metabolic calculations derived from patient + form. */
export interface DietCalculations {
  bmr: number;
  tdee: number;
  targetCalories: number;
  water: number;
  macrosInGrams: { proteinGrams: number; carbsGrams: number; fatGrams: number };
  validationWarnings: string[];
}
