import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  goToStep: (step: number) => void;
  isEditMode?: boolean;
}

const steps = [
    { number: 1, title: 'Pessoal' },
    { number: 2, title: 'Contato' },
    { number: 3, title: 'Profissional' },
    { number: 4, title: 'Nutricional' },
    { number: 5, title: 'Antropometria' },
    { number: 6, title: 'Resumo' },
];

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);


const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, goToStep, isEditMode = false }) => {
    return (
        <nav aria-label="Progress">
            <ol role="list" className="flex items-center">
                {steps.map((step, stepIdx) => {
                    const isCompleted = step.number < currentStep;
                    const isActive = step.number === currentStep;
                    const canNavigate = isCompleted || isEditMode;

                    return (
                        <li key={step.title} className="relative flex-1">
                             {/* Connecting line */}
                            {stepIdx < steps.length - 1 ? (
                                <div className={`absolute left-0 top-4 -ml-px h-0.5 w-full ${isCompleted ? 'bg-sage-500' : 'bg-gray-200 dark:bg-gray-700'}`} aria-hidden="true" />
                            ) : null}

                            <button
                                onClick={() => canNavigate && goToStep(step.number)}
                                disabled={!canNavigate}
                                className="relative flex flex-col items-center justify-center w-full"
                            >
                                <div className="relative z-10">
                                    {/* Circle */}
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300
                                            ${isCompleted ? 'bg-sage-500' : ''}
                                            ${isActive ? 'border-2 border-sage-500 bg-white dark:bg-gray-800' : ''}
                                            ${!isCompleted && !isActive ? 'border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 group-hover:border-gray-400' : ''}
                                        `}
                                    >
                                        {isCompleted ? (
                                            <CheckIcon className="w-5 h-5 text-white" />
                                        ) : isActive ? (
                                            <>
                                                <span className="absolute h-5 w-5 rounded-full bg-sage-200 animate-ping" aria-hidden="true" />
                                                <span className="relative h-2.5 w-2.5 bg-sage-500 rounded-full" aria-hidden="true" />
                                            </>
                                        ) : (
                                            <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{step.number}</span>
                                        )}
                                    </div>
                                </div>
                                 {/* Label */}
                                <p className={`mt-2 text-xs text-center font-medium transition-colors duration-300 ${isActive ? 'text-sage-600 dark:text-sage-300' : 'text-gray-500 dark:text-gray-400'}`}>
                                    {step.title}
                                </p>
                            </button>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default ProgressBar;