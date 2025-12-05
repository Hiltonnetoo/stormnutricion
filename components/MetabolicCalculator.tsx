import React, { useState, useMemo } from 'react';
import { calculateBMR, calculateTDEE, calculateBMI, getBMICategory, Gender, ActivityLevel } from '../services/metabolicCalculations';

const MetabolicCalculator: React.FC = () => {
  const [formData, setFormData] = useState({
    gender: 'female' as Gender,
    age: '30',
    weight: '60',
    height: '165',
    activityLevel: 'moderately_active' as ActivityLevel,
  });
  const [results, setResults] = useState<{ bmr: number; tdee: number; bmi: number; bmiCategory: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const parsedData = useMemo(() => {
    return {
        gender: formData.gender,
        age: parseInt(formData.age) || 0,
        weight: parseFloat(formData.weight) || 0,
        height: parseFloat(formData.height) || 0,
        activityLevel: formData.activityLevel,
    }
  }, [formData]);
  
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
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Calculadora Metabólica</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Insira seus dados</h2>
          <form onSubmit={calculateMacros} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sexo</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-sage-500 focus:ring-sage-500">
                <option value="female">Feminino</option>
                <option value="male">Masculino</option>
              </select>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Idade</label>
                  <input type="number" name="age" id="age" value={formData.age} onChange={handleChange} className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-sage-500 focus:ring-sage-500" />
                </div>
                <div>
                  <label htmlFor="weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Peso (kg)</label>
                  <input type="number" name="weight" id="weight" step="0.1" value={formData.weight} onChange={handleChange} className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-sage-500 focus:ring-sage-500" />
                </div>
                <div>
                  <label htmlFor="height" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Altura (cm)</label>
                  <input type="number" name="height" id="height" value={formData.height} onChange={handleChange} className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-sage-500 focus:ring-sage-500" />
                </div>
            </div>
            <div>
              <label htmlFor="activityLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nível de Atividade</label>
              <select id="activityLevel" name="activityLevel" value={formData.activityLevel} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-sage-500 focus:ring-sage-500">
                <option value="sedentary">Sedentário (pouco ou nenhum exercício)</option>
                <option value="lightly_active">Levemente Ativo (exercício leve 1-3 dias/semana)</option>
                <option value="moderately_active">Moderadamente Ativo (exercício moderado 3-5 dias/semana)</option>
                <option value="very_active">Muito Ativo (exercício intenso 6-7 dias/semana)</option>
                <option value="extremely_active">Extremamente Ativo (exercício muito intenso e trabalho físico)</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-sage-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-sage-600 disabled:bg-sage-300 transition-colors">
              Calcular
            </button>
          </form>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Resultados</h2>
          {results ? (
            <div className="space-y-4">
              <div className="bg-sage-50 dark:bg-sage-900/50 p-4 rounded-lg text-center">
                <p className="text-sm text-sage-600 dark:text-sage-300">Metabolismo Basal (TMB)</p>
                <p className="text-3xl font-bold text-sage-800 dark:text-sage-100">{results.bmr.toFixed(0)} <span className="text-lg">kcal/dia</span></p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Energia para funções vitais em repouso.</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/50 p-4 rounded-lg text-center">
                <p className="text-sm text-blue-600 dark:text-blue-300">Gasto Energético Total (GET)</p>
                <p className="text-3xl font-bold text-blue-800 dark:text-blue-100">{results.tdee.toFixed(0)} <span className="text-lg">kcal/dia</span></p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Calorias necessárias para manter o peso atual com sua atividade.</p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/50 p-4 rounded-lg text-center">
                <p className="text-sm text-yellow-600 dark:text-yellow-300">Índice de Massa Corporal (IMC)</p>
                <p className="text-3xl font-bold text-yellow-800 dark:text-yellow-100">{results.bmi.toFixed(1)}</p>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-1">{results.bmiCategory}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
              <p>Os resultados aparecerão aqui após o cálculo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetabolicCalculator;
