import React from "react";
import { useTranslation } from "react-i18next";
import type { Patient } from "../../types";

interface Step3Props {
  data: Partial<Patient>;
  onDataChange: (data: Partial<Patient>) => void;
  errors: Record<string, string>;
}

const Step3Professional: React.FC<Step3Props> = ({
  data,
  onDataChange,
  errors,
}) => {
  const { t } = useTranslation();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    onDataChange({ [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-5">
      <h3 className="text-base font-bold text-slate-900 dark:text-white">
        {t("patient_form.professional.title")}
      </h3>
      <div className="space-y-4">
        <div>
          <label htmlFor="profession" className="input-label">
            {t("patient_form.professional.profession")}
          </label>
          <input
            type="text"
            name="profession"
            id="profession"
            value={data.profession || ""}
            onChange={handleChange}
            className={`input-field ${errors.profession ? "border-rose-400 focus:ring-rose-500/60 focus:border-rose-400" : ""}`}
          />
          {errors.profession && (
            <p className="mt-1.5 text-xs font-medium text-rose-600">
              {errors.profession}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="activityLevel" className="input-label">
            {t("patient_form.professional.activity_level")}
          </label>
          <select
            id="activityLevel"
            name="activityLevel"
            value={data.activityLevel || "moderately_active"}
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
      </div>
    </div>
  );
};

export default Step3Professional;
