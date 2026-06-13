import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { LabTest, DietMode, ClinicalTag } from "../../types";

interface Props {
  mode: DietMode;
  clinicalTags?: ClinicalTag[];
  exams: LabTest[];
  onUpdate: (exams: LabTest[]) => void;
}

const suggestionsByMode: Record<DietMode, { name: string; unit: string }[]> = {
  general: [
    { name: "Glicemia de Jejum", unit: "mg/dL" },
    { name: "Colesterol Total", unit: "mg/dL" },
    { name: "Triglicerídeos", unit: "mg/dL" },
  ],
  clinical: [
    { name: "Creatinina", unit: "mg/dL" },
    { name: "Ureia", unit: "mg/dL" },
    { name: "Sódio", unit: "mEq/L" },
    { name: "Potássio", unit: "mEq/L" },
  ],
  performance: [
    { name: "Testosterona Total", unit: "ng/dL" },
    { name: "Cortisol", unit: "mcg/dL" },
    { name: "Vitamina D", unit: "ng/mL" },
    { name: "Creatina Quinase (CK)", unit: "U/L" },
  ],
  pediatric: [
    { name: "Hemograma Completo", unit: "-" },
    { name: "Ferro Sérico", unit: "mcg/dL" },
    { name: "Ferritina", unit: "ng/mL" },
  ],
  recovery: [
    { name: "Proteína C Reativa (PCR)", unit: "mg/L" },
    { name: "Albumina", unit: "g/dL" },
    { name: "Cálcio Iônico", unit: "mg/dL" },
  ],
};

const suggestionsByTag: Partial<
  Record<ClinicalTag, { name: string; unit: string }[]>
> = {
  diabetes_t1: [
    { name: "Peptídeo C", unit: "ng/mL" },
    { name: "Anticorpos Anti-Ilhota", unit: "-" },
  ],
  diabetes_t2: [
    { name: "Hemoglobina Glicada", unit: "%" },
    { name: "Insulina de Jejum", unit: "uUI/mL" },
  ],
  hypertension: [
    { name: "Microalbuminúria", unit: "mg/24h" },
    { name: "Ácido Úrico", unit: "mg/dL" },
  ],
  renal_ckd: [
    { name: "Taxa de Filtração Glomerular", unit: "mL/min" },
    { name: "Fósforo", unit: "mg/dL" },
  ],
  hepatic_steatosis: [
    { name: "TGO/AST", unit: "U/L" },
    { name: "TGP/ALT", unit: "U/L" },
    { name: "Gama-GT", unit: "U/L" },
  ],
  dyslipidemia: [
    { name: "LDL-Colesterol", unit: "mg/dL" },
    { name: "HDL-Colesterol", unit: "mg/dL" },
    { name: "VLDL-Colesterol", unit: "mg/dL" },
  ],
};

const translateExamName = (name: string, t: TFunction) => {
  const normalized = name.toLowerCase().trim();
  const keys: Record<string, string> = {
    "glicemia de jejum": "exams.glucose",
    "colesterol total": "exams.total_cholesterol",
    triglicerídeos: "exams.triglycerides",
    creatinina: "exams.creatinine",
    ureia: "exams.urea",
    sódio: "exams.sodium",
    potássio: "exams.potassium",
    "testosterona total": "exams.testosterone",
    cortisol: "exams.cortisol",
    "vitamina d": "exams.vitamin_d",
    "creatina quinase (ck)": "exams.ck",
    "hemograma completo": "exams.hemogram",
    "ferro sérico": "exams.serum_iron",
    ferritina: "exams.ferritin",
    "proteína c reativa (pcr)": "exams.crp",
    albumina: "exams.albumin",
    "cálcio iônico": "exams.ionized_calcium",
    "peptídeo c": "exams.c_peptide",
    "anticorpos anti-ilhota": "exams.islet_antibodies",
    "hemoglobina glicada": "exams.hba1c",
    "insulina de jejum": "exams.fasting_insulin",
    microalbuminúria: "exams.microalbuminuria",
    "ácido úrico": "exams.uric_acid",
    "taxa de filtração glomerular": "exams.gfr",
    fósforo: "exams.phosphorus",
    "tgo/ast": "exams.ast",
    "tgp/alt": "exams.alt",
    "gama-gt": "exams.ggt",
    "ldl-colesterol": "exams.ldl",
    "hdl-colesterol": "exams.hdl",
    "vldl-colesterol": "exams.vldl",
  };
  const key = keys[normalized];
  return key ? t(key) : name;
};

const LabExamsModule: React.FC<Props> = ({
  mode,
  clinicalTags = [],
  exams,
  onUpdate,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const addExam = (name: string, unit: string) =>
    onUpdate([...exams, { name, unit, value: "" }]);
  const handleValueChange = (index: number, value: string) => {
    const newExams = [...exams];
    newExams[index].value = value;
    onUpdate(newExams);
  };
  const removeExam = (index: number) =>
    onUpdate(exams.filter((_, i) => i !== index));

  const suggestions = [
    ...(suggestionsByMode[mode] || []),
    ...clinicalTags.flatMap((tag) => suggestionsByTag[tag] || []),
  ].filter((v, i, a) => a.findIndex((t) => t.name === v.name) === i);

  return (
    <div className="bg-white dark:bg-slate-855 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-soft transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="bg-sky-100 dark:bg-sky-900/30 p-2 rounded-lg">
            <svg
              className="w-5 h-5 text-sky-600 dark:text-sky-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">
              {t("exams_module.title")}
            </h3>
            <p className="text-xs text-slate-500">
              {exams.length > 0
                ? exams.length === 1
                  ? t("exams_module.filled_count_one")
                  : t("exams_module.filled_count_other", {
                      count: exams.length,
                    })
                : t("exams_module.none_added")}
            </p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
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
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 space-y-5">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              {t("exams_module.profile_suggestions")}
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s.name}
                  onClick={() => addExam(s.name, s.unit)}
                  disabled={exams.some((e) => e.name === s.name)}
                  className="text-xs px-3 py-1.5 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 rounded-full border border-sky-100 dark:border-sky-800 hover:bg-sky-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  + {translateExamName(s.name, t)}
                </button>
              ))}
            </div>
          </div>

          {exams.length > 0 ? (
            <div className="space-y-2.5">
              {exams.map((exam, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-700"
                >
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-500 mb-1">
                      {translateExamName(exam.name, t) ||
                        t("exams_module.custom_exam")}
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={exam.value}
                        onChange={(e) => handleValueChange(idx, e.target.value)}
                        placeholder={t("exams_module.value_placeholder")}
                        className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-1.5 focus:ring-2 focus:ring-sage-500/60 focus:border-sage-400 outline-none"
                      />
                      <span className="text-xs font-medium text-slate-400 w-16">
                        {exam.unit}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeExam(idx)}
                    className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-xl">
              <p className="text-sm text-slate-400">
                {t("exams_module.empty_desc")}
              </p>
              <button
                onClick={() => addExam("", "")}
                className="mt-3 text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline"
              >
                {t("exams_module.add_custom_btn")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LabExamsModule;
