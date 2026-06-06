import React from "react";
import { UsersIcon, PlusIcon, ShieldIcon, ClockIcon } from "../icons";

interface EmptyStateProps {
  onAddPatient: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onAddPatient }) => (
  <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
    <div className="relative mb-6">
      <div className="absolute inset-0 bg-sage-200/50 rounded-3xl blur-2xl animate-pulse-soft" />
      <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-sage-50 to-teal-50 border border-sage-100">
        <UsersIcon className="w-9 h-9 text-sage-500" />
      </div>
    </div>
    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
      Nenhum paciente cadastrado
    </h3>
    <p className="mt-2 text-sm text-slate-500 max-w-sm">
      Comece sua jornada adicionando o primeiro paciente. É rápido e fácil!
    </p>
    <button
      onClick={onAddPatient}
      type="button"
      className="btn-primary mt-6 px-6 py-3 hover:-translate-y-0.5"
    >
      <PlusIcon className="h-5 w-5" />
      Cadastrar Primeiro Paciente
    </button>
    <div className="mt-8 flex items-center gap-6 text-xs text-slate-400">
      <span className="flex items-center gap-1.5">
        <ShieldIcon className="w-4 h-4 text-sage-400" />
        Dados seguros
      </span>
      <span className="flex items-center gap-1.5">
        <ClockIcon className="w-4 h-4 text-sage-400" />
        Cadastro em 2 min
      </span>
    </div>
  </div>
);

export default EmptyState;
