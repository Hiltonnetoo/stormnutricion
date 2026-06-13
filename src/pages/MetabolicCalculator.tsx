import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  calculateBMR,
  calculateTDEE,
  calculateBMI,
  getBMICategory,
  Gender,
  ActivityLevel,
} from "../services/metabolicCalculations";
import { PageHeader, Card, Button } from "../components/ui";
import { BarChart3Icon } from "../components/icons";

const fieldClass =
  "w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl px-3.5 py-2.5 text-sm shadow-xs focus:ring-2 focus:ring-sage-500/60 focus:border-sage-400 focus:outline-none transition-all";

const MetabolicCalculator: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    gender: "female" as Gender,
    age: "30",
    weight: "60",
    height: "165",
    activityLevel: "moderately_active" as ActivityLevel,
  });
  const [results, setResults] = useState<{
    bmr: number;
    tdee: number;
    bmi: number;
    bmiCategory: string;
  } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const parsedData = useMemo(
    () => ({
      gender: formData.gender,
      age: parseInt(formData.age) || 0,
      weight: parseFloat(formData.weight) || 0,
      height: parseFloat(formData.height) || 0,
      activityLevel: formData.activityLevel,
    }),
    [formData],
  );

  const calculateMacros = (e: React.FormEvent) => {
    e.preventDefault();
    const { gender, age, weight, height, activityLevel } = parsedData;
    if (age > 0 && weight > 0 && height > 0) {
      const bmr = calculateBMR({ gender, age, weight, height });
      const tdee = calculateTDEE({
        gender,
        age,
        weight,
        height,
        activityLevel,
      });
      const bmi = calculateBMI(weight, height);
      const bmiCategory = getBMICategory(bmi);
      setResults({ bmr, tdee, bmi, bmiCategory });
    } else {
      setResults(null);
    }
  };

  return (
    <div className="p-5 sm:p-6 lg:p-8 max-w-5xl mx-auto animate-fade-in">
      <PageHeader
        icon={<BarChart3Icon className="w-6 h-6" />}
        title={t("metabolic.title")}
        subtitle={t("metabolic.subtitle")}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form */}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            {t("metabolic.form_title")}
          </h2>
          <form onSubmit={calculateMacros} className="space-y-4">
            <div>
              <label className="input-label">
                {t("metabolic.gender_label")}
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={fieldClass}
              >
                <option value="female">{t("metabolic.gender_female")}</option>
                <option value="male">{t("metabolic.gender_male")}</option>
              </select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor="age" className="input-label">
                  {t("metabolic.age_label")}
                </label>
                <input
                  type="number"
                  name="age"
                  id="age"
                  value={formData.age}
                  onChange={handleChange}
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="weight" className="input-label">
                  {t("metabolic.weight_label")}
                </label>
                <input
                  type="number"
                  name="weight"
                  id="weight"
                  step="0.1"
                  value={formData.weight}
                  onChange={handleChange}
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="height" className="input-label">
                  {t("metabolic.height_label")}
                </label>
                <input
                  type="number"
                  name="height"
                  id="height"
                  value={formData.height}
                  onChange={handleChange}
                  className={fieldClass}
                />
              </div>
            </div>
            <div>
              <label htmlFor="activityLevel" className="input-label">
                {t("metabolic.activity_label")}
              </label>
              <select
                id="activityLevel"
                name="activityLevel"
                value={formData.activityLevel}
                onChange={handleChange}
                className={fieldClass}
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
                <option value="very_active">
                  {t("metabolic.activity_very")}
                </option>
                <option value="extremely_active">
                  {t("metabolic.activity_extremely")}
                </option>
              </select>
            </div>
            <Button type="submit" fullWidth>
              {t("metabolic.calculate_btn")}
            </Button>
          </form>
        </Card>

        {/* Results */}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            {t("metabolic.results_title")}
          </h2>
          {results ? (
            <div className="space-y-3">
              <div className="bg-sage-50 dark:bg-sage-900/30 p-4 rounded-xl text-center">
                <p className="text-sm font-semibold text-sage-700 dark:text-sage-300">
                  {t("metabolic.bmr_title")}
                </p>
                <p className="text-3xl font-extrabold text-sage-800 dark:text-sage-100 stat-number">
                  {results.bmr.toFixed(0)}{" "}
                  <span className="text-base font-bold">
                    {t("metabolic.kcal_day")}
                  </span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {t("metabolic.bmr_desc")}
                </p>
              </div>
              <div className="bg-sky-50 dark:bg-sky-900/30 p-4 rounded-xl text-center">
                <p className="text-sm font-semibold text-sky-700 dark:text-sky-300">
                  {t("metabolic.tdee_title")}
                </p>
                <p className="text-3xl font-extrabold text-sky-800 dark:text-sky-100 stat-number">
                  {results.tdee.toFixed(0)}{" "}
                  <span className="text-base font-bold">
                    {t("metabolic.kcal_day")}
                  </span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {t("metabolic.tdee_desc")}
                </p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/30 p-4 rounded-xl text-center">
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                  {t("metabolic.bmi_title")}
                </p>
                <p className="text-3xl font-extrabold text-amber-800 dark:text-amber-100 stat-number">
                  {results.bmi.toFixed(1)}
                </p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1">
                  {results.bmiCategory}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[240px] text-center text-slate-400">
              <p>{t("metabolic.no_results_yet")}</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default MetabolicCalculator;
