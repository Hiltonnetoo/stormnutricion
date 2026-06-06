import React from "react";

interface DietProgressBarProps {
  currentStep: number;
  goToStep: (step: number) => void;
  completedSteps: boolean[];
}

const steps = [
  { number: 1, title: "Objetivos" },
  { number: 2, title: "Nutrição" },
  { number: 3, title: "Plano" },
];

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const DietProgressBar: React.FC<DietProgressBarProps> = ({ currentStep, goToStep, completedSteps }) => (
  <nav aria-label="Progress" className="w-full max-w-sm mx-auto">
    <ol className="flex items-center">
      {steps.map((step, stepIdx) => {
        const isCompleted = step.number < currentStep;
        const isActive = step.number === currentStep;
        const canNavigate = completedSteps[step.number - 1] || isCompleted;
        return (
          <li key={step.title} className="relative flex-1">
            {stepIdx < steps.length - 1 && (
              <div className={`absolute left-1/2 top-4 h-0.5 w-full ${isCompleted ? "bg-sage-500" : "bg-slate-200 dark:bg-slate-700"}`} aria-hidden="true" />
            )}
            <button
              onClick={() => canNavigate && goToStep(step.number)}
              disabled={!canNavigate}
              className={`relative z-10 flex flex-col items-center justify-center w-full ${canNavigate ? "cursor-pointer" : "cursor-default"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? "bg-sage-600 text-white shadow-md shadow-sage-600/25"
                    : isActive
                      ? "border-2 border-sage-500 bg-white dark:bg-slate-800"
                      : "border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                }`}
              >
                {isCompleted ? (
                  <CheckIcon className="w-4 h-4" />
                ) : isActive ? (
                  <>
                    <span className="absolute h-5 w-5 rounded-full bg-sage-200 animate-ping" aria-hidden="true" />
                    <span className="relative h-2.5 w-2.5 bg-sage-500 rounded-full" aria-hidden="true" />
                  </>
                ) : (
                  <span className="text-slate-400 text-sm font-semibold">{step.number}</span>
                )}
              </div>
              <p className={`mt-2 text-xs text-center font-semibold transition-colors ${isActive ? "text-sage-600 dark:text-sage-300" : "text-slate-400"}`}>{step.title}</p>
            </button>
          </li>
        );
      })}
    </ol>
  </nav>
);

export default DietProgressBar;
