import React from 'react';
import type { Patient } from '../../types';
import { EditIcon } from '../icons';

interface Step6Props {
    data: Partial<Patient>;
    goToStep: (step: number) => void;
}

const SummaryItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 dark:text-white">{value || '-'}</dd>
    </div>
);

const Section: React.FC<{ title: string; step: number; onEdit: (step: number) => void; children: React.ReactNode }> = ({ title, step, onEdit, children }) => (
    <div className="py-4 sm:py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-2">
            <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200">{title}</h4>
            <button onClick={() => onEdit(step)} className="text-sm font-medium text-sage-600 hover:text-sage-500 flex items-center gap-1">
                <EditIcon className="w-4 h-4" />
                Editar
            </button>
        </div>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            {children}
        </dl>
    </div>
);


const Step6Summary: React.FC<Step6Props> = ({ data, goToStep }) => {
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Resumo do Cadastro</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                Por favor, revise todas as informações antes de finalizar o cadastro.
            </p>
            
            <div className="mt-5">
                <Section title="Dados Pessoais" step={1} onEdit={goToStep}>
                    <SummaryItem label="Nome Completo" value={`${data.firstName} ${data.lastName}`} />
                    <SummaryItem label="Data de Nascimento" value={data.dob} />
                    <SummaryItem label="Gênero" value={data.gender} />
                </Section>
                
                <Section title="Contato e Endereço" step={2} onEdit={goToStep}>
                    <SummaryItem label="Email" value={data.email} />
                    <SummaryItem label="Telefone" value={data.phone} />
                    <SummaryItem label="Endereço" value={`${data.address?.street}, ${data.address?.number} - ${data.address?.neighborhood}, ${data.address?.city} - ${data.address?.state}, ${data.address?.cep}`} />
                </Section>

                <Section title="Dados Profissionais e Atividade" step={3} onEdit={goToStep}>
                    <SummaryItem label="Profissão" value={data.profession} />
                    <SummaryItem label="Nível de Atividade" value={data.activityLevel?.replace(/_/g, ' ')} />
                </Section>

                <Section title="Dados Nutricionais" step={4} onEdit={goToStep}>
                    <SummaryItem label="Refeições por Dia" value={data.mealsPerDay} />
                    <SummaryItem label="Hidratação" value={data.hydrationLevel} />
                    <SummaryItem label="Restrições" value={(data.dietaryRestrictions || []).join(', ') || 'Nenhuma'} />
                    <SummaryItem label="Alergias" value={data.foodAllergies || 'Nenhuma'} />
                </Section>
                
                <Section title="Dados Antropométricos" step={5} onEdit={goToStep}>
                    <SummaryItem label="Peso" value={`${data.weight} kg`} />
                    <SummaryItem label="Altura" value={`${data.height ? (data.height / 100).toFixed(2).replace('.', ',') : '-'} m`} />
                </Section>
            </div>
        </div>
    );
};

export default Step6Summary;