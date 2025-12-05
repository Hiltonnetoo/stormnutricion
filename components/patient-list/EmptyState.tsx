import React from 'react';
import { UsersIcon, PlusIcon } from '../icons';

interface EmptyStateProps {
    onAddPatient: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onAddPatient }) => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="relative mb-6">
            <div className="absolute inset-0 bg-sage-100 rounded-full blur-xl opacity-50 animate-pulse-soft"></div>
            <div className="relative p-6 bg-gradient-to-br from-sage-50 to-teal-50 rounded-full border-2 border-dashed border-sage-200">
                <UsersIcon className="w-12 h-12 text-sage-400" />
            </div>
        </div>
        <h3 className="text-xl font-bold text-slate-800">Nenhum paciente cadastrado</h3>
        <p className="mt-2 text-sm text-slate-500 max-w-sm">
            Comece sua jornada adicionando o primeiro paciente. E rapido e facil!
        </p>
        <button
            onClick={onAddPatient}
            type="button"
            className="mt-6 inline-flex items-center px-6 py-3 border border-transparent shadow-lg shadow-sage-500/20 text-sm font-bold rounded-xl text-white bg-sage-600 hover:bg-sage-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-500 transition-all hover:-translate-y-0.5"
        >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Cadastrar Primeiro Paciente
        </button>
        <div className="mt-8 flex items-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-sage-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Dados seguros</span>
            </div>
            <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-sage-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Cadastro em 2 min</span>
            </div>
        </div>
    </div>
);

export default EmptyState;
