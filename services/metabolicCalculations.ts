// TDEE activity level multipliers
const activityMultipliers = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extremely_active: 1.9,
};

// Macronutrient distribution percentages by diet type
const macroDistributions = {
  traditional: { protein: 25, carbs: 50, fat: 25 },
  low_carb: { protein: 35, carbs: 20, fat: 45 },
  diabetic: { protein: 25, carbs: 45, fat: 30 },
  vegetarian: { protein: 20, carbs: 55, fat: 25 },
  high_protein: { protein: 35, carbs: 40, fat: 25 },
};

export type Gender = 'male' | 'female';
export type ActivityLevel = keyof typeof activityMultipliers;
export type DietType = keyof typeof macroDistributions;

interface MetabolicData {
  gender: Gender;
  weight: number; // in kg
  height: number; // in cm
  age: number; // in years
  activityLevel: ActivityLevel;
}

/**
 * Calculates Basal Metabolic Rate (BMR) using the Mifflin-St Jeor equation.
 */
export const calculateBMR = ({ gender, weight, height, age }: Omit<MetabolicData, 'activityLevel'>): number => {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
};

/**
 * Calculates Total Daily Energy Expenditure (TDEE).
 */
export const calculateTDEE = (data: MetabolicData): number => {
  const bmr = calculateBMR(data);
  const multiplier = activityMultipliers[data.activityLevel];
  return bmr * multiplier;
};

/**
 * Calculates Body Mass Index (BMI).
 */
export const calculateBMI = (weight: number, height: number): number => {
  if (height <= 0) return 0;
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
};

/**
 * Provides a classification for a given BMI value.
 */
export const getBMICategory = (bmi: number): string => {
  if (bmi < 18.5) return "Abaixo do peso";
  if (bmi >= 18.5 && bmi < 24.9) return "Peso normal";
  if (bmi >= 25 && bmi < 29.9) return "Sobrepeso";
  if (bmi >= 30 && bmi < 34.9) return "Obesidade Grau I";
  if (bmi >= 35 && bmi < 39.9) return "Obesidade Grau II";
  if (bmi >= 40) return "Obesidade Grau III";
  return "N/A";
};

/**
 * Calculates the target daily calories based on the user's goal.
 */
export const calculateTargetCalories = (
    tdee: number,
    currentWeight: number,
    targetWeight: number,
    deadlineWeeks: number
): number => {
    if (deadlineWeeks <= 0 || currentWeight === targetWeight) {
        return tdee; // Maintenance
    }
    const weightDifference = currentWeight - targetWeight;
    const totalCalorieDifference = weightDifference * 7700;
    const dailyCalorieAdjustment = totalCalorieDifference / (deadlineWeeks * 7);
    
    return tdee - dailyCalorieAdjustment;
};

/**
 * Calculates macronutrient grams based on total calories and distribution percentages.
 */
export const calculateMacrosInGrams = (
    totalCalories: number,
    proteinPercentage: number,
    carbsPercentage: number,
    fatPercentage: number
) => {
    const proteinGrams = (totalCalories * (proteinPercentage / 100)) / 4;
    const carbsGrams = (totalCalories * (carbsPercentage / 100)) / 4;
    const fatGrams = (totalCalories * (fatPercentage / 100)) / 9;
    return { proteinGrams, carbsGrams, fatGrams };
};

/**
 * Returns the default macro distribution for a given diet type.
 */
export const getMacroDistributionForDiet = (dietType: DietType) => {
    return macroDistributions[dietType];
};

/**
 * Estimates the time to reach a weight goal based on a calorie deficit/surplus.
 */
export const estimateTimeToGoal = (
    currentWeight: number,
    targetWeight: number,
    dailyCalories: number,
    tdee: number
): string => {
    const calorieDifference = tdee - dailyCalories;
    if (Math.abs(calorieDifference) < 100) return "Manutenção de peso.";

    const weightDifference = currentWeight - targetWeight;
    if ((calorieDifference > 0 && weightDifference < 0) || (calorieDifference < 0 && weightDifference > 0)) {
        return "Meta calórica inconsistente com o objetivo de peso."
    }

    const totalCalorieDifference = Math.abs(weightDifference * 7700);
    const daysToGoal = totalCalorieDifference / Math.abs(calorieDifference);
    const weeksToGoal = daysToGoal / 7;

    return `~${weeksToGoal.toFixed(1)} semanas`;
};


/**
 * Validates nutritional data against safety limits.
 */
export const validateNutrition = (calories: number, proteinGrams: number, weight: number) => {
    const errors: string[] = [];
    if (calories < 800) errors.push("Alerta: Calorias diárias abaixo do mínimo seguro (800 kcal).");
    if (calories > 5000) errors.push("Alerta: Calorias diárias muito elevadas (> 5000 kcal).");
    
    const proteinPerKg = proteinGrams / weight;
    if (proteinPerKg < 0.8) errors.push(`Alerta: Proteína abaixo do mínimo recomendado (0.8g/kg). Atual: ${proteinPerKg.toFixed(1)}g/kg`);
    if (proteinPerKg > 2.5) errors.push(`Alerta: Proteína acima do limite seguro (2.5g/kg). Atual: ${proteinPerKg.toFixed(1)}g/kg`);

    return errors;
}