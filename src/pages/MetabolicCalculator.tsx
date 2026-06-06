import React, { useState, useMemo } from "react";
import {
  calculateBMR,
  calculateTDEE,
  calculateBMI,
  getBMICategory,
  Gender,
  ActivityLevel,
} from "../services/metabolicCalculations";
import { PageHeader, Card, Button } from "../components/ui";
import { BarChart3Icon } from "../components/icons";

const fieldClass =
  "w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl px-3.5 py-2.5 text-sm shadow-xs focus:ring-2 focus:ring-sage-500/60 focus:border-sage-400 focus:outline-none transition-all";

const MetabolicCalculator: React.FC = () => {
  const [formData, setFormData] = useState({
    gender: "female" as Gender,
    age: "30",
    weight: "60",
    height: "165",
    activityLevel: "moderately_active" as ActivityLevel,
  });
  const [results, setResults] = useState<{ bmr: number; tdee: number; bmi: number; bmiCategory: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const parsedData = useMemo(
    () => ({
      gender: formData.gender,
      age: parseInt(formData.age) || 0,
      weight: parseFloat(formData.weight) || 0,
      height: parseFloat(formData.height) || 0,
      activityLevel: formData.activityLevel,
    }),
    [formData],
  );

  const calculateMacros = (e: React.FormEvent) => {
    e.preventDefault();
    const { gender, age, weight, height, activityLevel } = parsedData;
    if (age > 0 && weight > 0 && height > 0) {
      const bmr = calculateBMR({ gender, age, weight, height });
      const tdee = calculateTDEE({ gender, age, weight, height, activityLevel });
      const bmi = calculateBMI(weight, height);
      const bmiCategory = getBMICategory(bmi);
      setResults({ bmr, tdee, bmi, bmiCategory });
    } else {
      setResults(null);
    }
  };

  return (
    <div className="p-5 sm:p-6 lg:p-8 max-w-5xl mx-auto animate-fade-in">
      <PageHeader
        icon={<BarChart3Icon className="w-6 h-6" />}
        title="Calculadora Metabólica"
        subtitle="TMB, GET e IMC pela equação de Mifflin-St Jeor."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form */}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Insira os dados</h2>
          <form onSubmit={calculateMacros} className="space-y-4">
            <div>
              <label className="input-label">Sexo</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className={fieldClass}>
                <option value="female">Feminino</option>
                <option value="male">Masculino</option>
              </select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor="age" className="input-label">Idade</label>
                <input type="number" name="age" id="age" value={formData.age} onChange={handleChange} className={fieldClass} />
              </div>
              <div>
                <label htmlFor="weight" className="input-label">Peso (kg)</label>
                <input type="number" name="weight" id="weight" step="0.1" value={formData.weight} onChange={handleChange} className={fieldClass} />
              </div>
              <div>
                <label htmlFor="height" className="input-label">Altura (cm)</label>
                <input type="number" name="height" id="height" value={formData.height} onChange={handleChange} className={fieldClass} />
              </div>
            </div>
            <div>
              <label htmlFor="activityLevel" className="input-label">Nível de Atividade</label>
              <select id="activityLevel" name="activityLevel" value={formData.activityLevel} onChange={handleChange} className={fieldClass}>
                <option value="sedentary">Sedentário (pouco ou nenhum exercício)</option>
                <option value="lightly_active">Levemente Ativo (1-3 dias/semana)</option>
                <option value="moderately_active">Moderadamente Ativo (3-5 dias/semana)</option>
                <option value="very_active">Muito Ativo (6-7 dias/semana)</option>
                <option value="extremely_active">Extremamente Ativo (trabalho físico)</option>
              </select>
            </div>
            <Button type="submit" fullWidth>Calcular</Button>
          </form>
        </Card>

        {/* Results */}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Resultados</h2>
          {results ? (
            <div className="space-y-3">
              <div className="bg-sage-50 dark:bg-sage-900/30 p-4 rounded-xl text-center">
                <p className="text-sm font-semibold text-sage-700 dark:text-sage-300">Metabolismo Basal (TMB)</p>
                <p className="text-3xl font-extrabold text-sage-800 dark:text-sage-100 stat-number">
                  {results.bmr.toFixed(0)} <span className="text-base font-bold">kcal/dia</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">Energia para funções vitais em repouso.</p>
              </div>
              <div className="bg-sky-50 dark:bg-sky-900/30 p-4 rounded-xl text-center">
                <p className="text-sm font-semibold text-sky-700 dark:text-sky-300">Gasto Energético Total (GET)</p>
                <p className="text-3xl font-extrabold text-sky-800 dark:text-sky-100 stat-number">
                  {results.tdee.toFixed(0)} <span className="text-base font-bold">kcal/dia</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">Calorias para manter o peso com sua atividade.</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/30 p-4 rounded-xl text-center">
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">Índice de Massa Corporal (IMC)</p>
                <p className="text-3xl font-extrabold text-amber-800 dark:text-amber-100 stat-number">{results.bmi.toFixed(1)}</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1">{results.bmiCategory}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[240px] text-center text-slate-400">
              <p>Os resultados aparecerão aqui após o cálculo.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default MetabolicCalculator;
