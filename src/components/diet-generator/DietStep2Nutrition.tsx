import React from "react";
import type { DietFormData, DietCalculations, MacroSplit } from "./dietForm.types";

interface Step2Props {
  formData: DietFormData;
  onUpdate: (data: Partial<DietFormData>) => void;
  calculations: DietCalculations;
  errors: Record<string, string>;
  validationWarnings: string[];
}

const StatCard: React.FC<{ label: string; value: string; unit: string }> = ({ label, value, unit }) => (
  <div className="bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
    <p className="text-xs text-slate-500">{label}</p>
    <p className="text-xl font-extrabold text-sage-700 dark:text-sage-300 stat-number mt-0.5">
      {value} <span className="text-sm font-semibold text-slate-400">{unit}</span>
    </p>
  </div>
);

const Step2Nutrition: React.FC<Step2Props> = ({ formData, onUpdate, calculations, errors, validationWarnings }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onUpdate({ [e.target.name]: e.target.value } as Partial<DietFormData>);
  };

  const handleMacroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onUpdate({ macros: { ...formData.macros, [name]: parseInt(value) || 0 } as MacroSplit });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Informações Nutricionais</h3>
        <p className="mt-0.5 text-sm text-slate-500">Revise os cálculos automáticos e ajuste as metas nutricionais conforme necessário.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="TMB" value={calculations.bmr.toFixed(0)} unit="kcal" />
        <StatCard label="GET (TDEE)" value={calculations.tdee.toFixed(0)} unit="kcal" />
        <StatCard label="Meta Sugerida" value={calculations.targetCalories.toFixed(0)} unit="kcal" />
        <StatCard label="Água" value={calculations.water.toFixed(1)} unit="litros" />
      </div>

      {validationWarnings.length > 0 && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <h4 className="text-sm font-bold text-amber-800 dark:text-amber-200">Alertas de Segurança</h4>
          <ul className="mt-1 list-disc list-inside text-sm text-amber-700 dark:text-amber-300">
            {validationWarnings.map((warn, i) => <li key={i}>{warn}</li>)}
          </ul>
        </div>
      )}

      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="dailyCalories" className="input-label">Calorias Diárias (kcal)</label>
            <input type="number" name="dailyCalories" id="dailyCalories" value={formData.dailyCalories} onChange={handleInputChange} className={`input-field ${errors.dailyCalories ? "border-rose-400 focus:ring-rose-500/60" : ""}`} />
            {errors.dailyCalories && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.dailyCalories}</p>}
          </div>
          <div>
            <label htmlFor="dietType" className="input-label">Tipo de Dieta</label>
            <select id="dietType" name="dietType" value={formData.dietType} onChange={handleInputChange} className="input-field">
              <option value="traditional">Tradicional</option>
              <option value="low_carb">Low Carb</option>
              <option value="diabetic">Diabética</option>
              <option value="vegetarian">Vegetariana</option>
              <option value="high_protein">Hiperproteica</option>
            </select>
          </div>
        </div>

        <div>
          <label className="input-label">Distribuição de Macronutrientes (%)</label>
          <div className="grid grid-cols-3 gap-4 p-4 border border-slate-200 dark:border-slate-700 rounded-2xl">
            {[
              { name: "protein", label: "Proteínas", grams: calculations.macrosInGrams.proteinGrams },
              { name: "carbs", label: "Carboidratos", grams: calculations.macrosInGrams.carbsGrams },
              { name: "fat", label: "Gorduras", grams: calculations.macrosInGrams.fatGrams },
            ].map((m) => (
              <div key={m.name}>
                <label htmlFor={m.name} className="text-xs text-slate-500">{m.label}</label>
                <input type="number" name={m.name} id={m.name} value={formData.macros?.[m.name as keyof MacroSplit]} onChange={handleMacroChange} className="input-field mt-1 px-3 py-2" />
                <span className="text-xs text-slate-500 mt-1 block">{m.grams.toFixed(0)}g</span>
              </div>
            ))}
          </div>
          {errors.macros && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.macros}</p>}
        </div>
      </div>
    </div>
  );
};

export default Step2Nutrition;
