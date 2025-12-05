import { brazilianFoods } from '../data/foods';
import type { Food, Meal, DietPlan } from '../types';
import type { DietType } from './metabolicCalculations';

// --- CONFIGURAÇÕES DO ALGORITMO ---

// Mapeamento de tipos de dieta para categorias de alimentos preferenciais/rejeitadas
const dietTemplates: Record<DietType, { P: string[], C: string[], F: string[], avoid?: string[] }> = {
    traditional: {
        P: ['Carnes e Derivados', 'Leguminosas', 'Leite e Derivados'],
        C: ['Cereais e Derivados', 'Verduras e Legumes', 'Frutas'],
        F: ['Oleaginosas', 'Óleos e Gorduras']
    },
    low_carb: {
        P: ['Carnes e Derivados', 'Leite e Derivados', 'Oleaginosas'],
        C: ['Verduras e Legumes'],
        F: ['Óleos e Gorduras', 'Oleaginosas'],
        avoid: ['Cereais e Derivados', 'Açúcares e Doces']
    },
    diabetic: {
        P: ['Carnes e Derivados', 'Leguminosas'],
        C: ['Cereais e Derivados', 'Verduras e Legumes'],
        F: ['Oleaginosas', 'Óleos e Gorduras'],
        avoid: ['Açúcares e Doces']
    },
    vegetarian: {
        P: ['Leguminosas', 'Leite e Derivados', 'Oleaginosas'],
        C: ['Cereais e Derivados', 'Frutas', 'Verduras e Legumes'],
        F: ['Oleaginosas', 'Óleos e Gorduras'],
        avoid: ['Carnes e Derivados']
    },
    high_protein: {
        P: ['Carnes e Derivados', 'Leite e Derivados', 'Leguminosas'],
        C: ['Verduras e Legumes', 'Cereais e Derivados'],
        F: ['Oleaginosas', 'Óleos e Gorduras']
    }
};

const generalObservationsTemplates = {
    default: [
        "Mantenha-se bem hidratado ao longo do dia.",
        "Prefira temperos naturais como alho, cebola, ervas e especiarias.",
        "Evite o consumo de bebidas açucaradas, como refrigerantes e sucos industrializados.",
        "Pratique atividade física regularmente, conforme orientação profissional.",
        "Mastigue bem os alimentos e faça suas refeições em um ambiente tranquilo."
    ]
}


// --- FUNÇÕES HELPER ---

// Filtra o banco de alimentos com base nas regras de um template de dieta
const getFilteredFoods = (template: typeof dietTemplates[DietType]): Food[] => {
    return brazilianFoods.filter(food => !template.avoid?.includes(food.category));
};

// Seleciona um alimento aleatório de uma lista de categorias
const getRandomFoodFromCategories = (categories: string[], filteredFoods: Food[]): Food => {
    const candidateFoods = filteredFoods.filter(f => categories.includes(f.category));
    if (candidateFoods.length === 0) {
        // Fallback para qualquer alimento se nenhuma categoria corresponder
        return filteredFoods[Math.floor(Math.random() * filteredFoods.length)];
    }
    return candidateFoods[Math.floor(Math.random() * candidateFoods.length)];
};


// --- LÓGICA PRINCIPAL DE GERAÇÃO ---

interface GenerationParams {
    nutritionalTargets: { calories: number; protein: number; carbs: number; fat: number; };
    mealPlanConfig: {
        dietType: DietType;
        meals: Array<{ name: string; time: string; caloriePercentage: number }>;
    };
}

export const generateAlgorithmicDietPlan = ({ nutritionalTargets, mealPlanConfig }: GenerationParams): { meals: Meal[] } => {
    const template = dietTemplates[mealPlanConfig.dietType];
    const availableFoods = getFilteredFoods(template);
    const generatedMeals: Meal[] = [];

    for (const mealConfig of mealPlanConfig.meals) {
        const mealCalories = nutritionalTargets.calories * (mealConfig.caloriePercentage / 100);
        const mealProtein = nutritionalTargets.protein * (mealConfig.caloriePercentage / 100);
        const mealCarbs = nutritionalTargets.carbs * (mealConfig.caloriePercentage / 100);
        const mealFat = nutritionalTargets.fat * (mealConfig.caloriePercentage / 100);

        const createMealOption = () => {
            // Lógica simplificada para montar uma refeição
            const proteinSource = getRandomFoodFromCategories(template.P, availableFoods);
            const carbSource = getRandomFoodFromCategories(template.C, availableFoods);
            const fatSource = getRandomFoodFromCategories(template.F, availableFoods);
            
            // Calcula porções para atingir as metas da refeição (de forma aproximada)
            const proteinPortion = mealProtein / (proteinSource.protein / 100);
            const carbPortion = mealCarbs / (carbSource.carbs / 100);
            const fatPortion = mealFat / (fatSource.fat / 100);

            // Monta o nome da refeição
            const mealName = `${proteinSource.name}, ${carbSource.name} e ${fatSource.name}`;
            const mealPortion = `${proteinPortion.toFixed(0)}g, ${carbPortion.toFixed(0)}g e ${fatPortion.toFixed(0)}g`;

            return { name: mealName, portion: mealPortion, details: 'grelhado/cozido' };
        }

        generatedMeals.push({
            mealName: mealConfig.name,
            time: mealConfig.time,
            calories: mealCalories,
            protein: mealProtein,
            carbs: mealCarbs,
            fat: mealFat,
            mainOption: createMealOption(),
            alternatives: [createMealOption(), createMealOption(), createMealOption()],
        });
    }

    return { meals: generatedMeals };
};

export const getGeneralObservations = (): string[] => {
    return generalObservationsTemplates.default;
}
