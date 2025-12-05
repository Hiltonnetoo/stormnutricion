import React from 'react';

interface Step1Props {
    formData: any;
    onUpdate: (data: any) => void;
    patientData: any;
    errors: Record<string, string>;
}

const Step1Objectives: React.FC<Step1Props> = ({ formData, onUpdate, patientData, errors }) => {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        onUpdate({ [e.target.name]: e.target.value });
    };

    const showWeightWarning = parseFloat(formData.currentWeight) === parseFloat(formData.targetWeight) && formData.goal !== 'maintenance';
    
    return (
        <div className="space-y-6 animate-fade-in">
             <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Definição de Metas</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Comece definindo o objetivo principal e as metas de peso para o paciente.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <label htmlFor="goal" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Objetivo Principal</label>
                    <select id="goal" name="goal" value={formData.goal} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-sage-500 focus:ring-sage-500">
                        <option value="weight_loss">Perda de Peso</option>
                        <option value="muscle_gain">Ganho de Massa Muscular</option>
                        <option value="weight_gain">Ganho de Peso</option>
                        <option value="maintenance">Manutenção de Peso</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="currentWeight" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Peso Atual (kg)</label>
                    <input type="number" name="currentWeight" id="currentWeight" value={formData.currentWeight} onChange={handleChange} className={`mt-1 block w-full rounded-md shadow-sm ${errors.currentWeight ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white focus:border-sage-500 focus:ring-sage-500`} />
                     {errors.currentWeight && <p className="mt-1 text-sm text-red-600">{errors.currentWeight}</p>}
                </div>

                <div>
                    <label htmlFor="targetWeight" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Peso Meta (kg)</label>
                    <input type="number" name="targetWeight" id="targetWeight" value={formData.targetWeight} onChange={handleChange} className={`mt-1 block w-full rounded-md shadow-sm ${errors.targetWeight ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white focus:border-sage-500 focus:ring-sage-500`} />
                     {errors.targetWeight && <p className="mt-1 text-sm text-red-600">{errors.targetWeight}</p>}
                     {showWeightWarning && (
                        <p className="mt-1 text-sm text-yellow-600 dark:text-yellow-400">
                            Aviso: O peso meta é igual ao atual. Considere mudar o objetivo para "Manutenção de Peso".
                        </p>
                    )}
                </div>

                <div className="sm:col-span-2">
                    <label htmlFor="deadlineWeeks" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Prazo para atingir meta (semanas)</label>
                    <input type="number" name="deadlineWeeks" id="deadlineWeeks" value={formData.deadlineWeeks} onChange={handleChange} className={`mt-1 block w-full rounded-md shadow-sm ${errors.deadlineWeeks ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white focus:border-sage-500 focus:ring-sage-500`} />
                    {errors.deadlineWeeks && <p className="mt-1 text-sm text-red-600">{errors.deadlineWeeks}</p>}
                </div>

                <div className="sm:col-span-2">
                    <label htmlFor="activityLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nível de Atividade Física</label>
                    <select id="activityLevel" name="activityLevel" value={formData.activityLevel} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-sage-500 focus:ring-sage-500">
                        <option value="sedentary">Sedentário (pouco ou nenhum exercício)</option>
                        <option value="lightly_active">Levemente Ativo (exercício leve 1-3 dias/semana)</option>
                        <option value="moderately_active">Moderadamente Ativo (exercício moderado 3-5 dias/semana)</option>
                        <option value="very_active">Muito Ativo (exercício intenso 6-7 dias/semana)</option>
                        <option value="extremely_active">Extremamente Ativo (exercício muito intenso e trabalho físico)</option>
                    </select>
                </div>
                
                <div className="sm:col-span-2">
                     <label htmlFor="specialObservations" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Observações Especiais</label>
                     <textarea name="specialObservations" id="specialObservations" value={formData.specialObservations} onChange={handleChange} rows={4} className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-sage-500 focus:ring-sage-500" placeholder="Ex: intolerância à lactose, vegetariano, alergia a nozes..."></textarea>
                </div>
            </div>
        </div>
    );
};

export default Step1Objectives;