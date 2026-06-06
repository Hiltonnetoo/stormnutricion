import React from "react";
import type { Patient, DietPlan, AnyDietPlan } from "../types";
import { ClipboardListIcon, UsersIcon } from "./icons";
import { calculateBMI, getBMICategory } from "../services/metabolicCalculations";
import MealOptionTable from "./MealOptionTable";

interface DietPlanViewerProps {
  plan: DietPlan | AnyDietPlan;
  patient: Patient;
}

function isV2Plan(plan: AnyDietPlan): plan is DietPlan {
  return (plan as DietPlan).version === 2;
}

const DietPlanViewer: React.FC<DietPlanViewerProps> = ({ plan, patient }) => {
  const bmi = patient ? calculateBMI(patient.weight, patient.height) : 0;
  const bmiCategory = patient ? getBMICategory(bmi) : "N/A";

  if (!isV2Plan(plan)) {
    return (
      <div className="card p-6">
        <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Plano Legado (v1)</h2>
        <p className="text-sm text-slate-500 mb-4">Plano gerado com a versão antiga do sistema.</p>
        <div className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
          <p><strong>Paciente:</strong> {plan.patientName}</p>
          <p><strong>Calorias Diárias:</strong> {plan.daily_calories} kcal</p>
          <p><strong>Proteínas:</strong> {plan.macronutrients.protein_grams}g</p>
          <p><strong>Carboidratos:</strong> {plan.macronutrients.carbs_grams}g</p>
          <p><strong>Gorduras:</strong> {plan.macronutrients.fat_grams}g</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6 animate-fade-in">
      <div className="mb-5 pb-5 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Plano para {plan.patientName}</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Início em {new Date(plan.startDate + "T00:00:00").toLocaleDateString("pt-BR")} · Duração: {plan.durationDays} dias
        </p>
      </div>

      <div className="text-center bg-sage-50 dark:bg-sage-900/30 p-4 rounded-2xl mb-6">
        <p className="text-sm text-sage-700 dark:text-sage-300 font-semibold">Resumo Nutricional Diário</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
          {[
            { v: plan.dailyCalories.toFixed(0), l: "Calorias (kcal)" },
            { v: `${plan.macronutrients.proteinGrams.toFixed(0)}g`, l: `Proteínas (${plan.macronutrients.proteinPercentage}%)` },
            { v: `${plan.macronutrients.carbsGrams.toFixed(0)}g`, l: `Carboidratos (${plan.macronutrients.carbsPercentage}%)` },
            { v: `${plan.macronutrients.fatGrams.toFixed(0)}g`, l: `Gorduras (${plan.macronutrients.fatPercentage}%)` },
          ].map((s) => (
            <div key={s.l}>
              <p className="text-xl font-extrabold text-sage-800 dark:text-sage-100 stat-number">{s.v}</p>
              <p className="text-xs text-slate-500">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {plan.meals.map((meal) => (
          <div key={meal.mealName} className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
            <h4 className="font-bold text-lg text-slate-800 dark:text-white">
              {meal.mealName} <span className="font-medium text-slate-400 text-sm">— {meal.time}</span>
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Aprox. <span className="font-semibold">{meal.calories.toFixed(0)} kcal</span> (P: {meal.protein.toFixed(0)}g | C: {meal.carbs.toFixed(0)}g | G: {meal.fat.toFixed(0)}g)
            </p>
            <MealOptionTable mainOption={meal.mainOption} alternatives={meal.alternatives} accentColor="sage" />
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <ClipboardListIcon className="w-5 h-5" /> Recomendações Gerais
        </h3>
        <ul className="mt-2 list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
          {plan.generalObservations.map((obs, i) => <li key={i}>{obs}</li>)}
          <li>Beba aproximadamente <span className="font-semibold">{plan.waterRecommendationLiters.toFixed(1)}</span> litros de água por dia.</li>
        </ul>
      </div>

      {patient && (
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <UsersIcon className="w-5 h-5" /> Dados Atuais do Paciente
          </h3>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {[
              { l: "Peso Atual", v: `${patient.weight} kg` },
              { l: "Altura", v: `${(patient.height / 100).toFixed(2).replace(".", ",")} m` },
              { l: "IMC", v: bmi.toFixed(1) },
              { l: "Classificação", v: bmiCategory },
            ].map((d) => (
              <div key={d.l} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                <p className="text-slate-400 text-xs">{d.l}</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">{d.v}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DietPlanViewer;
