import React, { useMemo } from "react";
import type { DietFormData, DietCalculations } from "./dietForm.types";

interface Step3Props {
  formData: DietFormData;
  onUpdate: (data: Partial<DietFormData>) => void;
  dailyCalories: number;
  calculations: DietCalculations;
}

const mealCalorieDistribution = {
  3: [
    { name: "Café da Manhã", time: "08:00", percentage: 30 },
    { name: "Almoço", time: "13:00", percentage: 40 },
    { name: "Jantar", time: "19:00", percentage: 30 },
  ],
  4: [
    { name: "Café da Manhã", time: "08:00", percentage: 25 },
    { name: "Almoço", time: "12:00", percentage: 35 },
    { name: "Lanche da Tarde", time: "16:00", percentage: 15 },
    { name: "Jantar", time: "20:00", percentage: 25 },
  ],
  5: [
    { name: "Café da Manhã", time: "07:00", percentage: 20 },
    { name: "Lanche da Manhã", time: "10:00", percentage: 10 },
    { name: "Almoço", time: "13:00", percentage: 30 },
    { name: "Lanche da Tarde", time: "16:00", percentage: 15 },
    { name: "Jantar", time: "20:00", percentage: 25 },
  ],
  6: [
    { name: "Café da Manhã", time: "07:00", percentage: 20 },
    { name: "Lanche da Manhã", time: "10:00", percentage: 10 },
    { name: "Almoço", time: "13:00", percentage: 30 },
    { name: "Lanche da Tarde", time: "16:00", percentage: 10 },
    { name: "Jantar", time: "19:00", percentage: 25 },
    { name: "Ceia", time: "22:00", percentage: 5 },
  ],
};

const fieldClass = "rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-sage-500/60 focus:border-sage-400 focus:outline-none transition-all";

const Step3MealPlan: React.FC<Step3Props> = ({ formData, onUpdate, dailyCalories, calculations }) => {
  const meals = useMemo(() => {
    const num = formData.numberOfMeals || 5;
    return mealCalorieDistribution[num as keyof typeof mealCalorieDistribution] || mealCalorieDistribution[5];
  }, [formData.numberOfMeals]);

  const handleMealsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numMeals = parseInt(e.target.value, 10);
    onUpdate({ numberOfMeals: numMeals, meals: mealCalorieDistribution[numMeals as keyof typeof mealCalorieDistribution] });
  };

  const handleMealTimeChange = (index: number, time: string) => {
    const updatedMeals = [...(formData.meals ?? [])];
    updatedMeals[index].time = time;
    onUpdate({ meals: updatedMeals });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onUpdate({ [e.target.name]: e.target.value } as Partial<DietFormData>);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Plano Alimentar</h3>
        <p className="mt-0.5 text-sm text-slate-500">Defina a estrutura de refeições e os detalhes finais do plano.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="durationDays" className="input-label">Duração do Plano (dias)</label>
          <input type="number" name="durationDays" id="durationDays" value={formData.durationDays} onChange={handleInputChange} className="input-field" />
        </div>
        <div>
          <label htmlFor="startDate" className="input-label">Data de Início</label>
          <input type="date" name="startDate" id="startDate" value={formData.startDate} onChange={handleInputChange} className="input-field" />
        </div>
      </div>

      <div>
        <label className="input-label">Número de refeições por dia</label>
        <input type="range" min="3" max="6" step="1" value={formData.numberOfMeals} onChange={handleMealsChange} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sage-600 dark:bg-slate-700 mt-2" />
        <p className="text-center font-semibold text-sage-600 dark:text-sage-300 mt-1">{formData.numberOfMeals} refeições</p>
      </div>

      <div>
        <label className="input-label">Horários e Metas por Refeição</label>
        <div className="space-y-2.5">
          {meals.map((meal, index) => {
            const factor = meal.percentage / 100;
            const mCal = dailyCalories * factor;
            const mProt = calculations.macrosInGrams.proteinGrams * factor;
            const mCarb = calculations.macrosInGrams.carbsGrams * factor;
            const mFat = calculations.macrosInGrams.fatGrams * factor;
            return (
              <div key={meal.name} className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="font-bold text-slate-800 dark:text-white">{meal.name}</span>
                  <input type="time" value={formData.meals?.[index]?.time || meal.time} onChange={(e) => handleMealTimeChange(index, e.target.value)} className={fieldClass} />
                </div>
                <div className="flex flex-wrap gap-4 items-center">
                  <span className="flex items-baseline gap-1"><span className="text-sm font-extrabold text-slate-900 dark:text-white">{Math.round(mCal)}</span><span className="text-[11px] text-slate-500">kcal</span></span>
                  <span className="flex items-baseline gap-1"><span className="text-xs font-bold text-sky-600">{Math.round(mProt)}g</span><span className="text-[9px] text-slate-400">P</span></span>
                  <span className="flex items-baseline gap-1"><span className="text-xs font-bold text-amber-600">{Math.round(mCarb)}g</span><span className="text-[9px] text-slate-400">C</span></span>
                  <span className="flex items-baseline gap-1"><span className="text-xs font-bold text-orange-600">{Math.round(mFat)}g</span><span className="text-[9px] text-slate-400">G</span></span>
                  <span className="ml-auto text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{meal.percentage}% do dia</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <label htmlFor="finalObservations" className="input-label">Observações Finais</label>
        <textarea name="finalObservations" id="finalObservations" value={formData.finalObservations} onChange={handleInputChange} rows={3} className="input-field resize-none" placeholder="Ex: incluir alimentos ricos em ferro, evitar cafeína à noite..." />
      </div>
    </div>
  );
};

export default Step3MealPlan;
