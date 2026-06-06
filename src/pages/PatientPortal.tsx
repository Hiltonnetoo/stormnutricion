import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  auth,
  firebaseSignOut,
  getPatientDiets,
  getPatientAppointments,
  logPatientWeight,
  completeSelfEvaluation,
  logAdherence,
  getPatientById,
} from "../services/firebaseService";
import MealOptionTable from "../components/MealOptionTable";
import WeightEvolutionChart from "../components/patient-profile/WeightEvolutionChart";
import type { AnyDietPlan, Appointment, DietPlan, Meal, PatientPortalProfile, WeightRecord, Patient } from "../types";
import { Modal, Button } from "../components/ui";
import { UtensilsIcon } from "../components/icons";

const r = (n: number) => Math.round(n);

/* --------------------------------------------------------- Adherence check-in */
const AdherenceCheckIn: React.FC<{
  nutritionistId: string;
  patientId: string;
  currentLog?: { date: string; followed: boolean }[];
}> = ({ nutritionistId, patientId, currentLog }) => {
  const today = new Date().toISOString().split("T")[0];
  const todayEntry = currentLog?.find((e) => e.date === today);
  const [loading, setLoading] = useState(false);
  const [checkError, setCheckError] = useState("");

  const handleCheck = async (followed: boolean) => {
    setLoading(true);
    setCheckError("");
    try {
      await logAdherence(nutritionistId, patientId, followed);
      window.location.reload();
    } catch (error) {
      console.error(error);
      setCheckError("Não foi possível registrar a adesão. Verifique sua conexão e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (todayEntry)
    return (
      <div className="bg-sage-50 border border-sage-100 rounded-3xl p-5 flex items-center gap-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${todayEntry.followed ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}>
          {todayEntry.followed ? "🌟" : "💪"}
        </div>
        <div>
          <p className="text-xs font-bold text-sage-600 uppercase tracking-wider">Check-in de Hoje</p>
          <p className="font-bold text-slate-800">
            {todayEntry.followed ? "Você seguiu o plano! Parabéns!" : "Plano não seguido. Amanhã é um novo dia!"}
          </p>
        </div>
      </div>
    );

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-soft">
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-2">Adesão de Hoje</h3>
      <p className="text-sm text-slate-500 mb-5">Como foi sua adesão ao plano alimentar hoje?</p>
      {checkError && (
        <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 mb-4">{checkError}</p>
      )}
      <div className="flex gap-3">
        <button onClick={() => handleCheck(true)} disabled={loading} className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50">
          {loading ? "..." : "Segui 100%"}
        </button>
        <button onClick={() => handleCheck(false)} disabled={loading} className="flex-1 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50">
          Não segui
        </button>
      </div>
    </div>
  );
};

/* ------------------------------------------------------- Self-evaluation form */
const SelfEvaluationForm: React.FC<{
  protocolId: string;
  patientProfile: PatientPortalProfile;
  patient: Patient | null;
  onComplete: () => void;
}> = ({ protocolId, patientProfile, patient, onComplete }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    measurements: { weight: patient?.weight || 0, waist: 0, hip: 0, neck: 0 },
    wellbeing: { sleepQuality: 3, energyLevel: 3, satiety: 3, digestiveHealth: "Normal" },
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setSubmitError("");
    try {
      await completeSelfEvaluation(patientProfile.nutritionistId, patientProfile.patientId, protocolId, data);
      onComplete();
    } catch (error) {
      console.error(error);
      setSubmitError("Não foi possível enviar a avaliação. Verifique sua conexão e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const Scale: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => (
    <div className="flex justify-between gap-2">
      {[1, 2, 3, 4, 5].map((v) => (
        <button key={v} onClick={() => onChange(v)} className={`flex-1 py-2 rounded-lg font-bold transition-all ${value === v ? "bg-white text-sky-600" : "bg-white/15 text-white"}`}>
          {v}
        </button>
      ))}
    </div>
  );

  return (
    <div className="bg-sky-600 rounded-3xl p-6 text-white shadow-xl shadow-sky-500/20 animate-scale-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-white/20 rounded-xl text-xl">📝</div>
        <div>
          <h2 className="text-lg font-bold">Nova Autoavaliação</h2>
          <p className="text-xs text-sky-100">Solicitada pela sua nutricionista</p>
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-4 animate-fade-in">
          <p className="text-sm font-bold opacity-80 uppercase tracking-wider">Passo 1: Medidas Atuais</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase opacity-60">Peso (kg)</label>
              <input type="number" step="0.1" value={data.measurements.weight} onChange={(e) => setData({ ...data, measurements: { ...data.measurements, weight: parseFloat(e.target.value) } })} className="w-full bg-white/10 border border-white/20 rounded-xl p-3 font-bold focus:bg-white/20 outline-none transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase opacity-60">Cintura (cm)</label>
              <input type="number" value={data.measurements.waist} onChange={(e) => setData({ ...data, measurements: { ...data.measurements, waist: parseFloat(e.target.value) } })} className="w-full bg-white/10 border border-white/20 rounded-xl p-3 font-bold focus:bg-white/20 outline-none transition-all" />
            </div>
          </div>
          <button onClick={() => setStep(2)} className="w-full py-3.5 bg-white text-sky-600 font-bold rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
            Próximo Passo
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 animate-fade-in">
          <p className="text-sm font-bold opacity-80 uppercase tracking-wider">Passo 2: Qualitativo</p>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase opacity-60">Qualidade do Sono (1-5)</label>
              <Scale value={data.wellbeing.sleepQuality} onChange={(v) => setData({ ...data, wellbeing: { ...data.wellbeing, sleepQuality: v } })} />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase opacity-60">Nível de Energia (1-5)</label>
              <Scale value={data.wellbeing.energyLevel} onChange={(v) => setData({ ...data, wellbeing: { ...data.wellbeing, energyLevel: v } })} />
            </div>
          </div>
          {submitError && (
            <p className="text-sm font-medium bg-white/15 border border-white/30 rounded-xl px-3 py-2">{submitError}</p>
          )}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setStep(1)} className="flex-1 py-3 border border-white/30 font-bold rounded-xl hover:bg-white/10 transition-all">Voltar</button>
            <button onClick={handleSubmit} disabled={loading} className="flex-[2] py-3 bg-white text-sky-600 font-bold rounded-xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
              {loading ? "Enviando..." : "Finalizar e Enviar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------- Section shell */
const Section: React.FC<{ title: string; icon: React.ReactNode; right?: React.ReactNode; children: React.ReactNode }> = ({ title, icon, right, children }) => (
  <div className="bg-white rounded-3xl shadow-soft border border-slate-100 overflow-hidden">
    <div className="px-5 py-4 border-b border-slate-50 flex items-center gap-2">
      <span className="text-sage-600">{icon}</span>
      <h2 className="font-bold text-slate-800 text-sm">{title}</h2>
      {right && <div className="ml-auto">{right}</div>}
    </div>
    {children}
  </div>
);

/* ----------------------------------------------------------------- Portal */
const PatientPortal: React.FC = () => {
  const { patientProfile } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [diets, setDiets] = useState<AnyDietPlan[]>([]);
  const [nextAppt, setNextAppt] = useState<Appointment | null>(null);
  const [expandedDiet, setExpandedDiet] = useState<string | null>(null);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [newWeight, setNewWeight] = useState("");
  const [weightError, setWeightError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  // Estado local para atualização otimista do peso sem recarregar a página (item 1 FASE 1)
  const [localWeight, setLocalWeight] = useState<number | null>(null);
  const [localWeightHistory, setLocalWeightHistory] = useState<WeightRecord[] | null>(null);
  const [weightSavedMsg, setWeightSavedMsg] = useState("");

  useEffect(() => {
    if (!patientProfile) return;
    getPatientById(patientProfile.nutritionistId, patientProfile.patientId).then((p) => {
      if (p) setPatient(p as Patient);
    });
    const unsub1 = getPatientDiets(patientProfile.nutritionistId, patientProfile.patientId, (diets) => setDiets(diets));
    const unsub2 = getPatientAppointments(patientProfile.nutritionistId, patientProfile.patientId, (appts) => {
      const now = new Date().toISOString();
      const upcoming = appts.filter((a) => a.status === "scheduled" && a.dateTime >= now);
      setNextAppt(upcoming[0] || null);
    });
    return () => {
      unsub1?.();
      unsub2?.();
    };
  }, [patientProfile]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  const formatTime = (iso: string) => iso.slice(11, 16);

  // Usa os valores locais (após save otimista) ou os do perfil carregado no login
  const displayWeight = localWeight ?? patient?.weight ?? 0;
  const displayHistory = localWeightHistory ?? patient?.weightHistory ?? [];
  const weightDelta = displayWeight - (displayHistory[0]?.weight ?? displayWeight);

  const saveWeight = async () => {
    if (!newWeight || isSaving || !patientProfile) return;
    const parsed = parseFloat(newWeight);
    // Validação de faixa clínica (item 6 FASE 1)
    if (isNaN(parsed) || parsed < 20 || parsed > 300) {
      setWeightError("Valor fora do intervalo permitido. Informe um peso entre 20 kg e 300 kg.");
      return;
    }
    setWeightError("");
    setIsSaving(true);
    try {
      await logPatientWeight(patientProfile.nutritionistId, patientProfile.patientId, parsed, "self_reported");
      // Atualização otimista: reflete o novo peso imediatamente (item 1 FASE 1)
      const newRecord = { date: new Date().toISOString(), weight: parsed, origin: "self_reported" as const };
      setLocalWeightHistory([...(localWeightHistory ?? patient?.weightHistory ?? []), newRecord]);
      setLocalWeight(parsed);
      setWeightSavedMsg("✅ Peso registrado com sucesso!");
      setIsWeightModalOpen(false);
      setNewWeight("");
      setTimeout(() => setWeightSavedMsg(""), 4000);
    } catch (error) {
      console.error("Error logging weight:", error);
      setWeightError("Não foi possível registrar o peso. Verifique sua conexão e tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-teal-50 to-sky-50">
      {/* Header */}
      <header className="glass border-b border-sage-100 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-sage-600 to-teal-500 p-2 rounded-xl shadow-glow">
              <UtensilsIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Portal do Paciente</p>
              <p className="text-sm font-extrabold text-slate-800 tracking-tight">Isanutri</p>
            </div>
          </div>
          <button onClick={() => firebaseSignOut(auth)} className="text-xs font-semibold text-slate-500 hover:text-rose-500 transition-colors">
            Sair
          </button>
        </div>
      </header>

      <main className="p-4 max-w-4xl mx-auto space-y-6 -mt-10 relative z-10 pb-24">
        {patientProfile && (
          <AdherenceCheckIn nutritionistId={patientProfile.nutritionistId} patientId={patientProfile.patientId} currentLog={patient?.adherenceLog} />
        )}

        {patient?.activeProtocolId && patientProfile && (
          <SelfEvaluationForm protocolId={patient.activeProtocolId} patientProfile={patientProfile} patient={patient} onComplete={() => window.location.reload()} />
        )}

        {/* Next appointment */}
        <Section
          title="Próxima Consulta"
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        >
          <div className="p-5">
            {nextAppt ? (
              <div className="flex items-start gap-4">
                <div className="bg-sage-50 text-sage-700 rounded-xl p-3 text-center min-w-[60px]">
                  <p className="text-2xl font-extrabold">{new Date(nextAppt.dateTime).getDate()}</p>
                  <p className="text-xs font-semibold uppercase">{new Date(nextAppt.dateTime).toLocaleDateString("pt-BR", { month: "short" })}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-800 capitalize">{formatDate(nextAppt.dateTime)}</p>
                  <p className="text-sage-600 font-semibold text-sm mt-0.5">às {formatTime(nextAppt.dateTime)}</p>
                  {nextAppt.notes && <p className="text-slate-500 text-sm mt-2 bg-slate-50 rounded-lg px-3 py-2">{nextAppt.notes}</p>}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">Nenhuma consulta agendada.</p>
            )}
          </div>
        </Section>

        {/* Progress */}
        <Section
          title="Meu Progresso"
          icon={
            <svg className="w-4 h-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          right={
            <button
              onClick={() => {
                setNewWeight(String(patient?.weight || ""));
                setIsWeightModalOpen(true);
              }}
              className="text-[11px] font-bold uppercase bg-sky-50 text-sky-700 px-3 py-1.5 rounded-lg hover:bg-sky-100 transition-colors"
            >
              Registrar Peso
            </button>
          }
        >
          <div className="p-5 space-y-5">
            <WeightEvolutionChart data={displayHistory} />
            {patientProfile && (
              <>
                {weightSavedMsg && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm font-semibold animate-fade-in">
                    {weightSavedMsg}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Variação Total</p>
                    <p className={`text-lg font-extrabold ${weightDelta <= 0 ? "text-emerald-600" : "text-sky-600"}`}>{weightDelta.toFixed(1)} kg</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Peso Atual</p>
                    <p className="text-lg font-extrabold text-slate-800">{displayWeight} kg</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </Section>

        {/* Diet plans */}
        <Section
          title="Meu Plano Alimentar"
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          right={diets.length > 0 ? <span className="badge badge-sage">{diets.length} plano{diets.length > 1 ? "s" : ""}</span> : undefined}
        >
          <div className="divide-y divide-slate-50">
            {diets.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Nenhum plano alimentar disponível ainda.</p>
            ) : (
              diets.map((diet, idx) => {
                const isV2 = (diet as DietPlan).version === 2;
                const d2 = isV2 ? (diet as DietPlan) : null;
                const isExpanded = expandedDiet === (diet.id || String(idx));
                const mac = d2?.macronutrients;

                return (
                  <div key={diet.id || idx}>
                    <button onClick={() => setExpandedDiet(isExpanded ? null : diet.id || String(idx))} className="w-full text-left px-5 py-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{idx === 0 ? "🟢 Plano Atual" : "Plano anterior"}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Início em {d2?.startDate ? new Date(d2.startDate).toLocaleDateString("pt-BR") : new Date(diet.createdAt).toLocaleDateString("pt-BR")}
                            {d2?.durationDays ? ` · Duração: ${d2.durationDays} dias` : ""}
                          </p>
                        </div>
                        <svg className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {isExpanded && d2 && (
                      <div className="px-5 pb-5 space-y-4">
                        {mac && (
                          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-soft">
                            <div className="flex items-center justify-between mb-5">
                              <h3 className="font-bold text-slate-800">Metas do Plano</h3>
                              <span className="badge badge-sage">Meta diária</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              {[
                                { label: "Calorias", value: r(d2.dailyCalories), unit: "kcal", color: "text-slate-800", bg: "bg-slate-100" },
                                { label: "Proteínas", value: r(mac.proteinGrams), unit: "g", color: "text-sky-600", bg: "bg-sky-50" },
                                { label: "Carbos", value: r(mac.carbsGrams), unit: "g", color: "text-amber-600", bg: "bg-amber-50" },
                                { label: "Gorduras", value: r(mac.fatGrams), unit: "g", color: "text-orange-600", bg: "bg-orange-50" },
                              ].map((stat) => (
                                <div key={stat.label} className={`${stat.bg} p-3 rounded-2xl`}>
                                  <p className="text-[11px] font-bold text-slate-500 uppercase">{stat.label}</p>
                                  <div className="flex items-baseline gap-1 mt-1">
                                    <span className={`text-xl font-extrabold ${stat.color}`}>{stat.value}</span>
                                    <span className="text-[11px] font-bold text-slate-400">{stat.unit}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed italic mt-4">
                              "Este plano foi calculado para atingir seu objetivo de{" "}
                              <strong>{d2.dietType === "low_carb" ? "Queima de Gordura" : "Performance e Saúde"}</strong>{" "}
                              através do equilíbrio exato de macronutrientes."
                            </p>
                          </div>
                        )}

                        {/* Meals */}
                        <div className="flex overflow-x-auto md:grid md:grid-cols-2 gap-4 pb-2 no-scrollbar snap-x snap-mandatory">
                          {d2.meals?.map((meal: Meal, mIdx: number) => (
                            <div key={mIdx} className="min-w-[85vw] md:min-w-0 bg-white border border-slate-200 rounded-3xl p-5 shadow-soft snap-center flex flex-col">
                              <div className="flex items-start justify-between mb-4 gap-2">
                                <div className="flex items-center gap-3">
                                  <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-xl">
                                    {["🌅", "☕", "🥗", "🍏", "🍲", "🌙"][mIdx] || "🌙"}
                                  </div>
                                  <div>
                                    <h4 className="font-extrabold text-slate-800">{meal.mealName}</h4>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{meal.time}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-extrabold text-slate-800">{r(meal.calories)} kcal</p>
                                  <p className="text-[11px] font-bold text-slate-400">P:{r(meal.protein)}g C:{r(meal.carbs)}g G:{r(meal.fat)}g</p>
                                </div>
                              </div>
                              <MealOptionTable mainOption={meal.mainOption} alternatives={meal.alternatives} accentColor="teal" />
                            </div>
                          ))}
                        </div>

                        {d2.waterRecommendationLiters && (
                          <div className="flex items-center gap-3 bg-sky-50 border border-sky-100 rounded-xl px-4 py-3">
                            <span className="text-xl">💧</span>
                            <p className="text-sm text-sky-700 font-semibold">Hidratação recomendada: {d2.waterRecommendationLiters}L por dia</p>
                          </div>
                        )}

                        {d2.generalObservations?.length > 0 && (
                          <div className="bg-sage-50 border border-sage-100 rounded-xl p-4">
                            <p className="text-xs font-bold text-sage-700 mb-2 uppercase tracking-wider">Observações</p>
                            <ul className="space-y-1.5">
                              {d2.generalObservations.map((obs: string, i: number) => (
                                <li key={i} className="text-sm text-sage-800 flex items-start gap-2">
                                  <span className="text-sage-400 mt-0.5 shrink-0">•</span>
                                  {obs}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </Section>
      </main>

      {/* Weight modal */}
      <Modal open={isWeightModalOpen} onClose={() => setIsWeightModalOpen(false)} title="Registrar Peso Atual" description="Sua nutricionista acompanhará seu progresso." size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsWeightModalOpen(false)}>Cancelar</Button>
            <Button onClick={saveWeight} loading={isSaving} className="bg-sky-600 hover:bg-sky-700 shadow-sky-600/25">Confirmar</Button>
          </>
        }
      >
        <div className="py-2">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Peso (kg)</label>
          <input
            type="number"
            step="0.1"
            min="20"
            max="300"
            value={newWeight}
            onChange={(e) => { setNewWeight(e.target.value); setWeightError(""); }}
            className={`w-full text-2xl font-extrabold p-4 bg-slate-50 border-2 focus:bg-white rounded-2xl outline-none transition-all text-center ${weightError ? "border-rose-400 focus:border-rose-500" : "border-transparent focus:border-sky-500"}`}
            placeholder="0.0"
            autoFocus
          />
          {weightError && (
            <p className="mt-2 text-xs font-medium text-rose-600 text-center">{weightError}</p>
          )}
          <p className="mt-1.5 text-[11px] text-slate-400 text-center">Intervalo aceito: 20 kg – 300 kg</p>
        </div>
      </Modal>
    </div>
  );
};

export default PatientPortal;
