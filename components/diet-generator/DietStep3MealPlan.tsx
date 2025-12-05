import React, { useMemo } from 'react';

interface Step3Props {
    formData: any;
    onUpdate: (data: any) => void;
    dailyCalories: number;
}

const mealCalorieDistribution = {
    3: [ // 3 meals
        { name: "Café da Manhã", time: "08:00", percentage: 30 },
        { name: "Almoço", time: "13:00", percentage: 40 },
        { name: "Jantar", time: "19:00", percentage: 30 },
    ],
    4: [ // 4 meals
        { name: "Café da Manhã", time: "08:00", percentage: 25 },
        { name: "Almoço", time: "12:00", percentage: 35 },
        { name: "Lanche da Tarde", time: "16:00", percentage: 15 },
        { name: "Jantar", time: "20:00", percentage: 25 },
    ],
    5: [ // 5 meals
        { name: "Café da Manhã", time: "07:00", percentage: 20 },
        { name: "Lanche da Manhã", time: "10:00", percentage: 10 },
        { name: "Almoço", time: "13:00", percentage: 30 },
        { name: "Lanche da Tarde", time: "16:00", percentage: 15 },
        { name: "Jantar", time: "20:00", percentage: 25 },
    ],
    6: [ // 6 meals
        { name: "Café da Manhã", time: "07:00", percentage: 20 },
        { name: "Lanche da Manhã", time: "10:00", percentage: 10 },
        { name: "Almoço", time: "13:00", percentage: 30 },
        { name: "Lanche da Tarde", time: "16:00", percentage: 10 },
        { name: "Jantar", time: "19:00", percentage: 25 },
        { name: "Ceia", time: "22:00", percentage: 5 },
    ],
};

const Step3MealPlan: React.FC<Step3Props> = ({ formData, onUpdate, dailyCalories }) => {
    
    const meals = useMemo(() => {
        return mealCalorieDistribution[formData.numberOfMeals as keyof typeof mealCalorieDistribution];
    }, [formData.numberOfMeals]);

    const handleMealsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const numMeals = parseInt(e.target.value, 10);
        onUpdate({ 
            numberOfMeals: numMeals, 
            meals: mealCalorieDistribution[numMeals as keyof typeof mealCalorieDistribution] 
        });
    };
    
    const handleMealTimeChange = (index: number, time: string) => {
        const updatedMeals = [...formData.meals];
        updatedMeals[index].time = time;
        onUpdate({ meals: updatedMeals });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onUpdate({ [e.target.name]: e.target.value });
    };

    return (
        <div className="space-y-6 animate-fade-in">
             <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Plano Alimentar</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Defina a estrutura de refeições e os detalhes finais do plano.</p>
            </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="durationDays" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Duração do Plano (dias)</label>
                    <input type="number" name="durationDays" id="durationDays" value={formData.durationDays} onChange={handleInputChange} className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-sage-500 focus:ring-sage-500" />
                </div>
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data de Início</label>
                    <input type="date" name="startDate" id="startDate" value={formData.startDate} onChange={handleInputChange} className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-sage-500 focus:ring-sage-500" />
                </div>
             </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Número de refeições por dia</label>
                <div className="mt-2">
                    <input type="range" min="3" max="6" step="1" value={formData.numberOfMeals} onChange={handleMealsChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600" />
                    <div className="text-center font-semibold text-sage-600 dark:text-sage-300 mt-1">{formData.numberOfMeals} refeições</div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Horários e Distribuição Calórica</label>
                <div className="mt-2 space-y-3">
                    {meals.map((meal, index) => (
                        <div key={meal.name} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg">
                            <span className="font-semibold text-gray-700 dark:text-gray-200 flex-1">{meal.name}</span>
                             <input 
                                type="time" 
                                value={formData.meals[index].time}
                                onChange={(e) => handleMealTimeChange(index, e.target.value)}
                                className="w-28 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
                            />
                            <div className="text-right w-24">
                                <span className="text-sm text-gray-800 dark:text-gray-100 font-medium">{(dailyCalories * (meal.percentage / 100)).toFixed(0)} kcal</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400"> ({meal.percentage}%)</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <div>
                 <label htmlFor="finalObservations" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Observações Finais para a IA</label>
                 <textarea name="finalObservations" id="finalObservations" value={formData.finalObservations} onChange={handleInputChange} rows={3} className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-sage-500 focus:ring-sage-500" placeholder="Ex: incluir alimentos ricos em ferro, evitar cafeína à noite..."></textarea>
            </div>
        </div>
    );
};

export default Step3MealPlan;