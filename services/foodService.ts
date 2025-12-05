import { brazilianFoods } from '../data/foods';
import type { Food } from '../types';

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
    "Preparações"
];


/**
 * Retrieves all foods belonging to a specific category.
 * @param category The category to filter by.
 * @returns An array of Food objects.
 */
export const getFoodsByCategory = (category: string): Food[] => {
    return brazilianFoods.filter(food => food.category === category);
};

/**
 * Searches for foods by name.
 * @param query The search term.
 * @returns An array of Food objects that match the query.
 */
export const searchFoods = (query: string): Food[] => {
    if (!query) return [];
    const lowercasedQuery = query.toLowerCase();
    return brazilianFoods.filter(food => food.name.toLowerCase().includes(lowercasedQuery));
};

/**
 * Retrieves a single food by its unique ID.
 * @param id The ID of the food to retrieve.
 * @returns A Food object or undefined if not found.
 */
export const getFoodById = (id: string): Food | undefined => {
    return brazilianFoods.find(food => food.id === id);
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
export const calculateNutrition = (items: { food: Food; quantity: number }[]): NutrientTotals => {
    const totals: NutrientTotals = {
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        totalFiber: 0,
        totalSodium: 0,
    };

    items.forEach(item => {
        totals.totalCalories += item.food.calories * item.quantity;
        totals.totalProtein += item.food.protein * item.quantity;
        totals.totalCarbs += item.food.carbs * item.quantity;
        totals.totalFat += item.food.fat * item.quantity;
        totals.totalFiber += item.food.fiber * item.quantity;
        totals.totalSodium += item.food.sodium * item.quantity;
    });

    // Rounding to 2 decimal places for cleaner display
    for (const key in totals) {
        totals[key as keyof NutrientTotals] = parseFloat(totals[key as keyof NutrientTotals].toFixed(2));
    }

    return totals;
};
