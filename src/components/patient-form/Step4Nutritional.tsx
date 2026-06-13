import React from "react";
import { useTranslation } from "react-i18next";
import type { Patient, DietMode, ClinicalTag } from "../../types";
import ModeSelector from "../diet-generator/ModeSelector";
import ClinicalTagSelector from "../diet-generator/ClinicalTagSelector";

interface Step4Props {
  data: Partial<Patient>;
  onDataChange: (data: Partial<Patient>) => void;
  errors: Record<string, string>;
}

export const dietaryOptionsMap: Record<string, string> = {
  diabetes: "Diabetes",
  hypertension: "Hipertensão",
  gluten_free: "Sem Glúten",
  lactose_free: "Sem Lactose",
  vegetarian: "Vegetariano",
  vegan: "Vegano",
};

const dietaryOptions = [
  {
    id: "diabetes",
    labelKey: "patient_form.nutritional.restrictions_diabetes",
    label: "Diabetes",
  },
  {
    id: "hypertension",
    labelKey: "patient_form.nutritional.restrictions_hypertension",
    label: "Hipertensão",
  },
  {
    id: "gluten_free",
    labelKey: "patient_form.nutritional.restrictions_gluten_free",
    label: "Sem Glúten",
  },
  {
    id: "lactose_free",
    labelKey: "patient_form.nutritional.restrictions_lactose_free",
    label: "Sem Lactose",
  },
  {
    id: "vegetarian",
    labelKey: "patient_form.nutritional.restrictions_vegetarian",
    label: "Vegetariano",
  },
  {
    id: "vegan",
    labelKey: "patient_form.nutritional.restrictions_vegan",
    label: "Vegano",
  },
];

const goalOptions = [
  {
    id: "weight_loss",
    labelKey: "profile.goals.weight_loss",
    label: "Perda de Peso",
  },
  {
    id: "weight_gain",
    labelKey: "profile.goals.weight_gain",
    label: "Ganho de Peso",
  },
  {
    id: "maintenance",
    labelKey: "profile.goals.maintenance",
    label: "Manutenção",
  },
  {
    id: "clinical_control",
    labelKey: "profile.goals.clinical_control",
    label: "Controle Clínico",
  },
  {
    id: "performance",
    labelKey: "profile.goals.performance",
    label: "Performance Esportiva",
  },
];

const Step4Nutritional: React.FC<Step4Props> = ({ data, onDataChange }) => {
  const { t } = useTranslation();

  const handleModeChange = (mode: DietMode) => onDataChange({ mode });

  const handleTagToggle = (tag: ClinicalTag) => {
    const current = data.clinicalTags || [];
    const next = current.includes(tag)
      ? current.filter((t) => t !== tag)
      : [...current, tag];
    onDataChange({ clinicalTags: next });
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    onDataChange({ [e.target.name]: e.target.value });
  };

  const handleRestrictionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    const current = data.dietaryRestrictions || [];
    onDataChange({
      dietaryRestrictions: checked
        ? [...current, value]
        : current.filter((i) => i !== value),
    });
  };

  return (
    <div className="space-y-7 animate-fade-in">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          {t("patient_form.nutritional.title")}
        </h3>
        <p className="mt-0.5 text-sm text-slate-500">
          {t("patient_form.nutritional.subtitle")}
        </p>
      </div>

      <div>
        <label className="input-label mb-3">
          {t("diet_generator.care_mode", { defaultValue: "Care Mode" })}
        </label>
        <ModeSelector
          selectedMode={data.mode || "general"}
          onSelect={handleModeChange}
        />
      </div>

      {data.mode === "clinical" && (
        <ClinicalTagSelector
          selectedTags={data.clinicalTags || []}
          onToggle={handleTagToggle}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="nutritionalGoal" className="input-label">
            {t("profile.label_goal", { defaultValue: "Goal" })}
          </label>
          <select
            id="nutritionalGoal"
            name="nutritionalGoal"
            value={data.nutritionalGoal || "maintenance"}
            onChange={handleInputChange}
            className="input-field"
          >
            {goalOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {t(opt.labelKey, { defaultValue: opt.label })}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="consultationMode" className="input-label">
            {t("patient_form.nutritional.consultation_mode")}
          </label>
          <select
            id="consultationMode"
            name="consultationMode"
            value={data.consultationMode || "presencial"}
            onChange={handleInputChange}
            className="input-field"
          >
            <option value="presencial">
              {t("patient_form.nutritional.mode_presencial")}
            </option>
            <option value="remoto">
              {t("patient_form.nutritional.mode_remoto")}
            </option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label htmlFor="medications" className="input-label">
            {t("patient_form.nutritional.medications")}
          </label>
          <textarea
            id="medications"
            name="medications"
            rows={2}
            value={data.medications || ""}
            onChange={handleInputChange}
            className="input-field resize-none"
            placeholder={t("patient_form.nutritional.medications_placeholder")}
          />
        </div>
        <div>
          <label htmlFor="familyHistory" className="input-label">
            {t("patient_form.nutritional.family_history")}
          </label>
          <textarea
            id="familyHistory"
            name="familyHistory"
            rows={2}
            value={data.familyHistory || ""}
            onChange={handleInputChange}
            className="input-field resize-none"
            placeholder={t(
              "patient_form.nutritional.family_history_placeholder",
            )}
          />
        </div>
      </div>

      <hr className="border-slate-100 dark:border-slate-800" />

      <h3 className="text-base font-bold text-slate-900 dark:text-white">
        {t("patient_form.nutritional.eating_habits")}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="input-label">
            {t("patient_form.nutritional.meals_per_day")}
          </label>
          <input
            type="range"
            min="1"
            max="6"
            step="1"
            value={data.mealsPerDay || 4}
            onChange={(e) =>
              onDataChange({ mealsPerDay: parseInt(e.target.value, 10) })
            }
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sage-600 dark:bg-slate-700 mt-2"
          />
          <p className="text-center font-semibold text-sage-600 dark:text-sage-300 mt-1">
            {data.mealsPerDay === 1
              ? t("patient_form.nutritional.meals_count_one")
              : t("patient_form.nutritional.meals_count_other", {
                  count: data.mealsPerDay,
                })}
          </p>
        </div>
        <div>
          <label htmlFor="hydrationLevel" className="input-label">
            {t("patient_form.nutritional.water_intake")}
          </label>
          <select
            id="hydrationLevel"
            name="hydrationLevel"
            value={data.hydrationLevel || "moderate"}
            onChange={handleInputChange}
            className="input-field"
          >
            <option value="low">
              {t("patient_form.nutritional.water_low")}
            </option>
            <option value="moderate">
              {t("patient_form.nutritional.water_moderate")}
            </option>
            <option value="high">
              {t("patient_form.nutritional.water_high")}
            </option>
          </select>
        </div>
      </div>

      <div>
        <label className="input-label">
          {t("patient_form.nutritional.restrictions_pref")}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-1">
          {dietaryOptions.map((option) => {
            const checked = (data.dietaryRestrictions || []).includes(
              option.id,
            );
            return (
              <label
                key={option.id}
                htmlFor={option.id}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${checked ? "border-sage-400 bg-sage-50 dark:bg-sage-900/20" : "border-slate-200 dark:border-slate-700 hover:border-slate-300"}`}
              >
                <input
                  id={option.id}
                  name="dietaryRestrictions"
                  type="checkbox"
                  value={option.id}
                  checked={checked}
                  onChange={handleRestrictionsChange}
                  className="h-4 w-4 rounded border-slate-300 text-sage-600 focus:ring-sage-500 accent-sage-600"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t(option.labelKey, { defaultValue: option.label })}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <label htmlFor="foodAllergies" className="input-label">
          {t("patient_form.nutritional.allergies")}
        </label>
        <textarea
          id="foodAllergies"
          name="foodAllergies"
          rows={2}
          value={data.foodAllergies || ""}
          onChange={(e) => onDataChange({ foodAllergies: e.target.value })}
          className="input-field resize-none"
          placeholder={t("patient_form.nutritional.allergies_placeholder")}
        />
      </div>
    </div>
  );
};

export default Step4Nutritional;
