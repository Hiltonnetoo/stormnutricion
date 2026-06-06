import React from "react";
import type { Patient, DietMode, ClinicalTag } from "../../types";
import ModeSelector from "../diet-generator/ModeSelector";
import ClinicalTagSelector from "../diet-generator/ClinicalTagSelector";

interface Step4Props {
  data: Partial<Patient>;
  onDataChange: (data: Partial<Patient>) => void;
  errors: Record<string, string>;
}

export const dietaryOptionsMap: Record<string, string> = {
  diabetes: "Diabetes",
  hypertension: "Hipertensão",
  gluten_free: "Sem Glúten",
  lactose_free: "Sem Lactose",
  vegetarian: "Vegetariano",
  vegan: "Vegano",
};

const dietaryOptions = [
  { id: "diabetes", label: "Diabetes" },
  { id: "hypertension", label: "Hipertensão" },
  { id: "gluten_free", label: "Sem Glúten" },
  { id: "lactose_free", label: "Sem Lactose" },
  { id: "vegetarian", label: "Vegetariano" },
  { id: "vegan", label: "Vegano" },
];

const goalOptions = [
  { id: "weight_loss", label: "Perda de Peso" },
  { id: "weight_gain", label: "Ganho de Peso" },
  { id: "maintenance", label: "Manutenção" },
  { id: "clinical_control", label: "Controle Clínico" },
  { id: "performance", label: "Performance Esportiva" },
];

const Step4Nutritional: React.FC<Step4Props> = ({ data, onDataChange }) => {
  const handleModeChange = (mode: DietMode) => onDataChange({ mode });

  const handleTagToggle = (tag: ClinicalTag) => {
    const current = data.clinicalTags || [];
    const next = current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag];
    onDataChange({ clinicalTags: next });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    onDataChange({ [e.target.name]: e.target.value });
  };

  const handleRestrictionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    const current = data.dietaryRestrictions || [];
    onDataChange({ dietaryRestrictions: checked ? [...current, value] : current.filter((i) => i !== value) });
  };

  return (
    <div className="space-y-7 animate-fade-in">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Acompanhamento e Objetivos</h3>
        <p className="mt-0.5 text-sm text-slate-500">Defina o perfil clínico e as metas do paciente.</p>
      </div>

      <div>
        <label className="input-label mb-3">Modo de Atendimento</label>
        <ModeSelector selectedMode={data.mode || "general"} onSelect={handleModeChange} />
      </div>

      {data.mode === "clinical" && (
        <ClinicalTagSelector selectedTags={data.clinicalTags || []} onToggle={handleTagToggle} />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="nutritionalGoal" className="input-label">Objetivo Nutricional</label>
          <select id="nutritionalGoal" name="nutritionalGoal" value={data.nutritionalGoal || "maintenance"} onChange={handleInputChange} className="input-field">
            {goalOptions.map((opt) => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="consultationMode" className="input-label">Modalidade da Consulta</label>
          <select id="consultationMode" name="consultationMode" value={data.consultationMode || "presencial"} onChange={handleInputChange} className="input-field">
            <option value="presencial">Presencial (na clínica)</option>
            <option value="remoto">Remoto (online)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label htmlFor="medications" className="input-label">Medicamentos em uso</label>
          <textarea id="medications" name="medications" rows={2} value={data.medications || ""} onChange={handleInputChange} className="input-field resize-none" placeholder="Liste medicamentos que o paciente utiliza regularmente..." />
        </div>
        <div>
          <label htmlFor="familyHistory" className="input-label">Histórico Familiar</label>
          <textarea id="familyHistory" name="familyHistory" rows={2} value={data.familyHistory || ""} onChange={handleInputChange} className="input-field resize-none" placeholder="Ex: Pai diabético, Mãe hipertensa..." />
        </div>
      </div>

      <hr className="border-slate-100 dark:border-slate-800" />

      <h3 className="text-base font-bold text-slate-900 dark:text-white">Hábitos Alimentares</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="input-label">Número de refeições por dia</label>
          <input type="range" min="1" max="6" step="1" value={data.mealsPerDay || 4} onChange={(e) => onDataChange({ mealsPerDay: parseInt(e.target.value, 10) })} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sage-600 dark:bg-slate-700 mt-2" />
          <p className="text-center font-semibold text-sage-600 dark:text-sage-300 mt-1">{data.mealsPerDay} refeições</p>
        </div>
        <div>
          <label htmlFor="hydrationLevel" className="input-label">Consumo de água</label>
          <select id="hydrationLevel" name="hydrationLevel" value={data.hydrationLevel || "moderate"} onChange={handleInputChange} className="input-field">
            <option value="low">Baixo (menos de 1L/dia)</option>
            <option value="moderate">Moderado (1-2L/dia)</option>
            <option value="high">Alto (mais de 2L/dia)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="input-label">Restrições ou preferências</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-1">
          {dietaryOptions.map((option) => {
            const checked = (data.dietaryRestrictions || []).includes(option.id);
            return (
              <label key={option.id} htmlFor={option.id} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${checked ? "border-sage-400 bg-sage-50 dark:bg-sage-900/20" : "border-slate-200 dark:border-slate-700 hover:border-slate-300"}`}>
                <input id={option.id} name="dietaryRestrictions" type="checkbox" value={option.id} checked={checked} onChange={handleRestrictionsChange} className="h-4 w-4 rounded border-slate-300 text-sage-600 focus:ring-sage-500 accent-sage-600" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{option.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <label htmlFor="foodAllergies" className="input-label">Alergias Alimentares</label>
        <textarea id="foodAllergies" name="foodAllergies" rows={2} value={data.foodAllergies || ""} onChange={(e) => onDataChange({ foodAllergies: e.target.value })} className="input-field resize-none" placeholder="Ex: amendoim, frutos do mar, etc." />
      </div>
    </div>
  );
};

export default Step4Nutritional;
