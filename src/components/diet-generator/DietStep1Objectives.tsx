import React from "react";
import { useTranslation } from "react-i18next";
import type { DietFormData } from "./dietForm.types";

interface Step1Props {
  formData: DietFormData;
  onUpdate: (data: Partial<DietFormData>) => void;
  patientData?: unknown;
  errors: Record<string, string>;
}

const errBorder = (on?: string) =>
  on ? "border-rose-400 focus:ring-rose-500/60 focus:border-rose-400" : "";

const Step1Objectives: React.FC<Step1Props> = ({
  formData,
  onUpdate,
  errors,
}) => {
  const { t } = useTranslation();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    onUpdate({ [e.target.name]: e.target.value } as Partial<DietFormData>);
  };

  const showWeightWarning =
    Number(formData.currentWeight) === Number(formData.targetWeight) &&
    formData.goal !== "maintenance";

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          {t("diet_generator.goals.title")}
        </h3>
        <p className="mt-0.5 text-sm text-slate-500">
          {t("diet_generator.goals.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label htmlFor="goal" className="input-label">
            {t("diet_generator.goals.primary_goal")}
          </label>
          <select
            id="goal"
            name="goal"
            value={formData.goal}
            onChange={handleChange}
            className="input-field"
          >
            <option value="weight_loss">
              {t("profile.goals.weight_loss")}
            </option>
            <option value="muscle_gain">
              {t("profile.goals.weight_gain")}
            </option>
            <option value="weight_gain">
              {t(
                "diet_generator.goals.primary_goal_weight_gain",
                "Ganho de Peso",
              )}
            </option>
            <option value="maintenance">
              {t("profile.goals.maintenance")}
            </option>
          </select>
        </div>
        <div>
          <label htmlFor="currentWeight" className="input-label">
            {t("diet_generator.goals.current_weight", "Peso Atual (kg)")}
          </label>
          <input
            type="number"
            name="currentWeight"
            id="currentWeight"
            value={formData.currentWeight}
            onChange={handleChange}
            className={`input-field ${errBorder(errors.currentWeight)}`}
          />
          {errors.currentWeight && (
            <p className="mt-1.5 text-xs font-medium text-rose-600">
              {errors.currentWeight}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="targetWeight" className="input-label">
            {t("diet_generator.goals.target_weight", "Peso Meta (kg)")}
          </label>
          <input
            type="number"
            name="targetWeight"
            id="targetWeight"
            value={formData.targetWeight}
            onChange={handleChange}
            className={`input-field ${errBorder(errors.targetWeight)}`}
          />
          {errors.targetWeight && (
            <p className="mt-1.5 text-xs font-medium text-rose-600">
              {errors.targetWeight}
            </p>
          )}
          {showWeightWarning && (
            <p className="mt-1.5 text-xs text-amber-600">
              {t("diet_generator.goals.weight_warning")}
            </p>
          )}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="deadlineWeeks" className="input-label">
            {t("diet_generator.goals.deadline")}
          </label>
          <input
            type="number"
            name="deadlineWeeks"
            id="deadlineWeeks"
            value={formData.deadlineWeeks}
            onChange={handleChange}
            className={`input-field ${errBorder(errors.deadlineWeeks)}`}
          />
          {errors.deadlineWeeks && (
            <p className="mt-1.5 text-xs font-medium text-rose-600">
              {errors.deadlineWeeks}
            </p>
          )}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="activityLevel" className="input-label">
            {t("diet_generator.goals.activity_level")}
          </label>
          <select
            id="activityLevel"
            name="activityLevel"
            value={formData.activityLevel}
            onChange={handleChange}
            className="input-field"
          >
            <option value="sedentary">
              {t("metabolic.activity_sedentary")}
            </option>
            <option value="lightly_active">
              {t("metabolic.activity_lightly")}
            </option>
            <option value="moderately_active">
              {t("metabolic.activity_moderately")}
            </option>
            <option value="very_active">{t("metabolic.activity_very")}</option>
            <option value="extremely_active">
              {t("metabolic.activity_extremely")}
            </option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="specialObservations" className="input-label">
            {t("diet_generator.goals.special_observations")}
          </label>
          <textarea
            name="specialObservations"
            id="specialObservations"
            value={formData.specialObservations}
            onChange={handleChange}
            rows={4}
            className="input-field resize-none"
            placeholder={t("diet_generator.goals.special_obs_placeholder")}
          />
        </div>
      </div>
    </div>
  );
};

export default Step1Objectives;
