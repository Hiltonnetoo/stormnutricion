import React, { useState, useEffect } from "react";
import type { Patient } from "../../types";

interface Step5Props {
  data: Partial<Patient>;
  onDataChange: (data: Partial<Patient>) => void;
  errors: Record<string, string>;
}

type OriginType = "clinical" | "remote_guided" | "self_reported" | "not_available";

const OriginSelector: React.FC<{ value: OriginType; onChange: (val: OriginType) => void; label: string }> = ({ value, onChange, label }) => {
  const options: { id: OriginType; icon: string; title: string }[] = [
    { id: "clinical", icon: "🏥", title: "Aferido na Clínica" },
    { id: "remote_guided", icon: "📱", title: "Remoto Orientado" },
    { id: "self_reported", icon: "✏️", title: "Autorrelatado" },
    { id: "not_available", icon: "⏭️", title: "Não disponível" },
  ];
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit gap-0.5">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            title={opt.title}
            className={`px-2.5 py-1.5 rounded-lg text-sm transition-all ${value === opt.id ? "bg-white dark:bg-slate-700 shadow-sm" : "opacity-50 hover:opacity-100"}`}
          >
            {opt.icon}
          </button>
        ))}
      </div>
    </div>
  );
};

const Step5Anthropometric: React.FC<Step5Props> = ({ data, onDataChange, errors }) => {
  const [displayHeight, setDisplayHeight] = useState("");

  useEffect(() => {
    if (data.height && data.height > 0) setDisplayHeight((data.height / 100).toFixed(2).replace(".", ","));
    else setDisplayHeight("");
  }, [data.height]);

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9,]/g, "");
    const parts = value.split(",");
    if (parts.length > 2) value = parts[0] + "," + parts.slice(1).join("");
    if (parts[1] && parts[1].length > 2) value = parts[0] + "," + parts[1].substring(0, 2);
    setDisplayHeight(value);
    const numericValueInMeters = parseFloat(value.replace(",", ".")) || 0;
    onDataChange({ height: Math.round(numericValueInMeters * 100) });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onDataChange({ [name]: parseFloat(value) || 0 });
  };

  const handleOriginChange = (field: keyof Patient["anthropometryMetadata"], origin: OriginType) => {
    const currentMeta = data.anthropometryMetadata || { weightOrigin: "clinical", heightOrigin: "clinical" };
    onDataChange({ anthropometryMetadata: { ...currentMeta, [field]: origin } as Patient["anthropometryMetadata"] });
  };

  return (
    <div className="space-y-7 animate-fade-in">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Dados Antropométricos</h3>
        <p className="mt-0.5 text-sm text-slate-500">Registre as medições e a confiabilidade dos dados.</p>
      </div>

      {/* Core */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 bg-sage-50/50 dark:bg-sage-900/10 rounded-2xl border border-sage-100 dark:border-sage-800">
        <div className="space-y-3">
          <div>
            <label htmlFor="weight" className="input-label">Peso Atual (kg) *</label>
            <input type="number" name="weight" id="weight" value={data.weight || ""} onChange={handleNumberChange} step="0.1" className={`input-field ${errors.weight ? "border-rose-400 focus:ring-rose-500/60" : ""}`} />
            {errors.weight && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.weight}</p>}
          </div>
          <OriginSelector label="Origem do Peso" value={data.anthropometryMetadata?.weightOrigin || "clinical"} onChange={(val) => handleOriginChange("weightOrigin", val)} />
        </div>
        <div className="space-y-3">
          <div>
            <label htmlFor="height" className="input-label">Altura (m) *</label>
            <input type="text" name="height" id="height" value={displayHeight} onChange={handleHeightChange} placeholder="Ex: 1,75" className={`input-field ${errors.height ? "border-rose-400 focus:ring-rose-500/60" : ""}`} />
            {errors.height && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.height}</p>}
          </div>
          <OriginSelector label="Origem da Altura" value={data.anthropometryMetadata?.heightOrigin || "clinical"} onChange={(val) => handleOriginChange("heightOrigin", val)} />
        </div>
      </div>

      {/* Advanced */}
      <div className="space-y-5">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Medições Clínicas Adicionais</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <label htmlFor="circumferenceAbdominal" className="input-label">Circunferência Abdominal (cm)</label>
              <input type="number" name="circumferenceAbdominal" id="circumferenceAbdominal" value={data.circumferenceAbdominal || ""} onChange={handleNumberChange} className="input-field" />
            </div>
            <OriginSelector label="Origem da Circunferência" value={data.anthropometryMetadata?.circumferenceOrigin || "not_available"} onChange={(val) => handleOriginChange("circumferenceOrigin", val)} />
          </div>
          <div className="space-y-3">
            <div>
              <label htmlFor="bodyFatPercentage" className="input-label">% de Gordura Corporal</label>
              <input type="number" name="bodyFatPercentage" id="bodyFatPercentage" value={data.bodyFatPercentage || ""} onChange={handleNumberChange} step="0.1" className="input-field" />
            </div>
            <OriginSelector label="Origem do % Gordura" value={data.anthropometryMetadata?.bodyFatOrigin || "not_available"} onChange={(val) => handleOriginChange("bodyFatOrigin", val)} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="muscleMassKg" className="input-label">Massa Muscular (kg)</label>
            <input type="number" name="muscleMassKg" id="muscleMassKg" value={data.muscleMassKg || ""} onChange={handleNumberChange} step="0.1" className="input-field" />
          </div>
          <div>
            <label htmlFor="bloodPressure" className="input-label">Pressão Arterial (mmHg)</label>
            <input type="text" name="bloodPressure" id="bloodPressure" value={data.bloodPressure || ""} onChange={(e) => onDataChange({ bloodPressure: e.target.value })} placeholder="Ex: 120/80" className="input-field" />
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="flex items-start gap-3 pt-5 border-t border-slate-100 dark:border-slate-800">
        <input id="termsAccepted" name="termsAccepted" type="checkbox" checked={data.termsAccepted || false} onChange={(e) => onDataChange({ termsAccepted: e.target.checked })} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sage-600 focus:ring-sage-500 accent-sage-600" />
        <div className="text-sm leading-6">
          <label htmlFor="termsAccepted" className="font-bold text-slate-900 dark:text-white">Declaração de Veracidade</label>
          <p className="text-slate-500 text-xs">Confirmo que as informações acima são as mais precisas disponíveis no momento.</p>
          {errors.termsAccepted && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.termsAccepted}</p>}
        </div>
      </div>
    </div>
  );
};

export default Step5Anthropometric;
