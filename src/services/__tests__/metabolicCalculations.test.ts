import { describe, it, expect, beforeAll } from "vitest";
import i18next from "i18next";
import {
  calculateBMR,
  calculateTDEE,
  calculateBMI,
  getBMICategory,
  calculateTargetCalories,
  calculateMacrosInGrams,
  getMacroDistributionForDiet,
  getMacroDistributionForMode,
  estimateTimeToGoal,
  validateNutrition,
} from "../metabolicCalculations";

describe("metabolicCalculations", () => {
  beforeAll(async () => {
    await i18next.init({
      lng: "pt",
      resources: {
        pt: {
          translation: {
            metabolic: {
              bmi_underweight: "Abaixo do peso",
              bmi_normal: "Peso normal",
              bmi_overweight: "Sobrepeso",
              bmi_obesity_1: "Obesidade Grau I",
              bmi_obesity_2: "Obesidade Grau II",
              bmi_obesity_3: "Obesidade Grau III",
              time_to_goal_maintenance: "Manutenção de peso.",
              time_to_goal_inconsistent:
                "Meta calórica inconsistente com o objetivo de peso.",
              time_to_goal_weeks: "~{{weeks}} semanas",
              validate_calories_low:
                "Alerta: Calorias diárias abaixo do mínimo seguro (800 kcal).",
              validate_calories_high:
                "Alerta: Calorias diárias muito elevadas (> 5000 kcal).",
              validate_protein_low:
                "Alerta: Proteína abaixo do mínimo recomendado (0.8g/kg). Atual: {{current}}g/kg",
              validate_protein_high:
                "Alerta: Proteína acima do limite seguro (2.5g/kg). Atual: {{current}}g/kg",
            },
          },
        },
      },
    });
  });
  describe("calculateBMR", () => {
    it("should calculate BMR correctly for male", () => {
      // BMR = 10 * weight + 6.25 * height - 5 * age + 5
      // BMR = 10 * 80 + 6.25 * 180 - 5 * 30 + 5 = 800 + 1125 - 150 + 5 = 1780
      const bmr = calculateBMR({
        gender: "male",
        weight: 80,
        height: 180,
        age: 30,
      });
      expect(bmr).toBe(1780);
    });

    it("should calculate BMR correctly for female", () => {
      // BMR = 10 * weight + 6.25 * height - 5 * age - 161
      // BMR = 10 * 60 + 6.25 * 165 - 5 * 25 - 161 = 600 + 1031.25 - 125 - 161 = 1345.25
      const bmr = calculateBMR({
        gender: "female",
        weight: 60,
        height: 165,
        age: 25,
      });
      expect(bmr).toBe(1345.25);
    });
  });

  describe("calculateTDEE", () => {
    it("should calculate TDEE correctly with activity level multipliers", () => {
      // BMR (male, 80kg, 180cm, 30yo) = 1780
      // TDEE sedentary = 1780 * 1.2 = 2136
      const tdeeSedentary = calculateTDEE({
        gender: "male",
        weight: 80,
        height: 180,
        age: 30,
        activityLevel: "sedentary",
      });
      expect(tdeeSedentary).toBe(2136);

      // TDEE very active = 1780 * 1.725 = 3070.5
      const tdeeVeryActive = calculateTDEE({
        gender: "male",
        weight: 80,
        height: 180,
        age: 30,
        activityLevel: "very_active",
      });
      expect(tdeeVeryActive).toBe(3070.5);
    });
  });

  describe("calculateBMI", () => {
    it("should calculate BMI correctly", () => {
      // BMI = weight / (height/100)^2
      // BMI = 80 / (1.8)^2 = 80 / 3.24 = 24.691358...
      const bmi = calculateBMI(80, 180);
      expect(bmi).toBeCloseTo(24.69, 2);
    });

    it("should return 0 if height is less than or equal to 0", () => {
      expect(calculateBMI(80, 0)).toBe(0);
      expect(calculateBMI(80, -10)).toBe(0);
    });
  });

  describe("getBMICategory", () => {
    it("should classify BMI correctly", () => {
      expect(getBMICategory(17.5)).toBe("Abaixo do peso");
      expect(getBMICategory(22.0)).toBe("Peso normal");
      expect(getBMICategory(27.5)).toBe("Sobrepeso");
      expect(getBMICategory(32.0)).toBe("Obesidade Grau I");
      expect(getBMICategory(37.0)).toBe("Obesidade Grau II");
      expect(getBMICategory(42.0)).toBe("Obesidade Grau III");
    });
  });

  describe("calculateTargetCalories", () => {
    it("should return maintenance TDEE if weight difference or deadline is 0", () => {
      expect(calculateTargetCalories(2000, 80, 80, 10)).toBe(2000);
      expect(calculateTargetCalories(2000, 80, 70, 0)).toBe(2000);
    });

    it("should calculate deficit calories correctly for weight loss", () => {
      // Lose 5kg in 10 weeks
      // Difference = 5kg * 7700 kcal = 38500 total calorie deficit target
      // Daily deficit = 38500 / (10 weeks * 7 days) = 38500 / 70 = 550 kcal/day
      // Target = TDEE - 550 = 2000 - 550 = 1450
      const target = calculateTargetCalories(2000, 80, 75, 10);
      expect(target).toBe(1450);
    });

    it("should calculate surplus calories correctly for weight gain", () => {
      // Gain 5kg in 10 weeks
      // Difference = -5kg * 7700 kcal = -38500
      // Daily adjustment = -550 kcal/day
      // Target = TDEE - (-550) = 2000 + 550 = 2550
      const target = calculateTargetCalories(2000, 80, 85, 10);
      expect(target).toBe(2550);
    });
  });

  describe("calculateMacrosInGrams", () => {
    it("should calculate grams correctly", () => {
      // Calories: 2000, P: 25%, C: 50%, F: 25%
      // Protein: 2000 * 0.25 / 4 = 125g
      // Carbs: 2000 * 0.50 / 4 = 250g
      // Fat: 2000 * 0.25 / 9 = 55.55...g
      const macros = calculateMacrosInGrams(2000, 25, 50, 25);
      expect(macros.proteinGrams).toBe(125);
      expect(macros.carbsGrams).toBe(250);
      expect(macros.fatGrams).toBeCloseTo(55.56, 2);
    });
  });

  describe("getMacroDistributionForDiet", () => {
    it("should return the correct distribution configurations", () => {
      expect(getMacroDistributionForDiet("low_carb")).toEqual({
        protein: 35,
        carbs: 20,
        fat: 45,
      });
      expect(getMacroDistributionForDiet("traditional")).toEqual({
        protein: 25,
        carbs: 50,
        fat: 25,
      });
    });
  });

  describe("getMacroDistributionForMode", () => {
    it("should return mode distributions, falling back to general", () => {
      expect(getMacroDistributionForMode("performance")).toEqual({
        protein: 30,
        carbs: 45,
        fat: 25,
      });
      expect(getMacroDistributionForMode("unknown_mode")).toEqual({
        protein: 25,
        carbs: 50,
        fat: 25,
      });
    });
  });

  describe("estimateTimeToGoal", () => {
    it("should return maintenance text if difference is small", () => {
      expect(estimateTimeToGoal(80, 80, 2000, 2050)).toBe(
        "Manutenção de peso.",
      );
    });

    it("should warn about inconsistent goals", () => {
      // Want to lose weight, but eat surplus calories
      expect(estimateTimeToGoal(80, 75, 2500, 2000)).toBe(
        "Meta calórica inconsistente com o objetivo de peso.",
      );
    });

    it("should return correct estimated weeks", () => {
      // Weight diff: 5kg. Calorie diff: 500 deficit.
      // Total cal diff: 5 * 7700 = 38500. Days: 38500 / 500 = 77 days. Weeks: 77 / 7 = 11 weeks.
      expect(estimateTimeToGoal(80, 75, 1500, 2000)).toBe("~11.0 semanas");
    });
  });

  describe("validateNutrition", () => {
    it("should return warnings for unsafe inputs", () => {
      // Low calories
      const errs1 = validateNutrition(700, 100, 70);
      expect(errs1).toContain(
        "Alerta: Calorias diárias abaixo do mínimo seguro (800 kcal).",
      );

      // High calories
      const errs2 = validateNutrition(6000, 100, 70);
      expect(errs2).toContain(
        "Alerta: Calorias diárias muito elevadas (> 5000 kcal).",
      );

      // Low protein per kg (under 0.8g/kg)
      // weight = 100kg, protein = 50g -> 0.5g/kg
      const errs3 = validateNutrition(2000, 50, 100);
      expect(errs3).toContain(
        "Alerta: Proteína abaixo do mínimo recomendado (0.8g/kg). Atual: 0.5g/kg",
      );

      // High protein per kg (over 2.5g/kg)
      // weight = 50kg, protein = 150g -> 3.0g/kg
      const errs4 = validateNutrition(2000, 150, 50);
      expect(errs4).toContain(
        "Alerta: Proteína acima do limite seguro (2.5g/kg). Atual: 3.0g/kg",
      );
    });

    it("should return empty array for completely safe nutrition profile", () => {
      // calories = 2000, protein = 100g, weight = 80kg -> 1.25g/kg (between 0.8 and 2.5)
      const errs = validateNutrition(2000, 100, 80);
      expect(errs.length).toBe(0);
    });
  });
});
