import React from "react";
import type { DietFormData } from "./dietForm.types";

interface Step1Props {
  formData: DietFormData;
  onUpdate: (data: Partial<DietFormData>) => void;
  patientData?: unknown;
  errors: Record<string, string>;
}

const errBorder = (on?: string) => (on ? "border-rose-400 focus:ring-rose-500/60 focus:border-rose-400" : "");

const Step1Objectives: React.FC<Step1Props> = ({ formData, onUpdate, errors }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    onUpdate({ [e.target.name]: e.target.value } as Partial<DietFormData>);
  };

  const showWeightWarning =
    Number(formData.currentWeight) === Number(formData.targetWeight) && formData.goal !== "maintenance";

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Definição de Metas</h3>
        <p className="mt-0.5 text-sm text-slate-500">Comece definindo o objetivo principal e as metas de peso para o paciente.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label htmlFor="goal" className="input-label">Objetivo Principal</label>
          <select id="goal" name="goal" value={formData.goal} onChange={handleChange} className="input-field">
            <option value="weight_loss">Perda de Peso</option>
            <option value="muscle_gain">Ganho de Massa Muscular</option>
            <option value="weight_gain">Ganho de Peso</option>
            <option value="maintenance">Manutenção de Peso</option>
          </select>
        </div>
        <div>
          <label htmlFor="currentWeight" className="input-label">Peso Atual (kg)</label>
          <input type="number" name="currentWeight" id="currentWeight" value={formData.currentWeight} onChange={handleChange} className={`input-field ${errBorder(errors.currentWeight)}`} />
          {errors.currentWeight && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.currentWeight}</p>}
        </div>
        <div>
          <label htmlFor="targetWeight" className="input-label">Peso Meta (kg)</label>
          <input type="number" name="targetWeight" id="targetWeight" value={formData.targetWeight} onChange={handleChange} className={`input-field ${errBorder(errors.targetWeight)}`} />
          {errors.targetWeight && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.targetWeight}</p>}
          {showWeightWarning && <p className="mt-1.5 text-xs text-amber-600">Aviso: O peso meta é igual ao atual. Considere mudar o objetivo para "Manutenção de Peso".</p>}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="deadlineWeeks" className="input-label">Prazo para atingir meta (semanas)</label>
          <input type="number" name="deadlineWeeks" id="deadlineWeeks" value={formData.deadlineWeeks} onChange={handleChange} className={`input-field ${errBorder(errors.deadlineWeeks)}`} />
          {errors.deadlineWeeks && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.deadlineWeeks}</p>}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="activityLevel" className="input-label">Nível de Atividade Física</label>
          <select id="activityLevel" name="activityLevel" value={formData.activityLevel} onChange={handleChange} className="input-field">
            <option value="sedentary">Sedentário (pouco ou nenhum exercício)</option>
            <option value="lightly_active">Levemente Ativo (exercício leve 1-3 dias/semana)</option>
            <option value="moderately_active">Moderadamente Ativo (exercício moderado 3-5 dias/semana)</option>
            <option value="very_active">Muito Ativo (exercício intenso 6-7 dias/semana)</option>
            <option value="extremely_active">Extremamente Ativo (exercício muito intenso e trabalho físico)</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="specialObservations" className="input-label">Observações Especiais</label>
          <textarea name="specialObservations" id="specialObservations" value={formData.specialObservations} onChange={handleChange} rows={4} className="input-field resize-none" placeholder="Ex: intolerância à lactose, vegetariano, alergia a nozes..." />
        </div>
      </div>
    </div>
  );
};

export default Step1Objectives;
