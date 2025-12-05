import React, { useState } from 'react';
import type { DietPlan } from '../../types';
import { ClipboardListIcon, DownloadIcon } from '../icons';
import ExportDietModal from '../modals/ExportDietModal';

interface DietPlanDisplayProps {
    plan: DietPlan;
    onSave: () => void;
    onDiscard: () => void;
    isSaving: boolean;
    saveSuccess: boolean;
}

const DietPlanDisplay: React.FC<DietPlanDisplayProps> = ({ plan, onSave, onDiscard, isSaving, saveSuccess }) => {
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    
    return (
        <>
            <div id="diet-plan-display-content" className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Plano Gerado para {plan.patientName}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Início em: {new Date(plan.startDate + 'T00:00:00').toLocaleDateString('pt-BR')} | Duração: {plan.durationDays} dias
                        </p>
                    </div>
                    <div className="flex gap-2 mt-3 sm:mt-0 no-export">
                        <button onClick={onDiscard} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-600 dark:text-gray-200 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-500">
                            Descartar
                        </button>
                         <button onClick={() => setIsExportModalOpen(true)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-600 dark:text-gray-200 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-500 flex items-center gap-2">
                            <DownloadIcon className="w-4 h-4"/>
                            Exportar
                        </button>
                        <button onClick={onSave} disabled={isSaving || saveSuccess} className="px-4 py-2 text-sm font-medium text-white bg-accent disabled:bg-blue-300 border border-transparent rounded-md shadow-sm hover:bg-blue-700 w-full sm:w-auto">
                            {isSaving ? 'Salvando...' : (saveSuccess ? 'Salvo com Sucesso!' : 'Salvar Plano')}
                        </button>
                    </div>
                </div>

                {/* Header */}
                <div className="text-center bg-sage-50 dark:bg-sage-900/50 p-4 rounded-lg mb-6">
                    <p className="text-sm text-sage-600 dark:text-sage-300 font-semibold">Resumo Nutricional Diário</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                        <div>
                            <p className="text-xl font-bold text-sage-800 dark:text-sage-100">{plan.dailyCalories.toFixed(0)}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Calorias (kcal)</p>
                        </div>
                        <div>
                            <p className="text-xl font-bold text-sage-800 dark:text-sage-100">{plan.macronutrients.proteinGrams.toFixed(0)}g</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Proteínas ({plan.macronutrients.proteinPercentage}%)</p>
                        </div>
                        <div>
                            <p className="text-xl font-bold text-sage-800 dark:text-sage-100">{plan.macronutrients.carbsGrams.toFixed(0)}g</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Carboidratos ({plan.macronutrients.carbsPercentage}%)</p>
                        </div>
                        <div>
                            <p className="text-xl font-bold text-sage-800 dark:text-sage-100">{plan.macronutrients.fatGrams.toFixed(0)}g</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Gorduras ({plan.macronutrients.fatPercentage}%)</p>
                        </div>
                    </div>
                </div>

                {/* Meals */}
                <div className="space-y-4">
                    {plan.meals.map((meal) => (
                        <div key={meal.mealName} className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                            <h4 className="font-bold text-lg text-gray-800 dark:text-white">{meal.mealName} <span className="font-medium text-gray-500 dark:text-gray-400 text-sm">- {meal.time}</span></h4>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                Aprox. <span className="font-semibold">{meal.calories.toFixed(0)} kcal</span> (P: {meal.protein.toFixed(0)}g | C: {meal.carbs.toFixed(0)}g | G: {meal.fat.toFixed(0)}g)
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm"><span className="font-bold text-sage-600 dark:text-sage-300">Opção Principal:</span> {meal.mainOption.name} - <span className="italic">{meal.mainOption.portion}</span>. {meal.mainOption.details && `(${meal.mainOption.details})`}</p>
                                <details className="text-sm">
                                    <summary className="cursor-pointer font-semibold text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">Ver 3 alternativas</summary>
                                    <ul className="list-disc list-inside pl-4 mt-2 space-y-1 text-gray-500 dark:text-gray-400">
                                        {meal.alternatives.map((alt, i) => <li key={i}>{alt.name} - <span className="italic">{alt.portion}</span>. {alt.details && `(${alt.details})`}</li>)}
                                    </ul>
                                </details>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Observations */}
                <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2"><ClipboardListIcon className="w-5 h-5"/> Recomendações Gerais</h3>
                    <ul className="mt-2 list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                        {plan.generalObservations.map((obs, i) => <li key={i}>{obs}</li>)}
                        <li>Beba aproximadamente <span className="font-semibold">{plan.waterRecommendationLiters.toFixed(1)}</span> litros de água por dia.</li>
                    </ul>
                </div>
            </div>
            <ExportDietModal 
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                plan={plan}
                targetElementId="diet-plan-display-content"
            />
        </>
    );
};

export default DietPlanDisplay;