import React from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import type { Patient, DietPlan, AnyDietPlan } from "../types";
import { ClipboardListIcon, UsersIcon } from "./icons";
import {
  calculateBMI,
  getBMICategory,
} from "../services/metabolicCalculations";
import MealOptionTable from "./MealOptionTable";

interface DietPlanViewerProps {
  plan: DietPlan | AnyDietPlan;
  patient: Patient;
}

function isV2Plan(plan: AnyDietPlan): plan is DietPlan {
  return (plan as DietPlan).version === 2;
}

const translateMealName = (name: string, t: TFunction) => {
  const normalized = name.toLowerCase().trim();
  const keys: Record<string, string> = {
    "café da manhã": "meal_table.breakfast",
    "lanche da manhã": "meal_table.morning_snack",
    almoço: "meal_table.lunch",
    "lanche da tarde": "meal_table.afternoon_snack",
    jantar: "meal_table.dinner",
    ceia: "meal_table.supper",
  };
  const key = keys[normalized];
  return key ? t(key) : name;
};

const DietPlanViewer: React.FC<DietPlanViewerProps> = ({ plan, patient }) => {
  const { t, i18n } = useTranslation();
  const bmi = patient ? calculateBMI(patient.weight, patient.height) : 0;
  const bmiCategory = patient ? getBMICategory(bmi) : "N/A";

  if (!isV2Plan(plan)) {
    return (
      <div className="card p-6">
        <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">
          {t("profile.diets.legacy_plan_title")}
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          {t("profile.diets.legacy_plan_desc")}
        </p>
        <div className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
          <p>
            <strong>{t("patients.header_patient")}:</strong> {plan.patientName}
          </p>
          <p>
            <strong>{t("diet_generator.nutrition.daily_calories")}:</strong>{" "}
            {plan.daily_calories} kcal
          </p>
          <p>
            <strong>{t("profile.compare.proteins")}:</strong>{" "}
            {plan.macronutrients.protein_grams}g
          </p>
          <p>
            <strong>{t("profile.compare.carbohydrates")}:</strong>{" "}
            {plan.macronutrients.carbs_grams}g
          </p>
          <p>
            <strong>{t("profile.compare.fats")}:</strong>{" "}
            {plan.macronutrients.fat_grams}g
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6 animate-fade-in">
      <div className="mb-5 pb-5 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">
          {t("profile.diets.plan_for", { name: plan.patientName })}
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          {t("profile.diets.start_duration", {
            date: new Date(plan.startDate + "T00:00:00").toLocaleDateString(
              i18n.language === "pt" ? "pt-BR" : "en-US",
            ),
            days: plan.durationDays,
          })}
        </p>
      </div>

      <div className="text-center bg-sage-50 dark:bg-sage-900/30 p-4 rounded-2xl mb-6">
        <p className="text-sm text-sage-700 dark:text-sage-300 font-semibold">
          {t("profile.diets.daily_summary")}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
          {[
            {
              v: plan.dailyCalories.toFixed(0),
              l: t("diet_generator.display.calories"),
            },
            {
              v: `${plan.macronutrients.proteinGrams.toFixed(0)}g`,
              l: `${t("profile.compare.proteins")} (${plan.macronutrients.proteinPercentage}%)`,
            },
            {
              v: `${plan.macronutrients.carbsGrams.toFixed(0)}g`,
              l: `${t("profile.compare.carbohydrates")} (${plan.macronutrients.carbsPercentage}%)`,
            },
            {
              v: `${plan.macronutrients.fatGrams.toFixed(0)}g`,
              l: `${t("profile.compare.fats")} (${plan.macronutrients.fatPercentage}%)`,
            },
          ].map((s) => (
            <div key={s.l}>
              <p className="text-xl font-extrabold text-sage-800 dark:text-sage-100 stat-number">
                {s.v}
              </p>
              <p className="text-xs text-slate-500">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {plan.meals.map((meal) => (
          <div
            key={meal.mealName}
            className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-700"
          >
            <h4 className="font-bold text-lg text-slate-800 dark:text-white">
              {translateMealName(meal.mealName, t)}{" "}
              <span className="font-medium text-slate-400 text-sm">
                — {meal.time}
              </span>
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              {t("diet_generator.display.approx")}{" "}
              <span className="font-semibold">
                {meal.calories.toFixed(0)} kcal
              </span>{" "}
              (P: {meal.protein.toFixed(0)}g | C: {meal.carbs.toFixed(0)}g | G:{" "}
              {meal.fat.toFixed(0)}g)
            </p>
            <MealOptionTable
              mainOption={meal.mainOption}
              alternatives={meal.alternatives}
              accentColor="sage"
            />
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <ClipboardListIcon className="w-5 h-5" />{" "}
          {t("pdf.general_recommendations")}
        </h3>
        <ul className="mt-2 list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
          {plan.generalObservations.map((obs, i) => (
            <li key={i}>{obs}</li>
          ))}
          <li>
            {t("pdf.water_recommendation", {
              liters: plan.waterRecommendationLiters.toFixed(1),
            })}
          </li>
        </ul>
      </div>

      {patient && (
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <UsersIcon className="w-5 h-5" /> {t("profile.diets.patient_data")}
          </h3>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {[
              { l: t("profile.label_weight"), v: `${patient.weight} kg` },
              {
                l: t("profile.label_height"),
                v: `${(patient.height / 100).toFixed(2).replace(".", i18n.language === "pt" ? "," : ".")} m`,
              },
              { l: "IMC", v: bmi.toFixed(1) },
              { l: t("profile.diets.classification"), v: bmiCategory },
            ].map((d) => (
              <div
                key={d.l}
                className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl"
              >
                <p className="text-slate-400 text-xs">{d.l}</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {d.v}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DietPlanViewer;
