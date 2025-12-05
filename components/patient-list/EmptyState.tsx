import React from 'react';
import { UsersIcon, PlusIcon } from '../icons';

interface EmptyStateProps {
    onAddPatient: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onAddPatient }) => (
    <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
        <UsersIcon className="w-16 h-16 text-gray-400 dark:text-gray-500" />
        <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-white">Nenhum paciente cadastrado</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Comece adicionando o seu primeiro paciente para gerenciar.</p>
        <button
            onClick={onAddPatient}
            type="button"
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sage-500 hover:bg-sage-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-500"
        >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Cadastrar Primeiro Paciente
        </button>
    </div>
);

export default EmptyState;
