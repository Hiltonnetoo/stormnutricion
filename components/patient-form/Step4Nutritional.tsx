import React from 'react';
import type { Patient } from '../../types';

interface Step4Props {
    data: Partial<Patient>;
    onDataChange: (data: Partial<Patient>) => void;
    errors: Record<string, string>;
}

const dietaryOptions = [
    { id: 'diabetes', label: 'Diabetes' },
    { id: 'hypertension', label: 'Hipertensão' },
    { id: 'gluten_free', label: 'Sem Glúten' },
    { id: 'lactose_free', label: 'Sem Lactose' },
    { id: 'vegetarian', label: 'Vegetariano' },
    { id: 'vegan', label: 'Vegano' },
];

// Export the map for use in other components
export const dietaryOptionsMap: { [key: string]: string } = Object.fromEntries(
  dietaryOptions.map(option => [option.id, option.label])
);


const Step4Nutritional: React.FC<Step4Props> = ({ data, onDataChange, errors }) => {
    
    const handleMealsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onDataChange({ mealsPerDay: parseInt(e.target.value, 10) });
    };

    const handleHydrationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onDataChange({ hydrationLevel: e.target.value as Patient['hydrationLevel'] });
    }

    const handleRestrictionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        const currentRestrictions = data.dietaryRestrictions || [];
        const newRestrictions = checked 
            ? [...currentRestrictions, value]
            : currentRestrictions.filter(item => item !== value);
        onDataChange({ dietaryRestrictions: newRestrictions });
    };
    
    const handleAllergiesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onDataChange({ foodAllergies: e.target.value });
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Dados Nutricionais</h3>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Número de refeições por dia</label>
                <div className="mt-2">
                    <input type="range" min="1" max="6" step="1" value={data.mealsPerDay || 4} onChange={handleMealsChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600" />
                    <div className="text-center font-semibold text-sage-600 dark:text-sage-300 mt-1">{data.mealsPerDay} refeições</div>
                </div>
            </div>

            <div>
                <label htmlFor="hydrationLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nível de hidratação (consumo de água)</label>
                <select id="hydrationLevel" name="hydrationLevel" value={data.hydrationLevel || 'moderate'} onChange={handleHydrationChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-sage-500 focus:ring-sage-500">
                    <option value="low">Baixo (menos de 1L/dia)</option>
                    <option value="moderate">Moderado (1-2L/dia)</option>
                    <option value="high">Alto (mais de 2L/dia)</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Restrições ou preferências alimentares</label>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {dietaryOptions.map(option => (
                        <div key={option.id} className="flex items-center">
                            <input
                                id={option.id}
                                name="dietaryRestrictions"
                                type="checkbox"
                                value={option.id}
                                checked={(data.dietaryRestrictions || []).includes(option.id)}
                                onChange={handleRestrictionsChange}
                                className="h-4 w-4 rounded border-gray-300 text-sage-600 focus:ring-sage-500"
                            />
                            <label htmlFor={option.id} className="ml-3 text-sm text-gray-700 dark:text-gray-300">{option.label}</label>
                        </div>
                    ))}
                </div>
            </div>
             <div>
                <label htmlFor="foodAllergies" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Alergias Alimentares (se houver)</label>
                <textarea id="foodAllergies" name="foodAllergies" rows={3} value={data.foodAllergies || ''} onChange={handleAllergiesChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-sage-500 focus:ring-sage-500" placeholder="Ex: amendoim, frutos do mar, etc."></textarea>
            </div>
        </div>
    );
};

export default Step4Nutritional;