import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getDietPlansForPatient } from '../../services/firebaseService';
import type { Patient, DietPlan, AnyDietPlan } from '../../types';
import { CloseIcon, UtensilsIcon, DownloadIcon, EditIcon } from '../icons';
import DietPlanViewer from '../DietPlanViewer';
import ExportDietModal from './ExportDietModal';
import { useNavigate } from 'react-router-dom';

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
    // A simple way to pass data to the generator is via session storage
    // This avoids complex URL params and is cleared when the browser session ends.
    sessionStorage.setItem('dietToEdit', JSON.stringify(diet));
    sessionStorage.setItem('patientForDiet', JSON.stringify(patient));
    onClose(); // Close the modal
    navigate('/diet-generator');
  };

  if (!isOpen) return null;

  if (selectedDiet) {
    const isV2 = (selectedDiet as DietPlan).version === 2;
    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={() => setSelectedDiet(null)}>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl flex flex-col max-h-[95vh]" onClick={e => e.stopPropagation()}>
                    <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                            Visualizando Dieta de {new Date(selectedDiet.createdAt).toLocaleDateString('pt-BR')}
                        </h2>
                        <div className="flex items-center gap-4 no-export">
                           {isV2 && (
                            <>
                                <button onClick={() => handleEditDiet(selectedDiet as DietPlan)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white dark:bg-gray-600 dark:text-gray-200 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-500">
                                    <EditIcon className="w-4 h-4" />
                                    Editar
                                </button>
                                <button onClick={() => setIsExportModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white dark:bg-gray-600 dark:text-gray-200 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-500">
                                    <DownloadIcon className="w-4 h-4" />
                                    Exportar
                                </button>
                            </>
                           )}
                            <button onClick={() => setSelectedDiet(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <CloseIcon className="w-6 h-6" />
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
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[95vh]" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Histórico de Dietas de {patient.firstName}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {loading && <p>Carregando histórico...</p>}
          {!loading && diets.length === 0 && (
            <div className="text-center py-10">
              <UtensilsIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">Nenhuma dieta encontrada</h3>
              <p className="mt-1 text-sm text-gray-500">Este paciente ainda não possui planos alimentares salvos.</p>
            </div>
          )}
          {!loading && diets.length > 0 && (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {diets.map(diet => (
                <li key={diet.id} className="py-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-sage-600 dark:text-sage-300">
                        Plano Alimentar - {(diet as DietPlan).version === 2 ? 'v2' : 'v1 (Legado)'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Criado em: {new Date(diet.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedDiet(diet)}
                    className="px-3 py-1 text-sm font-medium text-gray-700 bg-white dark:bg-gray-600 dark:text-gray-200 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-500">
                    Visualizar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDietHistoryModal;