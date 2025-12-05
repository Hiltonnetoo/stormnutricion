import React from 'react';
import type { Patient, DietPlan, AnyDietPlan } from '../types';
import { ClipboardListIcon, UsersIcon } from './icons';
import { calculateBMI, getBMICategory } from '../services/metabolicCalculations';

interface DietPlanViewerProps {
    plan: DietPlan | AnyDietPlan;
    patient: Patient;
}

// A type guard to check if the plan is V2
function isV2Plan(plan: AnyDietPlan): plan is DietPlan {
  return (plan as DietPlan).version === 2;
}


const DietPlanViewer: React.FC<DietPlanViewerProps> = ({ plan, patient }) => {

    const bmi = patient ? calculateBMI(patient.weight, patient.height) : 0;
    const bmiCategory = patient ? getBMICategory(bmi) : 'N/A';
    
    if (!isV2Plan(plan)) {
        // Render a fallback for legacy V1 plans
        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Plano Legado (v1)</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Plano gerado com a versão antiga do sistema.</p>
                <div className="space-y-2">
                    <p><strong>Paciente:</strong> {plan.patientName}</p>
                    <p><strong>Calorias Diárias:</strong> {plan.daily_calories} kcal</p>
                    <p><strong>Proteínas:</strong> {plan.macronutrients.protein_grams}g</p>
                    <p><strong>Carboidratos:</strong> {plan.macronutrients.carbs_grams}g</p>
                    <p><strong>Gorduras:</strong> {plan.macronutrients.fat_grams}g</p>
                </div>
            </div>
        )
    }

    // Render the full V2 plan
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Plano para {plan.patientName}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Início em: {new Date(plan.startDate + 'T00:00:00').toLocaleDateString('pt-BR')} | Duração: {plan.durationDays} dias
                    </p>
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

            {/* Patient Current Data */}
            {patient && (
                 <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2"><UsersIcon className="w-5 h-5"/> Dados Atuais do Paciente</h3>
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md">
                            <p className="text-gray-500 dark:text-gray-400 text-xs">Peso Atual</p>
                            <p className="font-semibold text-gray-800 dark:text-gray-200">{patient.weight} kg</p>
                        </div>
                         <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md">
                            <p className="text-gray-500 dark:text-gray-400 text-xs">Altura</p>
                            <p className="font-semibold text-gray-800 dark:text-gray-200">{(patient.height / 100).toFixed(2).replace('.', ',')} m</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md">
                            <p className="text-gray-500 dark:text-gray-400 text-xs">IMC</p>
                            <p className="font-semibold text-gray-800 dark:text-gray-200">{bmi.toFixed(1)}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md">
                            <p className="text-gray-500 dark:text-gray-400 text-xs">Classificação</p>
                            <p className="font-semibold text-gray-800 dark:text-gray-200">{bmiCategory}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DietPlanViewer;