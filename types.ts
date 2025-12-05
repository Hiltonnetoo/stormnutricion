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
export interface MealOption {
    name: string;
    portion: string;
    details?: string;
}

export interface Meal {
    mealName: string; // "Café da Manhã"
    time: string; // "08:00"
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    mainOption: MealOption;
    alternatives: MealOption[];
}

export interface DietPlan {
    version: 2; // To distinguish from V1 plans
    id?: string;
    patientId: string;
    patientName: string;
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
}

// Combined type for use in listings and history
export type AnyDietPlan = (V1_DietPlan & { version?: 1 | undefined }) | DietPlan;


// --- Other existing types ---
export interface Patient {
  id?: string;
  // Step 1: Personal Data
  firstName: string;
  lastName: string;
  dob: string; // Date of Birth
  gender: 'male' | 'female' | 'other';
  
  // Step 2: Contact & Address
  email: string;
  phone: string;
  address: {
    cep: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
  };

  // Step 3: Professional Data
  profession: string;
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  
  // Step 4: Nutritional Data
  mealsPerDay: number;
  hydrationLevel: 'low' | 'moderate' | 'high';
  dietaryRestrictions: string[]; // e.g., ['diabetes', 'lactose_intolerance']
  foodAllergies: string; // free text

  // Step 5: Anthropometric Data
  weight: number; // in kg
  height: number; // in cm
  termsAccepted: boolean;
  
  // Metadata
  status: 'Active' | 'Inactive';
  createdAt: string;
  avatarUrl: string;
}

export interface EmailLog {
  id: string;
  patientName: string;
  patientEmail: string;
  dietDate: string;
  sentAt: string;
  status: 'Sent' | 'Failed';
}

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
}