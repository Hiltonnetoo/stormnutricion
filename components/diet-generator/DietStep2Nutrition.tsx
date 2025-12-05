import React from 'react';

interface Step2Props {
    formData: any;
    onUpdate: (data: any) => void;
    calculations: any;
    errors: Record<string, string>;
    validationWarnings: string[];
}

const StatCard: React.FC<{ label: string; value: string; unit: string; }> = ({ label, value, unit }) => (
    <div className="bg-gray-100 dark:bg-gray-900/50 p-3 rounded-lg text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-xl font-bold text-sage-700 dark:text-sage-200">
            {value} <span className="text-sm font-medium">{unit}</span>
        </p>
    </div>
);

const Step2Nutrition: React.FC<Step2Props> = ({ formData, onUpdate, calculations, errors, validationWarnings }) => {
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        onUpdate({ [e.target.name]: e.target.value });
    };

    const handleMacroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const newMacros = { ...formData.macros, [name]: parseInt(value) || 0 };
        onUpdate({ macros: newMacros });
    };

    return (
        <div className="space-y-6 animate-fade-in">
             <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Informações Nutricionais</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Revise os cálculos automáticos e ajuste as metas nutricionais conforme necessário.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="TMB" value={calculations.bmr.toFixed(0)} unit="kcal" />
                <StatCard label="GET (TDEE)" value={calculations.tdee.toFixed(0)} unit="kcal" />
                <StatCard label="Meta Sugerida" value={calculations.targetCalories.toFixed(0)} unit="kcal" />
                <StatCard label="Água" value={calculations.water.toFixed(1)} unit="litros" />
            </div>

             {validationWarnings.length > 0 && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/50 border-l-4 border-yellow-400 dark:border-yellow-500">
                    <h4 className="text-sm font-bold text-yellow-800 dark:text-yellow-200">Alertas de Segurança</h4>
                    <ul className="mt-1 list-disc list-inside text-sm text-yellow-700 dark:text-yellow-300">
                        {validationWarnings.map((warn, i) => <li key={i}>{warn}</li>)}
                    </ul>
                </div>
             )}

            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="dailyCalories" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Calorias Diárias (kcal)</label>
                        <input type="number" name="dailyCalories" id="dailyCalories" value={formData.dailyCalories} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm ${errors.dailyCalories ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white focus:border-sage-500 focus:ring-sage-500`} />
                        {errors.dailyCalories && <p className="mt-1 text-sm text-red-600">{errors.dailyCalories}</p>}
                     </div>
                     <div>
                        <label htmlFor="dietType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Dieta</label>
                        <select id="dietType" name="dietType" value={formData.dietType} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-sage-500 focus:ring-sage-500">
                            <option value="traditional">Tradicional</option>
                            <option value="low_carb">Low Carb</option>
                            <option value="diabetic">Diabética</option>
                            <option value="vegetarian">Vegetariana</option>
                            <option value="high_protein">Hiperproteica</option>
                        </select>
                     </div>
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Distribuição de Macronutrientes (%)</label>
                    <div className="mt-2 grid grid-cols-3 gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div>
                            <label htmlFor="protein" className="text-xs text-gray-500 dark:text-gray-400">Proteínas</label>
                            <input type="number" name="protein" id="protein" value={formData.macros.protein} onChange={handleMacroChange} className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm" />
                            <span className="text-xs text-gray-600 dark:text-gray-300">{calculations.macrosInGrams.proteinGrams.toFixed(0)}g</span>
                        </div>
                        <div>
                            <label htmlFor="carbs" className="text-xs text-gray-500 dark:text-gray-400">Carboidratos</label>
                            <input type="number" name="carbs" id="carbs" value={formData.macros.carbs} onChange={handleMacroChange} className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm" />
                            <span className="text-xs text-gray-600 dark:text-gray-300">{calculations.macrosInGrams.carbsGrams.toFixed(0)}g</span>
                        </div>
                        <div>
                            <label htmlFor="fat" className="text-xs text-gray-500 dark:text-gray-400">Gorduras</label>
                            <input type="number" name="fat" id="fat" value={formData.macros.fat} onChange={handleMacroChange} className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm" />
                            <span className="text-xs text-gray-600 dark:text-gray-300">{calculations.macrosInGrams.fatGrams.toFixed(0)}g</span>
                        </div>
                    </div>
                     {errors.macros && <p className="mt-1 text-sm text-red-600">{errors.macros}</p>}
                 </div>
            </div>
        </div>
    );
};

export default Step2Nutrition;