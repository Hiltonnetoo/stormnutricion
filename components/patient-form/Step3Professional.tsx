import React from 'react';
import type { Patient } from '../../types';

interface Step3Props {
    data: Partial<Patient>;
    onDataChange: (data: Partial<Patient>) => void;
    errors: Record<string, string>;
}

const Step3Professional: React.FC<Step3Props> = ({ data, onDataChange, errors }) => {
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        onDataChange({ [e.target.name]: e.target.value });
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Dados Profissionais e Atividade Física</h3>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <label htmlFor="profession" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Profissão</label>
                    <input type="text" name="profession" id="profession" value={data.profession || ''} onChange={handleChange} className={`mt-1 block w-full rounded-md shadow-sm ${errors.profession ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white focus:border-sage-500 focus:ring-sage-500`} />
                    {errors.profession && <p className="mt-2 text-sm text-red-600">{errors.profession}</p>}
                </div>

                <div className="sm:col-span-2">
                    <label htmlFor="activityLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nível de Atividade Física (diário)</label>
                    <select id="activityLevel" name="activityLevel" value={data.activityLevel || 'moderately_active'} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-sage-500 focus:ring-sage-500">
                        <option value="sedentary">Sedentário (pouco ou nenhum exercício)</option>
                        <option value="lightly_active">Levemente Ativo (exercício leve 1-3 dias/semana)</option>
                        <option value="moderately_active">Moderadamente Ativo (exercício moderado 3-5 dias/semana)</option>
                        <option value="very_active">Muito Ativo (exercício intenso 6-7 dias/semana)</option>
                        <option value="extremely_active">Extremamente Ativo (exercício muito intenso e trabalho físico)</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default Step3Professional;