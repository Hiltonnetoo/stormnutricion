import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getPatients, saveDietPlan, updateDietPlan } from "../services/firebaseService";
import { calcAge } from "../utils/calcAge";
import { generateAlgorithmicDietPlan, getGeneralObservations } from "../services/dietAlgorithmService";
import usePersistentState from "../hooks/usePersistentState";
import * as M from "../services/metabolicCalculations";
import { dietaryOptionsMap } from "../components/patient-form/Step4Nutritional";

import type { Patient, DietPlan } from "../types";
import type { DietFormData } from "../components/diet-generator/dietForm.types";
import { UtensilsIcon, HeartIcon } from "../components/icons";
import DietProgressBar from "../components/diet-generator/DietProgressBar";
import Step1Objectives from "../components/diet-generator/DietStep1Objectives";
import Step2Nutrition from "../components/diet-generator/DietStep2Nutrition";
import Step3MealPlan from "../components/diet-generator/DietStep3MealPlan";
import DietPlanDisplay from "../components/diet-generator/DietPlanDisplay";
import LabExamsModule from "../components/diet-generator/LabExamsModule";
import { PageHeader, Card, Button, Badge, Spinner } from "../components/ui";

const FORM_STATE_KEY = "dietGeneratorFormState";

const fieldClass = "input-field";

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
  startDate: new Date().toISOString().split("T")[0],
  finalObservations: "",
};

const modeTone: Record<string, string> = {
  clinical: "bg-rose-100 text-rose-700",
  performance: "bg-sky-100 text-sky-700",
  pediatric: "bg-violet-100 text-violet-700",
  recovery: "bg-indigo-100 text-indigo-700",
};

const modeLabels: Record<string, string> = {
  general: "Geral",
  clinical: "Clínico",
  performance: "Performance",
  recovery: "Recuperação",
  pediatric: "Pediátrico",
};

/* --------------------------------------------------------- Quick calculator */
const QuickCalculator: React.FC<{ onUseTDEE: (tdee: number) => void }> = ({ onUseTDEE }) => {
  const [calcData, setCalcData] = useState({
    gender: "female" as M.Gender,
    age: "30",
    weight: "60",
    height: "165",
    activityLevel: "moderately_active" as M.ActivityLevel,
  });
  const [results, setResults] = useState<{ bmr: number; tdee: number; bmi: number; bmiCategory: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setCalcData({ ...calcData, [e.target.name]: e.target.value });
  };

  const parsedData = useMemo(
    () => ({
      gender: calcData.gender,
      age: parseInt(calcData.age) || 0,
      weight: parseFloat(calcData.weight) || 0,
      height: parseFloat(calcData.height) || 0,
      activityLevel: calcData.activityLevel,
    }),
    [calcData],
  );

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
    <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl mb-6 border border-slate-200 dark:border-slate-700 animate-fade-in">
      <h3 className="font-bold text-slate-800 dark:text-white mb-4">Calculadora Rápida</h3>
      <form onSubmit={calculate} className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Sexo</label>
          <select name="gender" value={calcData.gender} onChange={handleChange} className={fieldClass}>
            <option value="female">Feminino</option>
            <option value="male">Masculino</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Idade</label>
          <input type="number" name="age" value={calcData.age} onChange={handleChange} className={fieldClass} />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Peso (kg)</label>
          <input type="number" name="weight" value={calcData.weight} onChange={handleChange} className={fieldClass} />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Altura (cm)</label>
          <input type="number" name="height" value={calcData.height} onChange={handleChange} className={fieldClass} />
        </div>
        <Button type="submit">Calcular</Button>
      </form>

      {results && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
          {[
            ["TMB", `${results.bmr.toFixed(0)} kcal`],
            ["GET (TDEE)", `${results.tdee.toFixed(0)} kcal`],
            ["IMC", `${results.bmi.toFixed(1)} (${results.bmiCategory})`],
          ].map(([l, v]) => (
            <div key={l} className="text-center">
              <p className="text-xs text-slate-500">{l}</p>
              <p className="font-bold text-sage-600">{v}</p>
            </div>
          ))}
          <Button size="sm" className="bg-sky-600 hover:bg-sky-700 shadow-sky-600/25" onClick={() => onUseTDEE(results.tdee)}>
            Usar como meta calórica
          </Button>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------- Diet generator */
const DietGenerator: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([false, false, false]);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [formData, setFormData, clearFormData] = usePersistentState<DietFormData>(FORM_STATE_KEY, {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCalculator, setShowCalculator] = useState(false);
  const [tdeeAppliedMsg, setTdeeAppliedMsg] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [dietTemplates] = useState<{ id: string; name: string; plan: DietPlan }[]>(() => {
    try { return JSON.parse(localStorage.getItem("dietPlanTemplates") || "[]"); } catch { return []; }
  });

  const [generatedPlan, setGeneratedPlan] = useState<DietPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [savedPatientData, setSavedPatientData] = useState<Patient | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [editingDietId, setEditingDietId] = useState<string | null>(null);

  const selectedPatient = useMemo(() => patients.find((p) => p.id === selectedPatientId), [patients, selectedPatientId]);

  // Editing from sessionStorage
  useEffect(() => {
    const dietToEditStr = sessionStorage.getItem("dietToEdit");
    const patientForDietStr = sessionStorage.getItem("patientForDiet");
    if (dietToEditStr && patientForDietStr && patients.length > 0) {
      try {
        const dietToEdit = JSON.parse(dietToEditStr) as DietPlan;
        const patientForDiet = JSON.parse(patientForDietStr) as Patient;
        const patient = patients.find((p) => p.id === patientForDiet.id);
        if (patient) {
          setSelectedPatientId(patient.id!);
          setEditingDietId(dietToEdit.id || null);
          const dailyCalories = dietToEdit.dailyCalories || 2000;
          setFormData({
            goal: "weight_loss",
            currentWeight: patient.weight || 0,
            targetWeight: patient.weight || 0,
            deadlineWeeks: 4,
            activityLevel: patient.activityLevel || "moderately_active",
            dietType: dietToEdit.dietType || "traditional",
            dailyCalories,
            macros: {
              protein: dietToEdit.macronutrients?.proteinPercentage || 30,
              carbs: dietToEdit.macronutrients?.carbsPercentage || 40,
              fat: dietToEdit.macronutrients?.fatPercentage || 30,
            },
            durationDays: dietToEdit.durationDays || 7,
            startDate: dietToEdit.startDate || new Date().toISOString().split("T")[0],
            numberOfMeals: (dietToEdit.meals || []).length || 5,
            meals: (dietToEdit.meals || []).map((m) => ({
              name: m.mealName,
              time: m.time,
              percentage: dailyCalories > 0 ? Math.round((m.calories / dailyCalories) * 100) : 20,
            })),
            finalObservations: Array.isArray(dietToEdit.generalObservations) ? dietToEdit.generalObservations.join("\n") : "",
          });
          setGeneratedPlan(dietToEdit);
          setStep(3);
          setCompletedSteps([true, true, true]);
        }
        // Limpa o sessionStorage SOMENTE após processamento bem-sucedido
        sessionStorage.removeItem("dietToEdit");
        sessionStorage.removeItem("patientForDiet");
      } catch (err) {
        console.error("Error parsing diet to edit:", err);
        // NÃO remove do sessionStorage no erro: permite tentar novamente ao recarregar
        setApiError("Não foi possível carregar o plano para edição. Recarregue a página para tentar novamente.");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patients]);

  const updateFormData = (newData: Partial<DietFormData>) => setFormData((prev) => ({ ...prev, ...newData }));

  useEffect(() => {
    if (currentUser) {
      const unsubscribe = getPatients(currentUser.uid, setPatients, (error) => {
        console.error("Error fetching patients for diet generator:", error);
        setApiError("Falha ao carregar a lista de pacientes. Recarregue a página.");
      });
      return () => unsubscribe();
    }
  }, [currentUser]);

  // Auto-seleciona o paciente quando vindo de /patients/:id?patient=:id (item 3 FASE 1)
  useEffect(() => {
    const prePatientId = searchParams.get("patient");
    if (prePatientId && patients.length > 0 && !selectedPatientId) {
      const patient = patients.find((p) => p.id === prePatientId);
      if (patient) {
        // Reutiliza o handler que já popula todos os campos necessários
        const event = { target: { value: patient.id } } as React.ChangeEvent<HTMLSelectElement>;
        handlePatientChange(event);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patients, searchParams]);

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const patientId = e.target.value;
    setSelectedPatientId(patientId);
    const patient = patients.find((p) => p.id === patientId);
    if (patient) {
      clearFormData();
      const translatedRestrictions = (patient.dietaryRestrictions || [])
        .map((key) => dietaryOptionsMap[key] || key)
        .join(", ");
      setFormData({
        goal: patient.nutritionalGoal || "weight_loss",
        currentWeight: patient.weight || 0,
        targetWeight: patient.weight || 0,
        deadlineWeeks: 4,
        activityLevel: patient.activityLevel || "moderately_active",
        mode: patient.mode || "general",
        clinicalTags: patient.clinicalTags || [],
        specialObservations: translatedRestrictions + (patient.foodAllergies ? `, ${patient.foodAllergies}` : ""),
        macros: M.getMacroDistributionForMode(patient.mode || "general"),
        ...defaultMealPlan,
        lastLabExams: patient.lastLabExams || [],
      });
      setGeneratedPlan(null);
      setApiError(null);
      setSaveSuccess(false);
      setStep(1);
      setCompletedSteps([false, false, false]);
    }
  };

  const calculations = useMemo(() => {
    if (!selectedPatient || !formData.currentWeight || !formData.activityLevel) return null;
    const patientAge = calcAge(selectedPatient.dob) || 30; // fallback 30 anos se dob inválido
    const calcGender: M.Gender = selectedPatient.gender === "male" ? "male" : "female";
    const currentWeight = Number(formData.currentWeight);
    const bmr = M.calculateBMR({ gender: calcGender, weight: currentWeight, height: selectedPatient.height, age: patientAge });
    const tdee = M.calculateTDEE({ gender: calcGender, weight: currentWeight, height: selectedPatient.height, age: patientAge, activityLevel: formData.activityLevel as M.ActivityLevel });
    const targetCalories = M.calculateTargetCalories(tdee, currentWeight, Number(formData.targetWeight), Number(formData.deadlineWeeks));
    const dailyCalories = Number(formData.dailyCalories) || targetCalories;
    const macros = formData.macros || M.getMacroDistributionForDiet((formData.dietType as M.DietType) || "traditional");
    const macrosInGrams = M.calculateMacrosInGrams(dailyCalories, macros.protein, macros.carbs, macros.fat);
    const validationWarnings = M.validateNutrition(dailyCalories, macrosInGrams.proteinGrams, currentWeight);
    return { bmr, tdee, targetCalories, water: (currentWeight * 35) / 1000, macrosInGrams, validationWarnings };
  }, [selectedPatient, formData]);

  useEffect(() => {
    if (calculations && !formData.dailyCalories) {
      updateFormData({
        dailyCalories: Math.round(calculations.targetCalories),
        dietType: "traditional",
        macros: M.getMacroDistributionForDiet("traditional"),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calculations]);

  useEffect(() => {
    if (formData.dietType) {
      updateFormData({ macros: M.getMacroDistributionForDiet(formData.dietType as M.DietType) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.dietType]);

  const validateStep = (stepToValidate: number) => {
    const newErrors: Record<string, string> = {};
    if (stepToValidate === 1) {
      if (!formData.currentWeight || Number(formData.currentWeight) < 20) newErrors.currentWeight = "Peso inválido.";
      if (!formData.targetWeight || Number(formData.targetWeight) < 20) newErrors.targetWeight = "Peso inválido.";
      if (!formData.deadlineWeeks || Number(formData.deadlineWeeks) < 1) newErrors.deadlineWeeks = "Prazo deve ser de no mínimo 1 semana.";
      // Coerência objetivo × peso-alvo (item 7 FASE 1)
      if (
        formData.goal === "weight_loss" &&
        Number(formData.targetWeight) >= Number(formData.currentWeight)
      ) {
        newErrors.targetWeight =
          "Para emagrecer, o peso-alvo deve ser menor que o peso atual. Revise os campos ou altere o objetivo.";
      }
      if (
        formData.goal === "weight_gain" &&
        Number(formData.targetWeight) <= Number(formData.currentWeight)
      ) {
        newErrors.targetWeight =
          "Para ganho de massa, o peso-alvo deve ser maior que o peso atual. Revise os campos ou altere o objetivo.";
      }
    }
    if (stepToValidate === 2) {
      if (!formData.dailyCalories || Number(formData.dailyCalories) < 800) newErrors.dailyCalories = "Mínimo de 800 kcal.";
      const { protein, carbs, fat } = formData.macros ?? { protein: 0, carbs: 0, fat: 0 };
      if (protein + carbs + fat !== 100) newErrors.macros = "A soma dos macros deve ser 100%.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goToStep = (targetStep: number) => {
    if (targetStep > step && !validateStep(step)) return;
    const newCompleted = [...completedSteps];
    for (let i = 0; i < targetStep; i++) newCompleted[i] = true;
    setCompletedSteps(newCompleted);
    setStep(targetStep);
  };

  const handleGenerate = async () => {
    if (!validateStep(1) || !validateStep(2) || !calculations || !selectedPatient) return;
    setLoading(true);
    setApiError(null);
    setGeneratedPlan(null);
    const numericDailyCalories = Number(formData.dailyCalories);
    if (isNaN(numericDailyCalories)) {
      setApiError("As calorias diárias devem ser um número válido.");
      setLoading(false);
      return;
    }
    try {
      await new Promise((res) => setTimeout(res, 500));
      const result = generateAlgorithmicDietPlan({
        nutritionalTargets: {
          calories: numericDailyCalories,
          protein: calculations.macrosInGrams.proteinGrams,
          carbs: calculations.macrosInGrams.carbsGrams,
          fat: calculations.macrosInGrams.fatGrams,
        },
        mealPlanConfig: {
          dietType: (formData.dietType as M.DietType) || "traditional",
          meals: (formData.meals ?? []).map((m) => ({ name: m.name, time: m.time, caloriePercentage: m.percentage })),
        },
        restrictions: selectedPatient.dietaryRestrictions,
        mode: formData.mode || "general",
        clinicalTags: formData.clinicalTags || [],
      });
      const finalPlan: DietPlan = {
        version: 2,
        patientId: selectedPatient.id!,
        patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
        createdAt: new Date().toISOString(),
        durationDays: Number(formData.durationDays) || 7,
        startDate: formData.startDate || new Date().toISOString().split("T")[0],
        dailyCalories: numericDailyCalories,
        macronutrients: {
          proteinGrams: calculations.macrosInGrams.proteinGrams,
          proteinPercentage: formData.macros?.protein ?? 0,
          carbsGrams: calculations.macrosInGrams.carbsGrams,
          carbsPercentage: formData.macros?.carbs ?? 0,
          fatGrams: calculations.macrosInGrams.fatGrams,
          fatPercentage: formData.macros?.fat ?? 0,
        },
        meals: result.meals,
        decisionLog: result.decisionLog,
        waterRecommendationLiters: calculations.water,
        generalObservations: getGeneralObservations(),
        dietType: (formData.dietType as M.DietType) || "traditional",
        mode: formData.mode || "general",
        clinicalTags: formData.clinicalTags || [],
        labExams: formData.lastLabExams || [],
      };
      setGeneratedPlan(finalPlan);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Falha ao gerar o plano.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedPlan || !currentUser) return;
    setSaving(true);
    try {
      if (editingDietId) await updateDietPlan(currentUser.uid, editingDietId, generatedPlan);
      else await saveDietPlan(currentUser.uid, generatedPlan);
      // Guarda o paciente para a tela de próximos passos e sinaliza sucesso
      setSavedPatientData(selectedPatient || null);
      setSaveSuccess(true);
    } catch {
      setApiError("Falha ao salvar o plano. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  /** Reseta o formulário para criar outro plano */
  const handleCreateAnother = () => {
    clearFormData();
    setSelectedPatientId("");
    setGeneratedPlan(null);
    setEditingDietId(null);
    setApiError(null);
    setSaveSuccess(false);
    setSavedPatientData(null);
    setStep(1);
    setCompletedSteps([false, false, false]);
  };

  const handleUseTDEE = (tdee: number) => {
    updateFormData({ dailyCalories: Math.round(tdee) });
    setShowCalculator(false);
    setTdeeAppliedMsg(`✅ Calorias diárias atualizadas para ${Math.round(tdee)} kcal.`);
    setTimeout(() => { setTdeeAppliedMsg(""); document.getElementById("dailyCalories")?.focus(); }, 4000);
  };

  return (
    <div className="p-5 sm:p-6 lg:p-8 max-w-5xl mx-auto animate-fade-in">
      <PageHeader
        icon={<UtensilsIcon className="w-6 h-6" />}
        title="Gerador de Dietas"
        subtitle="Crie planos alimentares completos e personalizados em 3 etapas."
      />

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
          <div className="w-full sm:w-auto">
            <label htmlFor="patient" className="input-label">Selecione o Paciente para Começar</label>
            <select id="patient" name="patient" value={selectedPatientId} onChange={handlePatientChange} className={`${fieldClass} w-full sm:w-80`} required>
              <option value="" disabled>-- Selecione --</option>
              {patients.map((p) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3">
            {dietTemplates.length > 0 && (
              <button onClick={() => setShowTemplates(!showTemplates)} className="flex items-center gap-2 text-sm font-semibold text-violet-600 hover:text-violet-700">
                📋 {showTemplates ? "Fechar modelos" : `Modelos (${dietTemplates.length})`}
              </button>
            )}
            <button onClick={() => setShowCalculator(!showCalculator)} className="flex items-center gap-2 text-sm font-semibold text-sage-600 hover:text-sage-700">
              <HeartIcon className="w-5 h-5" />
              {showCalculator ? "Fechar Calculadora" : "Calculadora Rápida"}
            </button>
          </div>
        </div>

        {showTemplates && dietTemplates.length > 0 && (
          <div className="mb-4 p-4 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-2xl animate-fade-in">
            <h4 className="text-sm font-bold text-violet-800 dark:text-violet-200 mb-3">📋 Modelos salvos</h4>
            <div className="space-y-2">
              {dietTemplates.map((tmpl) => (
                <div key={tmpl.id} className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl px-3 py-2 border border-violet-100 dark:border-violet-700">
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">{tmpl.name}</p>
                    <p className="text-xs text-slate-400">{tmpl.plan.dailyCalories} kcal · {tmpl.plan.dietType}</p>
                  </div>
                  <button
                    onClick={() => {
                      updateFormData({
                        dailyCalories: tmpl.plan.dailyCalories,
                        dietType: tmpl.plan.dietType,
                        macros: {
                          protein: tmpl.plan.macronutrients.proteinPercentage,
                          carbs: tmpl.plan.macronutrients.carbsPercentage,
                          fat: tmpl.plan.macronutrients.fatPercentage,
                        },
                        mealsPerDay: tmpl.plan.meals.length,
                        durationDays: tmpl.plan.durationDays,
                      });
                      setShowTemplates(false);
                      setTdeeAppliedMsg(`✅ Modelo "${tmpl.name}" carregado.`);
                      setTimeout(() => setTdeeAppliedMsg(""), 4000);
                    }}
                    className="text-xs font-bold text-violet-600 hover:text-violet-800 bg-violet-100 hover:bg-violet-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Usar modelo
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {showCalculator && <QuickCalculator onUseTDEE={handleUseTDEE} />}
        {tdeeAppliedMsg && (
          <div className="mb-4 px-4 py-3 bg-sage-50 border border-sage-200 rounded-xl text-sm font-medium text-sage-700 animate-fade-in">
            {tdeeAppliedMsg}
          </div>
        )}

        {selectedPatient && (
          <>
            <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900/40 border-l-4 border-sage-500 rounded-r-2xl flex justify-between items-start">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white">Paciente: {selectedPatient.firstName} {selectedPatient.lastName}</h3>
                <p className="text-xs text-slate-500">
                  {selectedPatient.gender === "male" ? "Masculino" : "Feminino"}, {calcAge(selectedPatient.dob) || "?"} anos, {(selectedPatient.height / 100).toFixed(2).replace(".", ",")} m
                </p>
              </div>
              <Badge tone="sage">Ativo</Badge>
            </div>

            <div className="mb-6 p-5 card">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg">
                  <HeartIcon className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Contexto Clínico Carregado</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase mb-2">Modo de Atendimento</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${modeTone[formData.mode ?? ""] || "bg-slate-100 text-slate-700"}`}>
                    {modeLabels[formData.mode ?? ""] || formData.mode || "Geral"}
                  </span>
                </div>
                {Array.isArray(formData.clinicalTags) && formData.clinicalTags.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Condições Monitoradas</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.clinicalTags.map((tag: string) => (
                        <span key={tag} className="px-2 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-[11px] font-bold uppercase rounded border border-rose-100 dark:border-rose-800">
                          {tag.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <p className="mt-4 text-xs text-slate-400 italic">* Estes dados foram carregados do prontuário do paciente. Para alterá-los, edite o cadastro do paciente.</p>
            </div>

            <div className="mb-6">
              <LabExamsModule
                mode={formData.mode || "general"}
                clinicalTags={Array.isArray(formData.clinicalTags) ? formData.clinicalTags : []}
                exams={Array.isArray(formData.lastLabExams) ? formData.lastLabExams : []}
                onUpdate={(lastLabExams) => updateFormData({ lastLabExams })}
              />
            </div>

            <div className="mb-6">
              <DietProgressBar currentStep={step} goToStep={goToStep} completedSteps={completedSteps} />
            </div>

            {step === 1 && <Step1Objectives formData={formData} onUpdate={updateFormData} patientData={selectedPatient} errors={errors} />}
            {step === 2 && calculations && <Step2Nutrition formData={formData} onUpdate={updateFormData} calculations={calculations} errors={errors} validationWarnings={calculations.validationWarnings} />}
            {step === 3 && calculations && <Step3MealPlan formData={formData} onUpdate={updateFormData} dailyCalories={Number(formData.dailyCalories) || 0} calculations={calculations} />}

            <div className="mt-7 pt-5 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <Button variant="secondary" onClick={() => goToStep(step - 1)} disabled={step === 1}>Anterior</Button>
              {step < 3 ? (
                <Button onClick={() => goToStep(step + 1)}>Próximo</Button>
              ) : (
                <Button onClick={handleGenerate} loading={loading} className="bg-sky-600 hover:bg-sky-700 shadow-sky-600/25">
                  {loading ? "Gerando..." : "Gerar Plano Alimentar"}
                </Button>
              )}
            </div>
          </>
        )}
      </Card>

      <div className="mt-6">
        {loading && (
          <Card className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed">
            <Spinner className="h-10 w-10 text-sage-500" />
            <p className="mt-4 text-lg font-bold text-slate-700 dark:text-slate-200">Gerando o plano perfeito...</p>
            <p className="text-sm text-slate-500">Aguarde, nosso algoritmo está montando as refeições e calculando os nutrientes.</p>
          </Card>
        )}
        {apiError && <div className="text-rose-700 bg-rose-50 border border-rose-100 p-4 rounded-xl text-sm">{apiError}</div>}

        {/* Tela de sucesso pós-salvar com próximos passos (item 4 FASE 1) */}
        {saveSuccess && savedPatientData && (
          <Card className="p-8 flex flex-col items-center text-center animate-scale-in">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-3xl mb-5">🎉</div>
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-white">
              Plano de {savedPatientData.firstName} salvo com sucesso!
            </h3>
            <p className="text-slate-500 text-sm mt-2 mb-8">O que você quer fazer agora?</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                onClick={() => navigate(`/patients/${savedPatientData.id}`)}
                className="bg-sky-600 hover:bg-sky-700 shadow-sky-600/25"
              >
                Ver perfil do paciente
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate("/email-admin")}
              >
                Enviar por e-mail
              </Button>
              <Button variant="ghost" onClick={handleCreateAnother}>
                Criar outro plano
              </Button>
            </div>
          </Card>
        )}

        {!saveSuccess && generatedPlan && <DietPlanDisplay plan={generatedPlan} onSave={handleSave} onDiscard={() => setGeneratedPlan(null)} isSaving={saving} saveSuccess={saveSuccess} />}

        {!loading && !generatedPlan && !apiError && selectedPatient && (
          <div className="flex flex-col items-center justify-center p-10 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <UtensilsIcon className="w-8 h-8" />
            </div>
            <p className="mt-4 text-lg font-bold text-slate-700 dark:text-slate-200">Aguardando Geração</p>
            <p className="text-sm text-slate-500">Preencha as etapas e clique em "Gerar Plano Alimentar".</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DietGenerator;
