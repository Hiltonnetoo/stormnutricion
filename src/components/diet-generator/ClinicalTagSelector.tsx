import React from "react";
import { ClinicalTag } from "../../types";

interface TagOption {
  id: ClinicalTag;
  label: string;
}

const tags: TagOption[] = [
  { id: "diabetes_t1", label: "Diabetes Tipo 1" },
  { id: "diabetes_t2", label: "Diabetes Tipo 2" },
  { id: "hypertension", label: "Hipertensão Arterial" },
  { id: "renal_ckd", label: "Doença Renal Crônica" },
  { id: "hepatic_steatosis", label: "Esteatose Hepática" },
  { id: "ibs", label: "Síndrome do Intestino Irritável" },
  { id: "obesity", label: "Obesidade" },
  { id: "dyslipidemia", label: "Dislipidemia (Colesterol/Triglic.)" },
  { id: "anemia", label: "Anemia" },
  { id: "hypothyroidism", label: "Hipotireoidismo" },
  { id: "hyperthyroidism", label: "Hipertireoidismo" },
];

interface Props {
  selectedTags: ClinicalTag[];
  onToggle: (tag: ClinicalTag) => void;
}

const ClinicalTagSelector: React.FC<Props> = ({ selectedTags, onToggle }) => (
  <div className="bg-white dark:bg-slate-850 p-6 rounded-2xl border border-rose-100 dark:border-rose-900/30 animate-fade-in shadow-soft">
    <div className="flex items-center gap-2.5 mb-3">
      <div className="bg-rose-100 dark:bg-rose-900/30 p-1.5 rounded-lg">
        <svg className="w-5 h-5 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 15c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="font-bold text-slate-800 dark:text-white text-sm">Condições Clínicas Específicas</h3>
    </div>
    <p className="text-xs text-slate-500 mb-4 italic">Selecione as condições para ativar os filtros automáticos de segurança na dieta.</p>
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const isSelected = selectedTags.includes(tag.id);
        return (
          <button
            key={tag.id}
            onClick={() => onToggle(tag.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
              isSelected
                ? "bg-rose-600 border-rose-600 text-white shadow-md"
                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-rose-300"
            }`}
          >
            {isSelected && <span className="mr-1">✓</span>}
            {tag.label}
          </button>
        );
      })}
    </div>
  </div>
);

export default ClinicalTagSelector;
