import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getPatients, saveDietPlan } from '../services/firebaseService';
import { generateAlgorithmicDietPlan, getGeneralObservations } from '../services/dietAlgorithmService';
import usePersistentState from '../hooks/usePersistentState';
import * as M from '../services/metabolicCalculations';
import { dietaryOptionsMap } from './patient-form/Step4Nutritional'; // Import the map

import type { Patient, DietPlan } from '../types';
import { UtensilsIcon, HeartIcon } from './icons';
import DietProgressBar from './diet-generator/DietProgressBar';
import Step1Objectives from './diet-generator/DietStep1Objectives';
import Step2Nutrition from './diet-generator/DietStep2Nutrition';
import Step3MealPlan from './diet-generator/DietStep3MealPlan';
import DietPlanDisplay from './diet-generator/DietPlanDisplay';

const FORM_STATE_KEY = 'dietGeneratorFormState';

const defaultMealPlan = {
    numberOfMeals: 5,
    meals: [
        { name: "Café da Manhã", time: "07:00", percentage: 20 },
        { name: "Lanche da Manhã", time: "10:00", percentage: 10 },
        { name: "Almoço", time: "13:00", percentage: 30 },
        { name: "Lanche da Tarde", time: "16:00", percentage: 15 },
        { name: "Jantar", time: "20:00", percentage: 25 },
    ],
    durationDays: 7,
    startDate: new Date().toISOString().split('T')[0],
    finalObservations: ''
}

const QuickCalculator = ({ onUseTDEE }: { onUseTDEE: (tdee: number) => void }) => {
    const [calcData, setCalcData] = useState({
        gender: 'female' as M.Gender,
        age: '30',
        weight: '60',
        height: '165',
        activityLevel: 'moderately_active' as M.ActivityLevel,
    });
    const [results, setResults] = useState<{ bmr: number; tdee: number; bmi: number; bmiCategory: string } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setCalcData({ ...calcData, [e.target.name]: e.target.value });
    };

    const parsedData = useMemo(() => {
        return {
            gender: calcData.gender,
            age: parseInt(calcData.age) || 0,
            weight: parseFloat(calcData.weight) || 0,
            height: parseFloat(calcData.height) || 0,
            activityLevel: calcData.activityLevel,
        }
    }, [calcData]);

    const calculate = (e: React.FormEvent) => {
        e.preventDefault();
        const { gender, age, weight, height, activityLevel } = parsedData;

        if (age > 0 && weight > 0 && height > 0) {
            const bmr = M.calculateBMR({ gender, age, weight, height });
            const tdee = M.calculateTDEE({ gender, age, weight, height, activityLevel });
            const bmi = M.calculateBMI(weight, height);
            const bmiCategory = M.getBMICategory(bmi);
            setResults({ bmr, tdee, bmi, bmiCategory });
        } else {
            setResults(null);
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-lg mb-8 border border-gray-200 dark:border-gray-700 animate-fade-in">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Calculadora Rápida</h3>
            <form onSubmit={calculate} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
                <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Sexo</label>
                    <select name="gender" value={calcData.gender} onChange={handleChange} className="mt-1 w-full text-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-sage-500 focus:ring-sage-500">
                        <option value="female">Feminino</option>
                        <option value="male">Masculino</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Idade</label>
                    <input type="number" name="age" value={calcData.age} onChange={handleChange} className="mt-1 w-full text-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm" />
                </div>
                <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Peso (kg)</label>
                    <input type="number" name="weight" value={calcData.weight} onChange={handleChange} className="mt-1 w-full text-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm" />
                </div>
                <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Altura (cm)</label>
                    <input type="number" name="height" value={calcData.height} onChange={handleChange} className="mt-1 w-full text-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm" />
                </div>
                <button type="submit" className="bg-sage-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-sage-600 h-9 text-sm">Calcular</button>
            </form>

            {results && (
                <div className="mt-4 p-4 border-t border-gray-200 dark:border-gray-600 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                    <div className="text-center">
                        <p className="text-xs text-gray-500">TMB</p>
                        <p className="font-bold text-lg text-sage-600">{results.bmr.toFixed(0)} kcal</p>
                    </div>
                     <div className="text-center">
                        <p className="text-xs text-gray-500">GET (TDEE)</p>
                        <p className="font-bold text-lg text-sage-600">{results.tdee.toFixed(0)} kcal</p>
                    </div>
                     <div className="text-center">
                        <p className="text-xs text-gray-500">IMC</p>
                        <p className="font-bold text-lg text-sage-600">{results.bmi.toFixed(1)} <span className="text-sm font-normal">({results.bmiCategory})</span></p>
                    </div>
                    <button onClick={() => onUseTDEE(results.tdee)} className="bg-accent text-white font-semibold py-2 px-3 rounded-lg hover:bg-blue-700 text-sm">
                        Aplicar GET ao Plano
                    </button>
                </div>
            )}
        </div>
    );
};

const DietGenerator: React.FC = () => {
    const { currentUser } = useAuth();
    const [step, setStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState([false, false, false]);
    
    // Data
    const [patients, setPatients] = useState<Patient[]>([]);
    const [selectedPatientId, setSelectedPatientId] = useState<string>('');
    const [formData, setFormData, clearFormData] = usePersistentState<any>(FORM_STATE_KEY, {});
    const [errors, setErrors] = useState<Record<string,string>>({});
    const [showCalculator, setShowCalculator] = useState(false);
    
    // Results
    const [generatedPlan, setGeneratedPlan] = useState<DietPlan | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const selectedPatient = useMemo(() => patients.find(p => p.id === selectedPatientId), [patients, selectedPatientId]);

    // This wrapper ensures that we are merging the new data with the existing form data,
    // instead of replacing it, which was causing fields to be lost.
    const updateFormData = (newData: Partial<any>) => {
        setFormData((prevData: any) => ({ ...prevData, ...newData }));
    };


    // Fetch patients on load
    useEffect(() => {
        if (currentUser) {
            const unsubscribe = getPatients(
                currentUser.uid, 
                setPatients, 
                (error) => console.error("Error fetching patients for diet generator:", error)
            );
            return () => unsubscribe();
        }
    }, [currentUser]);
    
    // Pre-fill form when a patient is selected
    const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const patientId = e.target.value;
        setSelectedPatientId(patientId);
        const patient = patients.find(p => p.id === patientId);
        if (patient) {
            clearFormData(); // Clear previous form state

            const translatedRestrictions = patient.dietaryRestrictions
                .map(key => dietaryOptionsMap[key] || key) // Translate keys to labels
                .join(', ');

            setFormData({
                // Step 1
                goal: 'weight_loss',
                currentWeight: patient.weight || 0,
                targetWeight: patient.weight || 0,
                deadlineWeeks: 4,
                activityLevel: patient.activityLevel || 'moderately_active',
                specialObservations: translatedRestrictions + (patient.foodAllergies ? `, ${patient.foodAllergies}` : ''),
                // Step 3
                ...defaultMealPlan,
            });
            setGeneratedPlan(null);
            setApiError(null);
            setSaveSuccess(false);
            setStep(1);
            setCompletedSteps([false, false, false]);
        }
    };
    
    // --- Calculations ---
    const calculations = useMemo(() => {
        if (!selectedPatient || !formData.currentWeight || !formData.activityLevel) return null;
        
        const birthDate = new Date(selectedPatient.dob.split('/').reverse().join('-'));
        const ageDifMs = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDifMs);
        const patientAge = Math.abs(ageDate.getUTCFullYear() - 1970);
        
        // Ensure gender is compatible with calculation types (map 'other' to 'female' as fallback)
        const calcGender: M.Gender = selectedPatient.gender === 'male' ? 'male' : 'female';
        
        const bmr = M.calculateBMR({ gender: calcGender, weight: formData.currentWeight, height: selectedPatient.height, age: patientAge });
        const tdee = M.calculateTDEE({ gender: calcGender, weight: formData.currentWeight, height: selectedPatient.height, age: patientAge, activityLevel: formData.activityLevel });
        const targetCalories = M.calculateTargetCalories(tdee, formData.currentWeight, formData.targetWeight, formData.deadlineWeeks);

        const dailyCalories = parseFloat(formData.dailyCalories) || targetCalories;
        const macros = formData.macros || M.getMacroDistributionForDiet(formData.dietType || 'traditional');
        const macrosInGrams = M.calculateMacrosInGrams(dailyCalories, macros.protein, macros.carbs, macros.fat);
        const validationWarnings = M.validateNutrition(dailyCalories, macrosInGrams.proteinGrams, formData.currentWeight);
        
        return {
            bmr,
            tdee,
            targetCalories,
            water: (formData.currentWeight * 35) / 1000,
            macrosInGrams,
            validationWarnings,
        };
    }, [selectedPatient, formData]);
    
    // Sync calculations to form state
    useEffect(() => {
        if (calculations && !formData.dailyCalories) {
            updateFormData({
                dailyCalories: Math.round(calculations.targetCalories),
                dietType: 'traditional',
                macros: M.getMacroDistributionForDiet('traditional')
            });
        }
    }, [calculations]);

    // Re-calculate macros if diet type changes
    useEffect(() => {
        if (formData.dietType) {
             updateFormData({
                macros: M.getMacroDistributionForDiet(formData.dietType as M.DietType)
            });
        }
    }, [formData.dietType]);

    // --- Navigation & Validation ---
    const validateStep = (stepToValidate: number) => {
        const newErrors: Record<string, string> = {};
        if (stepToValidate === 1) {
            if (!formData.currentWeight || formData.currentWeight < 20) newErrors.currentWeight = "Peso inválido.";
            if (!formData.targetWeight || formData.targetWeight < 20) newErrors.targetWeight = "Peso inválido.";
            if (!formData.deadlineWeeks || formData.deadlineWeeks < 1) newErrors.deadlineWeeks = "Prazo deve ser de no mínimo 1 semana.";
        }
        if (stepToValidate === 2) {
            if (!formData.dailyCalories || formData.dailyCalories < 800) newErrors.dailyCalories = "Mínimo de 800 kcal.";
            const { protein, carbs, fat } = formData.macros;
            if (protein + carbs + fat !== 100) newErrors.macros = "A soma dos macros deve ser 100%.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const goToStep = (targetStep: number) => {
        if (targetStep > step && !validateStep(step)) return;
        const newCompleted = [...completedSteps];
        for(let i=0; i < targetStep; i++) newCompleted[i] = true;
        setCompletedSteps(newCompleted);
        setStep(targetStep);
    };
    
    const handleGenerate = async () => {
        if (!validateStep(1) || !validateStep(2) || !calculations || !selectedPatient) return;
        setLoading(true);
        setApiError(null);
        setGeneratedPlan(null);

        const numericDailyCalories = parseFloat(formData.dailyCalories);
        if (isNaN(numericDailyCalories)) {
            setApiError("As calorias diárias devem ser um número válido.");
            setLoading(false);
            return;
        }

        try {
            // Simulate a short delay for better UX
            await new Promise(res => setTimeout(res, 500)); 
            
            const result = generateAlgorithmicDietPlan({
                nutritionalTargets: {
                    calories: numericDailyCalories,
                    protein: calculations.macrosInGrams.proteinGrams,
                    carbs: calculations.macrosInGrams.carbsGrams,
                    fat: calculations.macrosInGrams.fatGrams,
                },
                mealPlanConfig: {
                    dietType: formData.dietType,
                    meals: formData.meals.map((m: any) => ({ name: m.name, time: m.time, caloriePercentage: m.percentage }))
                }
            });
            
            const finalPlan: DietPlan = {
                version: 2,
                patientId: selectedPatient.id!,
                patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
                createdAt: new Date().toISOString(),
                durationDays: formData.durationDays,
                startDate: formData.startDate,
                dailyCalories: numericDailyCalories,
                macronutrients: {
                    proteinGrams: calculations.macrosInGrams.proteinGrams,
                    proteinPercentage: formData.macros.protein,
                    carbsGrams: calculations.macrosInGrams.carbsGrams,
                    carbsPercentage: formData.macros.carbs,
                    fatGrams: calculations.macrosInGrams.fatGrams,
                    fatPercentage: formData.macros.fat,
                },
                meals: result.meals,
                waterRecommendationLiters: calculations.water,
                generalObservations: getGeneralObservations(),
                dietType: formData.dietType,
            };
            setGeneratedPlan(finalPlan);
        } catch (err: any) {
            setApiError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const handleSave = async () => {
        if (!generatedPlan || !currentUser) return;
        setSaving(true);
        try {
            await saveDietPlan(currentUser.uid, generatedPlan);
            setSaveSuccess(true);
            setTimeout(() => {
                clearFormData();
                setSelectedPatientId('');
                setGeneratedPlan(null);
                setApiError(null);
                setSaveSuccess(false);
                setStep(1);
            }, 1500); // Reset after showing success message
        } catch (err) {
            setApiError("Falha ao salvar o plano. Tente novamente.");
        } finally {
            setSaving(false);
        }
    };
    
    const handleUseTDEE = (tdee: number) => {
        updateFormData({ dailyCalories: Math.round(tdee) });
        alert(`O campo "Calorias Diárias" no Passo 2 foi atualizado para ${Math.round(tdee)} kcal.`);
        setShowCalculator(false);
        // Focus the element after state update
        setTimeout(() => document.getElementById('dailyCalories')?.focus(), 0);
    };

    // --- Render ---
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Gerador de Dieta Inteligente</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Crie planos alimentares completos e personalizados em 3 etapas.</p>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <div>
                        <label htmlFor="patient" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Selecione o Paciente para Começar</label>
                        <select id="patient" name="patient" value={selectedPatientId} onChange={handlePatientChange} className="mt-1 block w-full sm:w-80 pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-sage-500 focus:border-sage-500 sm:text-sm rounded-md" required>
                            <option value="" disabled>-- Selecione --</option>
                            {patients.map(p => <option key={p.id} value={p.id}>{`${p.firstName} ${p.lastName}`}</option>)}
                        </select>
                    </div>
                     <button onClick={() => setShowCalculator(!showCalculator)} className="flex items-center gap-2 text-sm font-medium text-sage-600 hover:text-sage-700 dark:text-sage-300 dark:hover:text-sage-200 mt-4 sm:mt-0">
                        <HeartIcon className="w-5 h-5"/>
                        {showCalculator ? 'Fechar Calculadora' : 'Calculadora Rápida'}
                    </button>
                </div>

                 {showCalculator && <QuickCalculator onUseTDEE={handleUseTDEE} />}

                {selectedPatient && (
                    <>
                        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-900/40 border-l-4 border-sage-500">
                            <h3 className="font-semibold text-gray-800 dark:text-white">Paciente: {selectedPatient.firstName} {selectedPatient.lastName}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{selectedPatient.gender === 'male' ? 'Masculino' : 'Feminino'}, {new Date().getFullYear() - new Date(selectedPatient.dob.split('/').reverse().join('-')).getFullYear()} anos, {(selectedPatient.height / 100).toFixed(2).replace('.', ',')} m</p>
                        </div>
                    
                        <div className="mb-8">
                            <DietProgressBar currentStep={step} goToStep={goToStep} completedSteps={completedSteps} />
                        </div>

                        {step === 1 && <Step1Objectives formData={formData} onUpdate={updateFormData} patientData={selectedPatient} errors={errors} />}
                        {step === 2 && calculations && <Step2Nutrition formData={formData} onUpdate={updateFormData} calculations={calculations} errors={errors} validationWarnings={calculations.validationWarnings}/>}
                        {step === 3 && <Step3MealPlan formData={formData} onUpdate={updateFormData} dailyCalories={parseFloat(formData.dailyCalories) || 0} />}

                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <button onClick={() => goToStep(step - 1)} disabled={step === 1} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-600 dark:text-gray-200 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-500 disabled:opacity-50">Anterior</button>
                            {step < 3 ? (
                                <button onClick={() => goToStep(step + 1)} className="px-4 py-2 text-sm font-medium text-white bg-sage-500 border border-transparent rounded-md shadow-sm hover:bg-sage-600">Próximo</button>
                            ) : (
                                <button onClick={handleGenerate} disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-accent border border-transparent rounded-md shadow-sm hover:bg-blue-700 disabled:bg-blue-300">{loading ? 'Gerando...' : 'Gerar Plano Alimentar'}</button>
                            )}
                        </div>
                    </>
                )}
            </div>

            <div className="mt-8">
                {loading && (
                     <div className="flex flex-col items-center justify-center h-full bg-white dark:bg-gray-800 p-6 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-center">
                        <svg className="animate-spin h-10 w-10 text-sage-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">Gerando o plano perfeito...</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Aguarde, nosso algoritmo está montando as refeições e calculando os nutrientes.</p>
                    </div>
                )}
                {apiError && <div className="text-red-500 bg-red-100 dark:bg-red-900/50 dark:text-red-300 p-4 rounded-lg">{apiError}</div>}
                
                {generatedPlan && <DietPlanDisplay plan={generatedPlan} onSave={handleSave} onDiscard={() => setGeneratedPlan(null)} isSaving={saving} saveSuccess={saveSuccess} />}

                 {!loading && !generatedPlan && !apiError && selectedPatient && (
                    <div className="flex flex-col items-center justify-center h-full bg-white dark:bg-gray-800 p-6 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-center">
                        <UtensilsIcon className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                        <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">Aguardando Geração</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Preencha as etapas e clique em "Gerar Plano Alimentar".</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DietGenerator;