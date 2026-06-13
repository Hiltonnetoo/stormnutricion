import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Patient, LabTest } from "../../types";
import { labCategories, interpretTest } from "../../data/labTests";

interface Step6Props {
  data: Partial<Patient>;
  onDataChange: (data: Partial<Patient>) => void;
}

const Step6LabExams: React.FC<Step6Props> = ({ data, onDataChange }) => {
  const { t } = useTranslation();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(
    "lipid",
  );

  const handleTestChange = (
    categoryName: string,
    testName: string,
    value: string,
  ) => {
    const currentExams = data.lastLabExams || [];
    const existingExamIndex = currentExams.findIndex(
      (e) => e.name === testName,
    );
    const newExam: LabTest = {
      name: testName,
      value,
      unit:
        labCategories
          .find((c) => c.id === categoryName)
          ?.tests.find((t) => t.name === testName)?.unit || "",
      date: new Date().toISOString().split("T")[0],
      category: categoryName,
      status: interpretTest(testName, value),
    };
    let updatedExams;
    if (value === "")
      updatedExams = currentExams.filter((e) => e.name !== testName);
    else if (existingExamIndex >= 0) {
      updatedExams = [...currentExams];
      updatedExams[existingExamIndex] = newExam;
    } else updatedExams = [...currentExams, newExam];
    onDataChange({ lastLabExams: updatedExams });
  };

  const getTestValue = (name: string) =>
    (data.lastLabExams || []).find((e) => e.name === name)?.value ?? "";

  const getStatusIcon = (name: string, value: string) => {
    if (!value) return null;
    return interpretTest(name, value) === "alert" ? (
      <span
        title={t("patient_form.exams.status_alert")}
        className="text-rose-500"
      >
        ⚠️
      </span>
    ) : (
      <span
        title={t("patient_form.exams.status_normal")}
        className="text-emerald-500"
      >
        ✅
      </span>
    );
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          {t("patient_form.exams.title")}
        </h3>
        <p className="mt-0.5 text-sm text-slate-500">
          {t("patient_form.exams.subtitle")}
        </p>
      </div>

      <div className="space-y-3">
        {labCategories.map((category) => {
          const isOpen = expandedCategory === category.id;
          const count = (data.lastLabExams || []).filter(
            (e) => e.category === category.name,
          ).length;
          return (
            <div
              key={category.id}
              className={`border rounded-2xl overflow-hidden transition-all ${isOpen ? "border-sage-400 ring-1 ring-sage-300/50" : "border-slate-200 dark:border-slate-700 hover:border-sage-300"}`}
            >
              <button
                onClick={() => setExpandedCategory(isOpen ? null : category.id)}
                className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-850 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{category.icon}</span>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">
                      {category.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 uppercase tracking-widest">
                      {t("patient_form.exams.exams_count", { count })}
                    </p>
                  </div>
                </div>
                <svg
                  className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {isOpen && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {category.tests.map((test) => (
                      <div
                        key={test.name}
                        className="flex flex-col gap-1 group"
                      >
                        <div className="flex justify-between items-center px-1">
                          <label
                            className="text-[9px] font-bold text-slate-500 uppercase truncate"
                            title={test.name}
                          >
                            {test.name}
                          </label>
                          {getStatusIcon(test.name, getTestValue(test.name))}
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            value={getTestValue(test.name)}
                            onChange={(e) =>
                              handleTestChange(
                                category.name,
                                test.name,
                                e.target.value,
                              )
                            }
                            className="w-full h-9 px-2.5 text-xs font-bold border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-sage-500/60 focus:border-sage-400 outline-none transition-all"
                            placeholder="-"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-bold text-slate-300 pointer-events-none">
                            {test.unit}
                          </span>
                        </div>
                        <p className="text-[8px] text-slate-400 px-1 truncate">
                          {test.min && test.max
                            ? `${test.min}-${test.max}`
                            : test.max
                              ? `< ${test.max}`
                              : test.min
                                ? `> ${test.min}`
                                : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-sky-50 dark:bg-sky-900/20 rounded-xl border border-sky-100 dark:border-sky-800 flex gap-3">
        <span className="text-sky-500 text-xl">ℹ️</span>
        <p className="text-xs text-sky-700 dark:text-sky-300">
          {t("patient_form.exams.info_tip")}
        </p>
      </div>
    </div>
  );
};

export default Step6LabExams;
