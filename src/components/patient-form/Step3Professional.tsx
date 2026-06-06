import React from "react";
import type { Patient } from "../../types";

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
    <div className="space-y-5">
      <h3 className="text-base font-bold text-slate-900 dark:text-white">Dados Profissionais e Atividade Física</h3>
      <div className="space-y-4">
        <div>
          <label htmlFor="profession" className="input-label">Profissão</label>
          <input
            type="text"
            name="profession"
            id="profession"
            value={data.profession || ""}
            onChange={handleChange}
            className={`input-field ${errors.profession ? "border-rose-400 focus:ring-rose-500/60 focus:border-rose-400" : ""}`}
          />
          {errors.profession && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.profession}</p>}
        </div>
        <div>
          <label htmlFor="activityLevel" className="input-label">Nível de Atividade Física (diário)</label>
          <select id="activityLevel" name="activityLevel" value={data.activityLevel || "moderately_active"} onChange={handleChange} className="input-field">
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
