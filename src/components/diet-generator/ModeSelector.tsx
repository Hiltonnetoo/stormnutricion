import React from "react";
import { useTranslation } from "react-i18next";
import { DietMode } from "../../types";

interface ModeOption {
  id: DietMode;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  selectedBg: string;
}

const ic = (d: string) => (
  <svg
    className="w-6 h-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

const modes: ModeOption[] = [
  {
    id: "general",
    label: "Geral / Saúde",
    description: "Foco em emagrecimento, manutenção ou ganho de peso saudável.",
    icon: ic(
      "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
    ),
    color: "text-sage-600",
    selectedBg: "bg-sage-50 border-sage-300 dark:bg-sage-900/20",
  },
  {
    id: "clinical",
    label: "Acompanhamento Clínico",
    description:
      "Para pacientes com hipertensão, diabetes, insuficiência renal ou cardíaca.",
    icon: ic(
      "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 7h10v10H7z",
    ),
    color: "text-rose-600",
    selectedBg: "bg-rose-50 border-rose-300 dark:bg-rose-900/20",
  },
  {
    id: "performance",
    label: "Alta Performance",
    description:
      "Foco em nutrição esportiva, hipertrofia e rendimento atlético.",
    icon: ic("M13 10V3L4 14h7v7l9-11h-7z"),
    color: "text-sky-600",
    selectedBg: "bg-sky-50 border-sky-300 dark:bg-sky-900/20",
  },
  {
    id: "pediatric",
    label: "Nutrição Pediátrica",
    description:
      "Foco em crescimento, introdução alimentar e seletividade infantil.",
    icon: ic(
      "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    ),
    color: "text-amber-600",
    selectedBg: "bg-amber-50 border-amber-300 dark:bg-amber-900/20",
  },
  {
    id: "recovery",
    label: "Recuperação e Hipertrofia",
    description:
      "Densidade calórica para desnutrição ou ganho muscular avançado.",
    icon: ic("M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"),
    color: "text-violet-600",
    selectedBg: "bg-violet-50 border-violet-300 dark:bg-violet-900/20",
  },
];

interface Props {
  selectedMode: DietMode;
  onSelect: (mode: DietMode) => void;
}

const ModeSelector: React.FC<Props> = ({ selectedMode, onSelect }) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {modes.map((mode) => {
        const selected = selectedMode === mode.id;
        const label = t(`diet_generator.modes.${mode.id}_title`, mode.label);
        const description = t(
          `diet_generator.modes.${mode.id}_desc`,
          mode.description,
        );

        return (
          <button
            key={mode.id}
            onClick={() => onSelect(mode.id)}
            className={`relative p-5 text-left rounded-2xl border-2 transition-all duration-200 group ${
              selected
                ? `${mode.selectedBg} shadow-md`
                : "bg-white dark:bg-slate-855 border-slate-200 dark:border-slate-700 hover:border-slate-300 shadow-soft hover:shadow-card"
            }`}
          >
            <div
              className={`mb-4 p-3 rounded-xl inline-flex transition-transform duration-300 group-hover:scale-110 ${selected ? "bg-white dark:bg-slate-800" : "bg-slate-50 dark:bg-slate-900/50"} ${mode.color}`}
            >
              {mode.icon}
            </div>
            <h3
              className={`font-bold text-sm mb-1 ${selected ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"}`}
            >
              {label}
            </h3>
            <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              {description}
            </p>
            {selected && (
              <div className="absolute top-3.5 right-3.5 bg-sage-600 text-white p-1 rounded-full">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ModeSelector;
