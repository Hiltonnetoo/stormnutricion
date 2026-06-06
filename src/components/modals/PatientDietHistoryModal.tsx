import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getDietPlansForPatient, deleteDietPlan } from "../../services/firebaseService";
import type { Patient, DietPlan, AnyDietPlan } from "../../types";
import { CloseIcon, UtensilsIcon, DownloadIcon, EditIcon, TrashIcon } from "../icons";
import DietPlanViewer from "../DietPlanViewer";
import ExportDietModal from "./ExportDietModal";
import { ConfirmationModal } from "./PatientModal";
import { useNavigate } from "react-router-dom";
import { Badge } from "../ui";

interface PatientDietHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
}

const PatientDietHistoryModal: React.FC<PatientDietHistoryModalProps> = ({ isOpen, onClose, patient }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [diets, setDiets] = useState<AnyDietPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDiet, setSelectedDiet] = useState<AnyDietPlan | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [dietToDelete, setDietToDelete] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (isOpen && currentUser && patient.id) {
      setLoading(true);
      const unsubscribe = getDietPlansForPatient(currentUser.uid, patient.id, (fetchedDiets) => {
        setDiets(fetchedDiets);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [isOpen, currentUser, patient.id]);

  const handleEditDiet = (diet: DietPlan) => {
    sessionStorage.setItem("dietToEdit", JSON.stringify(diet));
    sessionStorage.setItem("patientForDiet", JSON.stringify(patient));
    onClose();
    navigate("/diet-generator");
  };

  const handleDeleteDiet = async (dietId: string) => {
    setDietToDelete(dietId);
  };

  const confirmDeleteDiet = async () => {
    if (!currentUser || !dietToDelete) return;
    setDeleteError("");
    try {
      await deleteDietPlan(currentUser.uid, dietToDelete);
    } catch (error) {
      console.error("Error deleting diet:", error);
      setDeleteError("Não foi possível excluir o plano. Verifique sua conexão e tente novamente.");
    } finally {
      setDietToDelete(null);
    }
  };

  if (!isOpen) return null;

  const confirmDelete = (
    <ConfirmationModal
      isOpen={!!dietToDelete}
      onClose={() => setDietToDelete(null)}
      onConfirm={confirmDeleteDiet}
      title="Excluir plano alimentar"
      message="Esta ação é permanente. O plano será removido do histórico e não poderá ser recuperado."
      confirmText="Excluir plano"
    />
  );

  const overlay = "fixed inset-0 z-50 flex justify-center items-center p-4";
  const backdrop = "absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in";
  const panel = "relative bg-white dark:bg-slate-850 rounded-3xl shadow-pop border border-slate-200/70 dark:border-slate-700/60 w-full flex flex-col max-h-[95vh] animate-scale-in";

  if (selectedDiet) {
    const isV2 = (selectedDiet as DietPlan).version === 2;
    return (
      <>
        {confirmDelete}
        <div className={overlay}>
          <div className={backdrop} onClick={() => setSelectedDiet(null)} />
          <div className={`${panel} max-w-4xl`} onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Dieta de {new Date(selectedDiet.createdAt).toLocaleDateString("pt-BR")}
              </h2>
              <div className="flex items-center gap-2 no-export">
                {isV2 && (
                  <>
                    <button onClick={() => handleEditDiet(selectedDiet as DietPlan)} className="btn-secondary btn-sm">
                      <EditIcon className="w-4 h-4" /> Editar
                    </button>
                    <button onClick={() => setIsExportModalOpen(true)} className="btn-secondary btn-sm">
                      <DownloadIcon className="w-4 h-4" /> Exportar
                    </button>
                  </>
                )}
                <button onClick={() => setSelectedDiet(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors dark:hover:bg-slate-800">
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div id="diet-plan-viewer-content" className="p-6 overflow-y-auto">
              <DietPlanViewer plan={selectedDiet as DietPlan} patient={patient} />
            </div>
          </div>
        </div>
        {isV2 && (
          <ExportDietModal
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            plan={selectedDiet as DietPlan}
            targetElementId="diet-plan-viewer-content"
          />
        )}
      </>
    );
  }

  return (
    <>
    {confirmDelete}
    <div className={overlay}>
      <div className={backdrop} onClick={onClose} />
      <div className={`${panel} max-w-2xl`} onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Histórico de Dietas de {patient.firstName}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors dark:hover:bg-slate-800">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {loading && <p className="text-sm text-slate-400 text-center py-8">Carregando histórico...</p>}
          {!loading && diets.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <UtensilsIcon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">Nenhuma dieta encontrada</h3>
              <p className="mt-1 text-sm text-slate-400">Este paciente ainda não possui planos alimentares salvos.</p>
            </div>
          )}
          {deleteError && (
            <p className="mb-3 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">{deleteError}</p>
          )}
          {!loading && diets.length > 0 && (
            <ul className="space-y-2">
              {diets.map((diet) => (
                <li key={diet.id} className="flex justify-between items-center p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-800 dark:text-white">Plano Alimentar</p>
                      <Badge tone={(diet as DietPlan).version === 2 ? "sage" : "slate"}>
                        {(diet as DietPlan).version === 2 ? "v2" : "v1 (Legado)"}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Criado em {new Date(diet.createdAt).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setSelectedDiet(diet)} className="px-3 py-1.5 text-xs font-bold text-sage-700 bg-sage-50 border border-sage-200 rounded-lg hover:bg-sage-100 transition-colors">
                      Visualizar
                    </button>
                    {(diet as DietPlan).version === 2 && (
                      <button onClick={() => handleEditDiet(diet as DietPlan)} className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors" title="Editar">
                        <EditIcon className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => diet.id && handleDeleteDiet(diet.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Excluir">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default PatientDietHistoryModal;
