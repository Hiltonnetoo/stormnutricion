import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getPatientById,
  getPatientDiets,
  requestSelfEvaluation,
  updatePatientSettings,
  deleteDietPlan,
  type User,
} from "../services/firebaseService";
import { useAuth } from "../contexts/AuthContext";
import type { Patient, DietPlan } from "../types";
import LoadingState from "../components/patient-list/LoadingState";
import WeightEvolutionChart from "../components/patient-profile/WeightEvolutionChart";
import BiomarkerEvolutionChart from "../components/patient-profile/BiomarkerEvolutionChart";
import DietPlanViewer from "../components/DietPlanViewer";
import ExportDietModal from "../components/modals/ExportDietModal";
import { ConfirmationModal } from "../components/modals/PatientModal";
import { Card, Badge, Button } from "../components/ui";
import { calcAge } from "../utils/calcAge";
import { DownloadIcon, EditIcon, TrashIcon } from "../components/icons";

type TabId = "timeline" | "evolution" | "exams" | "diets" | "assessment";

const modeTone: Record<string, string> = {
  clinical: "bg-rose-100 text-rose-700",
  performance: "bg-sky-100 text-sky-700",
  recovery: "bg-violet-100 text-violet-700",
};

const modeLabels: Record<string, string> = {
  general: "Geral",
  clinical: "Clínico",
  performance: "Performance",
  recovery: "Recuperação",
  pediatric: "Pediátrico",
};

const goalLabels: Record<string, string> = {
  weight_loss: "Emagrecimento",
  weight_gain: "Ganho de massa",
  maintenance: "Manutenção",
  clinical_control: "Controle clínico",
  performance: "Performance",
};

const PatientProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [diets, setDiets] = useState<DietPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("timeline");
  const [selectedDietIds, setSelectedDietIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [viewingDiet, setViewingDiet] = useState<DietPlan | null>(null);
  const [exportDiet, setExportDiet] = useState<DietPlan | null>(null);
  const [dietToDelete, setDietToDelete] = useState<string | null>(null);
  const [dietActionError, setDietActionError] = useState("");

  useEffect(() => {
    let unsubDiets: (() => void) | undefined;
    if (currentUser && id) {
      setLoading(true);
      setLoadError(false);
      const fetchPatient = async () => {
        try {
          const patientData = await getPatientById(currentUser.uid, id);
          if (patientData) {
            setPatient(patientData as Patient);
            unsubDiets = getPatientDiets(currentUser.uid, id, (patientDiets) => {
              setDiets(patientDiets as DietPlan[]);
            });
          } else {
            navigate("/patients");
          }
        } catch (error) {
          console.error("Error fetching patient profile:", error);
          setLoadError(true);
        } finally {
          setLoading(false);
        }
      };
      fetchPatient();
    }
    return () => {
      if (unsubDiets) unsubDiets();
    };
  }, [currentUser, id, navigate]);

  const timelineEvents = useMemo(() => {
    if (!patient) return [];
    const events: { date: string; title: string; description: string; icon: string; type: string }[] = [];
    events.push({
      date: patient.createdAt,
      title: "Paciente Cadastrado",
      description: "Perfil inicial criado no sistema.",
      icon: "👤",
      type: "registration",
    });
    diets.forEach((diet) => {
      events.push({
        date: diet.createdAt,
        title: "Plano Alimentar Gerado",
        description: `${diet.dailyCalories} kcal • Modo ${diet.mode}`,
        icon: "🍲",
        type: "diet",
      });
    });
    if (patient.lastLabExams && patient.lastLabExams.length > 0) {
      events.push({
        date: patient.lastLabExams[0].date || new Date().toISOString(),
        title: "Exames Laboratoriais Registrados",
        description: `${patient.lastLabExams.length} testes informados.`,
        icon: "🧪",
        type: "exam",
      });
    }
    if (patient.selfEvaluations) {
      patient.selfEvaluations.forEach((ev) => {
        if (ev.status === "completed") {
          events.push({
            date: ev.completionDate!,
            title: "Autoavaliação Concluída",
            description: `Peso: ${ev.measurements?.weight}kg | Sono: ${ev.wellbeing?.sleepQuality}/5`,
            icon: "📝",
            type: "evaluation",
          });
        }
      });
    }
    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [patient, diets]);

  if (loading) return <div className="p-6 lg:p-10"><LoadingState /></div>;

  if (loadError) return (
    <div className="p-6 lg:p-10 flex flex-col items-center justify-center gap-6 min-h-[40vh]">
      <div className="text-center max-w-sm">
        <p className="text-5xl mb-4">😕</p>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Não foi possível carregar o perfil</h2>
        <p className="text-sm text-slate-500">Verifique sua conexão e tente novamente. Se o problema persistir, o paciente pode ter sido removido.</p>
      </div>
      <Button onClick={() => navigate("/patients")}>Voltar para Pacientes</Button>
    </div>
  );

  if (!patient) return null;

  const initialWeight = patient.weightHistory?.[0]?.weight || patient.weight;
  const weightDelta = patient.weight - initialWeight;

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: "timeline", label: "Linha do Tempo", icon: "🕒" },
    { id: "evolution", label: "Evolução", icon: "📈" },
    { id: "exams", label: "Exames", icon: "🧪" },
    { id: "diets", label: "Histórico de Dietas", icon: "🍲" },
    { id: "assessment", label: "Avaliação", icon: "📝" },
  ];

  return (
    <div className="p-5 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* ---- Header card ---- */}
      <Card className="p-6 flex flex-col md:flex-row gap-6 items-center md:items-start">
        <img
          src={patient.avatarUrl}
          alt={patient.firstName}
          className="w-24 h-24 rounded-2xl ring-4 ring-sage-50 shadow-md object-cover shrink-0"
        />
        <div className="flex-1 text-center md:text-left min-w-0">
          <div className="flex flex-col md:flex-row md:items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {patient.firstName} {patient.lastName}
            </h1>
            <span className={`mx-auto md:mx-0 w-fit px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest ${modeTone[patient.mode || ""] || "bg-sage-100 text-sage-700"}`}>
              Modo: {modeLabels[patient.mode || ""] || "Geral"}
            </span>
          </div>
          <p className="text-slate-500 mt-1 font-medium">
            {patient.gender === "male" ? "Masculino" : "Feminino"} · {calcAge(patient.dob) || "N/A"} anos · {patient.profession}
          </p>
          <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
            {[
              { icon: "⚖️", label: "Peso Atual", value: `${patient.weight} kg` },
              { icon: "📏", label: "Altura", value: `${(patient.height / 100).toFixed(2).replace(".", ",")} m` },
              { icon: "🎯", label: "Objetivo", value: goalLabels[patient.nutritionalGoal || ""] || "Manutenção" },
            ].map((m) => (
              <div key={m.label} className="flex items-center gap-2.5 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span className="text-lg">{m.icon}</span>
                <div className="text-left">
                  <p className="text-[11px] text-slate-400 font-bold uppercase">{m.label}</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-white capitalize">{m.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 w-full md:w-auto">
          <Button onClick={() => navigate("/calendar", { state: { prePatientId: patient.id, prePatientName: `${patient.firstName} ${patient.lastName}` } })}>Nova Consulta</Button>
          <Button variant="secondary" onClick={() => navigate(`/diet-generator?patient=${patient.id}`)}>Gerar Dieta</Button>
        </div>
      </Card>

      {/* ---- Tabs ---- */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar no-export p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-white dark:bg-slate-700 text-sage-700 dark:text-sage-300 shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ---- Tab content ---- */}
      <div className="min-h-[360px]">
        {activeTab === "timeline" && (
          <div className="max-w-3xl mx-auto py-2">
            <div className="relative border-l-2 border-slate-100 dark:border-slate-700 ml-3 space-y-8">
              {timelineEvents.map((event, i) => (
                <div key={i} className="relative pl-8">
                  <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white dark:bg-slate-850 border-4 border-sage-500" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
                    <h4 className="font-bold text-slate-800 dark:text-white">{event.title}</h4>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      {new Date(event.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                    </span>
                  </div>
                  <Card className="p-4 flex items-start gap-3">
                    <div className="p-2 bg-sage-50 dark:bg-sage-900/30 rounded-lg text-lg shrink-0">{event.icon}</div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 self-center">{event.description}</p>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "evolution" && (
          <div className="py-2 space-y-6">
            <WeightEvolutionChart
              data={
                patient.weightHistory && patient.weightHistory.length > 0
                  ? patient.weightHistory
                  : [{
                      date: patient.createdAt,
                      weight: patient.weight,
                      origin: (patient.anthropometryMetadata?.weightOrigin && patient.anthropometryMetadata.weightOrigin !== "not_available")
                        ? patient.anthropometryMetadata.weightOrigin
                        : "self_reported"
                    }]
              }
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-5">
                <p className="text-[11px] text-slate-400 font-bold uppercase mb-1.5">Peso Inicial</p>
                <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{initialWeight} kg</p>
              </Card>
              <Card className="p-5">
                <p className="text-[11px] text-slate-400 font-bold uppercase mb-1.5">Variação Total</p>
                <p className={`text-2xl font-extrabold ${weightDelta <= 0 ? "text-emerald-600" : "text-sky-600"}`}>
                  {weightDelta.toFixed(1)} kg
                </p>
              </Card>
              <Card className="p-5">
                <p className="text-[11px] text-slate-400 font-bold uppercase mb-1.5">Meta</p>
                <p className="text-2xl font-extrabold text-slate-800 dark:text-white">
                  {patient.nutritionalGoal === "weight_loss" ? "Redução" : patient.nutritionalGoal === "weight_gain" ? "Ganho" : "Manutenção"}
                </p>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "exams" && (
          <div className="space-y-6 py-2">
            <Card className="p-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-5">Evolução de Biomarcadores</h3>
              {patient.labExamHistory && patient.labExamHistory.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <BiomarkerEvolutionChart
                    data={patient.labExamHistory
                      .map((h) => {
                        const raw = h.exams.find((e) => e.name.toLowerCase().includes("glic"))?.value;
                        const parsed = raw ? parseFloat(raw) : 0;
                        return { date: h.date, value: isNaN(parsed) ? 0 : parsed };
                      })
                      .filter((d) => d.value > 0)}
                    label="Glicemia de Jejum" unit="mg/dL" color="#ef4444"
                  />
                  <BiomarkerEvolutionChart
                    data={patient.labExamHistory
                      .map((h) => {
                        const raw = h.exams.find((e) => e.name.toLowerCase().includes("ldl"))?.value;
                        const parsed = raw ? parseFloat(raw) : 0;
                        return { date: h.date, value: isNaN(parsed) ? 0 : parsed };
                      })
                      .filter((d) => d.value > 0)}
                    label="Colesterol LDL" unit="mg/dL" color="#3b82f6"
                  />
                </div>
              ) : (
                <div className="text-center py-10 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                  <p className="text-sm text-slate-400 font-medium">Histórico de exames insuficiente para gerar gráficos de evolução.</p>
                </div>
              )}
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {patient.lastLabExams && patient.lastLabExams.length > 0 ? (
                patient.lastLabExams.map((test, i) => (
                  <Card key={i} className="p-4 flex justify-between items-center">
                    <div>
                      <p className="text-[11px] text-slate-400 font-bold uppercase">{test.name}</p>
                      <p className="text-lg font-bold text-slate-800 dark:text-white">
                        {test.value} <span className="text-xs font-normal text-slate-500">{test.unit}</span>
                      </p>
                    </div>
                    <Badge tone={test.status === "alert" ? "rose" : "emerald"}>
                      {test.status === "alert" ? "ALTERADO" : "NORMAL"}
                    </Badge>
                  </Card>
                ))
              ) : (
                <p className="col-span-2 text-center text-slate-400 py-10">Nenhum exame registrado.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "diets" && (
          <div className="py-2 space-y-5">
            {/* Visualizador inline */}
            {viewingDiet && patient && (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800 flex justify-between items-center">
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">
                    Plano de {new Date(viewingDiet.createdAt).toLocaleDateString("pt-BR")}
                  </h4>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setExportDiet(viewingDiet)} className="btn-secondary btn-sm flex items-center gap-1.5">
                      <DownloadIcon className="w-4 h-4" /> Exportar
                    </button>
                    <button onClick={() => setViewingDiet(null)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors">✕</button>
                  </div>
                </div>
                <div className="p-5 max-h-[60vh] overflow-y-auto" id="diet-plan-viewer-content">
                  <DietPlanViewer plan={viewingDiet} patient={patient} />
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3 justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Planos Alimentares</h3>
              {selectedDietIds.length === 2 ? (
                <Button onClick={() => setIsCompareModalOpen(true)} className="bg-sky-600 hover:bg-sky-700 shadow-sky-600/25">
                  Comparar Selecionadas
                </Button>
              ) : selectedDietIds.length > 0 ? (
                <span className="text-xs text-sky-600 font-bold">Selecione mais uma dieta para comparar</span>
              ) : (
                <span className="text-xs text-slate-400">Clique em uma dieta para selecioná-la e comparar</span>
              )}
            </div>

            {dietActionError && (
              <div className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">{dietActionError}</div>
            )}

            {diets.length === 0 ? (
              <div className="text-center py-14 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                <p className="text-sm text-slate-400 font-medium">{patient?.firstName} ainda não tem um plano.</p>
                <button onClick={() => navigate(`/diet-generator?patient=${patient?.id}`)} className="mt-3 text-sm font-bold text-sage-600 hover:underline">
                  Gerar o primeiro plano →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {diets.map((diet, i) => {
                  const did = diet.id || String(i);
                  const isSelected = selectedDietIds.includes(did);
                  return (
                    <div
                      key={diet.id || i}
                      className={`rounded-2xl border transition-all relative ${
                        isSelected
                          ? "bg-sky-50 dark:bg-sky-900/20 border-sky-200 ring-2 ring-sky-500 shadow-lg"
                          : "bg-white dark:bg-slate-850 border-slate-200/70 dark:border-slate-700 shadow-soft"
                      }`}
                    >
                      {/* Cabeçalho clicável (seleciona para comparar) */}
                      <div
                        className="p-5 cursor-pointer hover:bg-slate-50/60 dark:hover:bg-slate-800/40 rounded-t-2xl transition-colors"
                        onClick={() =>
                          setSelectedDietIds((prev) =>
                            isSelected ? prev.filter((x) => x !== did) : prev.length < 2 ? [...prev, did] : prev,
                          )
                        }
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-6 h-6 bg-sky-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md">✓</div>
                        )}
                        <div className="flex justify-between items-start mb-3">
                          <div className="p-2 bg-sage-50 dark:bg-sage-900/30 rounded-lg text-xl">🍲</div>
                          <span className="text-[11px] font-bold text-slate-400 uppercase">
                            {new Date(diet.createdAt).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 dark:text-white">Plano Alimentar</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{diet.dailyCalories} kcal · {diet.dietType}</p>
                      </div>
                      {/* Barra de ações */}
                      <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-700 flex items-center gap-1.5">
                        <button onClick={() => setViewingDiet(diet)} className="flex-1 text-xs font-semibold text-slate-600 hover:text-sage-700 hover:bg-sage-50 px-2 py-1.5 rounded-lg transition-colors">
                          Ver
                        </button>
                        <button onClick={() => { sessionStorage.setItem("dietToEdit", JSON.stringify(diet)); sessionStorage.setItem("patientForDiet", JSON.stringify(patient)); navigate("/diet-generator"); }} className="flex-1 text-xs font-semibold text-slate-600 hover:text-sky-700 hover:bg-sky-50 px-2 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1">
                          <EditIcon className="w-3.5 h-3.5" /> Editar
                        </button>
                        <button onClick={() => setExportDiet(diet)} className="flex-1 text-xs font-semibold text-slate-600 hover:text-violet-700 hover:bg-violet-50 px-2 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1">
                          <DownloadIcon className="w-3.5 h-3.5" /> Exportar
                        </button>
                        <button onClick={() => { setDietActionError(""); setDietToDelete(diet.id || null); }} className="text-xs font-semibold text-slate-400 hover:text-rose-600 hover:bg-rose-50 px-2 py-1.5 rounded-lg transition-colors">
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Modais de exportar e excluir */}
            {exportDiet && patient && (
              <ExportDietModal isOpen plan={exportDiet} targetElementId="diet-plan-viewer-content" onClose={() => setExportDiet(null)} />
            )}
            <ConfirmationModal
              isOpen={!!dietToDelete}
              onClose={() => setDietToDelete(null)}
              onConfirm={async () => {
                if (!currentUser || !dietToDelete) return;
                try { await deleteDietPlan(currentUser.uid, dietToDelete); }
                catch { setDietActionError("Não foi possível excluir o plano. Tente novamente."); }
                finally { setDietToDelete(null); }
              }}
              title="Excluir plano alimentar"
              message="Esta ação é permanente. O plano será removido do histórico e não poderá ser recuperado."
              confirmText="Excluir plano"
            />
          </div>
        )}

        {activeTab === "assessment" && (
          <AssessmentTab patient={patient} currentUser={currentUser} />
        )}
      </div>

      {/* ---- Compare modal ---- */}
      {isCompareModalOpen && selectedDietIds.length === 2 && (
        <div className="fixed inset-0 bg-slate-50 dark:bg-slate-900 z-[100] flex flex-col animate-fade-in">
          <div className="px-6 py-4 border-b border-slate-200/70 dark:border-slate-800 flex justify-between items-center glass sticky top-0 z-10">
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-3">
                <span className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-xl text-sky-600">📊</span>
                Análise Comparativa
              </h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                Evolução de {patient.firstName} {patient.lastName}
              </p>
            </div>
            <Button variant="ghost" onClick={() => setIsCompareModalOpen(false)}>Fechar</Button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 lg:p-10">
            {(() => {
              /* Ordena por data: índice 0 = mais antigo ("Anterior"), índice 1 = mais recente ("Atual") */
              const sortedCompareDiets = selectedDietIds
                .map(sid => diets.find(d => d.id === sid || diets.indexOf(d) === parseInt(sid)))
                .filter((d): d is DietPlan => !!d)
                .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

              const calDiff = (sortedCompareDiets[1]?.dailyCalories || 0) - (sortedCompareDiets[0]?.dailyCalories || 0);

              return (
                <>
                  <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sortedCompareDiets.map((diet, idx) => (
                      <div key={diet.id || idx} className={`relative p-6 rounded-3xl border-2 shadow-card bg-white dark:bg-slate-850 ${idx === 0 ? "border-sky-100 dark:border-sky-900/40" : "border-emerald-100 dark:border-emerald-900/40"}`}>
                        <div className={`absolute -top-3 -right-3 w-10 h-10 rounded-2xl flex items-center justify-center text-white font-extrabold shadow-lg ${idx === 0 ? "bg-sky-500" : "bg-emerald-500"}`}>
                          {idx + 1}
                        </div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase mb-1 tracking-widest">
                          Plano {idx === 0 ? "Anterior" : "Atual"}
                        </p>
                        <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-6">
                          {new Date(diet.createdAt).toLocaleDateString("pt-BR")}
                        </h3>
                        <p className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-6">
                          {diet.dailyCalories}<span className="text-base font-bold text-slate-400 ml-2">kcal</span>
                        </p>
                        {[
                          ["Proteínas", diet.macronutrients?.proteinGrams, diet.macronutrients?.proteinPercentage],
                          ["Carboidratos", diet.macronutrients?.carbsGrams, diet.macronutrients?.carbsPercentage],
                          ["Gorduras", diet.macronutrients?.fatGrams, diet.macronutrients?.fatPercentage],
                        ].map(([label, grams, pct]) => (
                          <div key={label as string} className="flex items-center justify-between py-2.5 border-t border-slate-100 dark:border-slate-800">
                            <div>
                              <p className="text-xl font-bold text-slate-700 dark:text-slate-200">{(Number(grams) || 0).toFixed(0)}g</p>
                              <p className="text-xs text-slate-400 font-semibold">{label}</p>
                            </div>
                            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold">{pct}%</span>
                          </div>
                        ))}
                        <div className="mt-4">
                          <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                            {diet.dietType}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="max-w-5xl mx-auto mt-8 p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl text-white shadow-pop">
                    <h4 className="text-lg font-extrabold mb-5">Considerações Clínicas da Evolução</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Ajuste Energético</p>
                        <p className="text-3xl font-extrabold">
                          {calDiff > 0 ? "+" : ""}{calDiff}
                          <span className="text-sm ml-2">kcal {calDiff === 0 ? "(sem variação)" : calDiff > 0 ? "de aumento" : "de redução"}</span>
                        </p>
                        <p className="text-slate-400 text-sm leading-relaxed">
                          Comparação pela data: plano anterior ({sortedCompareDiets[0]
                            ? new Date(sortedCompareDiets[0].createdAt).toLocaleDateString("pt-BR")
                            : "—"}) vs. atual ({sortedCompareDiets[1]
                            ? new Date(sortedCompareDiets[1].createdAt).toLocaleDateString("pt-BR")
                            : "—"}).
                        </p>
                      </div>
                      <div className="bg-slate-700/40 p-5 rounded-2xl border border-slate-700">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">Dica de Conduta</p>
                        <p className="text-sm leading-relaxed text-slate-300 italic">
                          "Ao comparar dietas, observe se a redistribuição de macronutrientes está alinhada com os últimos exames laboratoriais, especialmente em casos de resistência à insulina ou dislipidemias."
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------ Assessment tab */
const AssessmentTab: React.FC<{ patient: Patient; currentUser: User | null }> = ({ patient, currentUser }) => {
  const [notification, setNotification] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const notify = (text: string, type: "success" | "error") => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const requestEval = async () => {
    if (!patient || !patient.id || !currentUser) return;
    try {
      await requestSelfEvaluation(currentUser.uid, patient.id);
      notify("Solicitação enviada com sucesso!", "success");
    } catch (error) {
      console.error("Error requesting self-eval:", error);
      notify("Não foi possível enviar a solicitação. Verifique sua conexão e tente novamente.", "error");
    }
  };

  const toggleAutomation = async (checked: boolean) => {
    if (!currentUser || !patient || !patient.id) return;
    try {
      await updatePatientSettings(currentUser.uid, patient.id, {
        autoRequestAssessment: checked,
        intervalDays: patient?.automationSettings?.intervalDays || 15,
      });
      notify(checked ? "Agendamento automático ativado." : "Agendamento automático desativado.", "success");
    } catch (error) {
      console.error("Error updating patient settings:", error);
      notify("Não foi possível salvar as configurações. Tente novamente.", "error");
    }
  };

  const changeInterval = async (intervalDays: number) => {
    if (!currentUser || !patient || !patient.id) return;
    try {
      await updatePatientSettings(currentUser.uid, patient.id, { intervalDays });
      notify(`Intervalo atualizado para ${intervalDays} dias.`, "success");
    } catch (error) {
      console.error("Error updating interval days:", error);
      notify("Não foi possível atualizar o intervalo. Tente novamente.", "error");
    }
  };

  return (
    <div className="py-2">
      {notification && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium border ${notification.type === "success" ? "bg-sage-50 border-sage-200 text-sage-700" : "bg-rose-50 border-rose-200 text-rose-700"}`}>
          {notification.text}
        </div>
      )}
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-5 mb-8">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-white">Protocolos de Autoavaliação</h3>
            <p className="text-sm text-slate-500 max-w-sm mt-1">
              Envie formulários de medição guiada para o paciente preencher via portal. Ideal para acompanhamento remoto.
            </p>
          </div>
          <Button onClick={requestEval} disabled={!!patient?.activeProtocolId} size="lg">
            {patient?.activeProtocolId ? "⏳ Aguardando Paciente..." : "🚀 Solicitar Nova Avaliação"}
          </Button>
        </div>

        {/* Automation */}
        <div className="mb-8 p-5 bg-sky-50 dark:bg-sky-900/20 rounded-2xl border border-sky-100 dark:border-sky-800">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center text-lg shrink-0">🤖</div>
              <div>
                <h4 className="font-bold text-sky-900 dark:text-sky-100 text-sm">Agendamento Automático</h4>
                <p className="text-xs text-sky-600 dark:text-sky-400">Solicitar avaliações recorrentemente sem intervenção manual.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={patient?.automationSettings?.autoRequestAssessment || false}
                onChange={(e) => toggleAutomation(e.target.checked)}
              />
              <div className="w-11 h-6 bg-slate-200 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-slate-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600" />
            </label>
          </div>
          {patient?.automationSettings?.autoRequestAssessment && (
            <div className="mt-4 pt-4 border-t border-sky-100 dark:border-sky-800 flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-sky-700 dark:text-sky-300">Repetir a cada</span>
              <select
                value={patient.automationSettings.intervalDays}
                onChange={(e) => changeInterval(parseInt(e.target.value))}
                className="bg-white dark:bg-slate-800 border border-sky-200 dark:border-sky-700 rounded-lg px-3 py-1 text-xs font-bold text-sky-800 dark:text-sky-200"
              >
                <option value={7}>7 dias</option>
                <option value={15}>15 dias</option>
                <option value={30}>30 dias</option>
              </select>
              <span className="text-[11px] text-sky-400 font-medium">
                {patient.automationSettings.lastAutoRequestDate
                  ? `Último disparado em: ${new Date(patient.automationSettings.lastAutoRequestDate).toLocaleDateString("pt-BR")}`
                  : "Aguardando primeiro ciclo"}
              </span>
            </div>
          )}
        </div>

        {/* History */}
        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Histórico de Protocolos</h4>
        <div className="space-y-3">
          {patient?.selfEvaluations?.length ? (
            [...patient.selfEvaluations].reverse().map((evalItem) => (
              <div key={evalItem.id} className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg ${evalItem.status === "completed" ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>
                    {evalItem.status === "completed" ? "✅" : "⏳"}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white">
                      {evalItem.status === "completed" ? "Avaliação Recebida" : "Aguardando Preenchimento"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {evalItem.status === "completed"
                        ? `Concluída em ${new Date(evalItem.completionDate!).toLocaleDateString("pt-BR")}`
                        : `Solicitada em ${new Date(evalItem.requestDate).toLocaleDateString("pt-BR")}`}
                    </p>
                  </div>
                </div>
                {evalItem.status === "completed" && (
                  <div className="w-full mt-2 sm:mt-0">
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-2">
                      {[
                        ["Peso", evalItem.measurements?.weight != null ? `${evalItem.measurements.weight}kg` : "—"],
                        ["Cintura", evalItem.measurements?.waist != null ? `${evalItem.measurements.waist}cm` : "—"],
                        ["Quadril", evalItem.measurements?.hip != null ? `${evalItem.measurements.hip}cm` : "—"],
                        ["Pescoço", evalItem.measurements?.neck != null ? `${evalItem.measurements.neck}cm` : "—"],
                        ["Sono", evalItem.wellbeing?.sleepQuality != null ? `${evalItem.wellbeing.sleepQuality}/5` : "—"],
                        ["Energia", evalItem.wellbeing?.energyLevel != null ? `${evalItem.wellbeing.energyLevel}/5` : "—"],
                        ["Saciedade", evalItem.wellbeing?.satiety != null ? `${evalItem.wellbeing.satiety}/5` : "—"],
                        ["Digestão", evalItem.wellbeing?.digestiveHealth || "—"],
                      ].map(([l, v]) => (
                        <div key={l} className="text-center px-2 py-1.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                          <p className="text-[9px] font-bold text-slate-400 uppercase">{l}</p>
                          <p className="text-xs font-extrabold text-slate-800 dark:text-white mt-0.5">{v}</p>
                        </div>
                      ))}
                    </div>
                    {evalItem.notes && (
                      <div className="px-3 py-2 bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800 rounded-xl">
                        <p className="text-[11px] font-bold text-sky-600 uppercase mb-0.5">Observações do paciente</p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 italic">"{evalItem.notes}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-2xl">
              <p className="text-sm text-slate-400 font-medium">Nenhum protocolo solicitado ou realizado para este paciente.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PatientProfile;
