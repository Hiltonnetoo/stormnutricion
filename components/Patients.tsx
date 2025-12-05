import React, { useState, useEffect, useMemo } from 'react';
import type { Patient, AnyDietPlan } from '../types';
import { SearchIcon, PlusIcon, EditIcon, TrashIcon, DocumentTextIcon, CheckCircleIcon, XCircleIcon } from './icons';
import { useAuth } from '../contexts/AuthContext';
import { getPatients, deletePatient, getAllDiets } from '../services/firebaseService';
import PatientDietHistoryModal from './modals/PatientDietHistoryModal';
import NewPatientModal from './modals/NewPatientModal';
import { ConfirmationModal } from './modals/PatientModal';
import LoadingState from './patient-list/LoadingState';
import EmptyState from './patient-list/EmptyState';

interface ToastProps {
  title: string;
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ title, message, type, onClose }) => {
  const bgColor = type === 'success' ? 'bg-sage-600' : 'bg-red-600';
  const icon = type === 'success' ? <CheckCircleIcon className="h-6 w-6 text-white" /> : <XCircleIcon className="h-6 w-6 text-white" />;

  return (
    <div className="fixed top-4 left-4 right-4 sm:left-auto sm:w-full sm:max-w-md z-50 animate-fade-in-down">
      <div className={`${bgColor} text-white rounded-xl shadow-xl pointer-events-auto overflow-hidden`}>
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">{icon}</div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-bold">{title}</p>
              <p className="mt-1 text-sm opacity-90">{message}</p>
            </div>
            <div className="ml-4 flex-shrink-0 flex items-center">
              <button
                onClick={onClose}
                className="inline-flex rounded-md p-1.5 text-white hover:bg-white/20 focus:outline-none"
              >
                <span className="sr-only">Close</span>
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


const Patients = () => {
    const { currentUser } = useAuth();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [allDiets, setAllDiets] = useState<AnyDietPlan[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedPatientForHistory, setSelectedPatientForHistory] = useState<Patient | null>(null);
    const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
    const [toast, setToast] = useState<{ title: string, message: string, type: 'success' | 'error' } | null>(null);


    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 5000); // Auto-hide after 5 seconds
            return () => clearTimeout(timer);
        }
    }, [toast]);
    
    const showToast = (toastInfo: { title: string, message: string, type: 'success' | 'error' }) => {
        setToast(toastInfo);
    };

    useEffect(() => {
        if (currentUser) {
            setLoading(true);
            const unsubscribePatients = getPatients(
                currentUser.uid, 
                (fetchedPatients) => {
                    setPatients(fetchedPatients);
                    setLoading(false);
                },
                (error) => {
                    console.error("Error fetching patients:", error);
                    setLoading(false); // Stop loading even on error
                    // Optionally show a toast here, but might be annoying on initial permission check
                }
            );

            const unsubscribeDiets = getAllDiets(
                currentUser.uid, 
                (fetchedDiets) => {
                    setAllDiets(fetchedDiets);
                },
                (error) => {
                    console.error("Error fetching diets:", error);
                }
            );

            return () => {
                unsubscribePatients();
                unsubscribeDiets();
            };
        }
    }, [currentUser]);

    const latestDietByPatient = useMemo(() => {
        const dietMap = new Map<string, AnyDietPlan>();
        // Since diets are pre-sorted by date descending from Firestore, the first one we see for a patient is the latest.
        allDiets.forEach(diet => {
            if (!dietMap.has(diet.patientId)) {
                dietMap.set(diet.patientId, diet);
            }
        });
        return dietMap;
    }, [allDiets]);

    const getDietStatus = (patientId: string) => {
        const diet = latestDietByPatient.get(patientId);
        if (!diet || !diet.id) {
            return { text: 'Sem dieta', className: 'bg-slate-100 text-slate-600' };
        }
        
        const dietDate = new Date(diet.createdAt);
        const formattedDate = dietDate.toLocaleDateString('pt-BR');
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        if (dietDate > thirtyDaysAgo) {
            return { text: `Ativa - ${formattedDate}`, className: 'bg-emerald-100 text-emerald-800' };
        } else {
            return { text: `Expirada - ${formattedDate}`, className: 'bg-amber-100 text-amber-800' };
        }
    };

    const handleAddPatient = () => {
        setEditingPatient(null);
        setIsModalOpen(true);
    };

    const handleEditPatient = (patient: Patient) => {
        setEditingPatient(patient);
        setIsModalOpen(true);
    };

    const handleViewHistory = (patient: Patient) => {
        setSelectedPatientForHistory(patient);
        setIsHistoryModalOpen(true);
    };

    const promptDeletePatient = (patient: Patient) => {
        setPatientToDelete(patient);
    };

    const executeDeletePatient = async () => {
        if (!patientToDelete || !patientToDelete.id || !currentUser) return;
        try {
            await deletePatient(currentUser.uid, patientToDelete.id);
            showToast({ title: 'Sucesso!', message: 'Paciente excluído com sucesso!', type: 'success' });
        } catch (error) {
            console.error("Error deleting patient:", error);
            showToast({ title: 'Erro!', message: 'Falha ao excluir paciente.', type: 'error' });
        } finally {
            setPatientToDelete(null);
        }
    };

    const getAge = (dob: string) => {
        if (!dob || typeof dob !== 'string' || !/^\d{2}\/\d{2}\/\d{4}$/.test(dob)) return 'N/A';
        const [day, month, year] = dob.split('/').map(Number);
        const birthDate = new Date(year, month - 1, day);
        if (isNaN(birthDate.getTime())) return 'N/A';
        const ageDifMs = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDifMs);
        const age = Math.abs(ageDate.getUTCFullYear() - 1970);
        return age >= 0 ? age : 'N/A';
    };
    
    const filteredPatients = patients.filter(patient =>
        `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderContent = () => {
        if (loading) {
            return <LoadingState />;
        }
        if (patients.length === 0) {
            return <EmptyState onAddPatient={handleAddPatient} />;
        }
        return (
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-gray-300 uppercase tracking-wider">Nome</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-gray-300 uppercase tracking-wider">Sobrenome</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-gray-300 uppercase tracking-wider">Idade</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-gray-300 uppercase tracking-wider">Status Dieta</th>
                            <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-gray-300 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredPatients.map((patient) => {
                            const dietStatus = getDietStatus(patient.id!);
                            return (
                                <tr key={patient.id} className="hover:bg-slate-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm" src={patient.avatarUrl} alt="" />
                                            <div className="ml-4 text-sm font-semibold text-slate-900 dark:text-white">{patient.firstName}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-gray-300">{patient.lastName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-gray-400">{getAge(patient.dob)} anos</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${dietStatus.className}`}>
                                            {dietStatus.text}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-3">
                                            <button onClick={() => handleViewHistory(patient)} className="p-1.5 text-slate-400 hover:text-sage-600 hover:bg-sage-50 rounded-lg transition-colors" title="Histórico"><DocumentTextIcon className="w-5 h-5"/></button>
                                            <button onClick={() => handleEditPatient(patient)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar"><EditIcon className="w-5 h-5"/></button>
                                            <button onClick={() => promptDeletePatient(patient)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Excluir"><TrashIcon className="w-5 h-5"/></button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        )
    }


    return (
        <div className="p-6 lg:p-10 max-w-7xl mx-auto">
             {toast && <Toast title={toast.title} message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Pacientes</h1>
                    <p className="text-slate-500 mt-1">Gerencie seus pacientes e acompanhe o progresso.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar paciente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent text-sm font-medium shadow-sm transition-all"
                        />
                    </div>
                    <button onClick={handleAddPatient} className="flex items-center justify-center bg-sage-600 text-white font-bold py-2.5 px-5 rounded-xl hover:bg-sage-700 transition-all shadow-lg shadow-sage-500/20 active:scale-95">
                        <PlusIcon className="h-5 w-5 mr-1.5"/>
                        Novo
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-soft overflow-hidden">
                {renderContent()}
            </div>
            
            {isModalOpen && (
                <NewPatientModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingPatient(null);
                    }}
                    patient={editingPatient}
                    showToast={showToast}
                />
            )}
            {isHistoryModalOpen && selectedPatientForHistory && (
                 <PatientDietHistoryModal
                    isOpen={isHistoryModalOpen}
                    onClose={() => { setIsHistoryModalOpen(false); setSelectedPatientForHistory(null); }}
                    patient={selectedPatientForHistory}
                />
            )}
            <ConfirmationModal
                isOpen={!!patientToDelete}
                onClose={() => setPatientToDelete(null)}
                onConfirm={executeDeletePatient}
                title="Confirmar Exclusão"
                message={`Tem certeza que deseja remover ${patientToDelete?.firstName}? Todos os dados e dietas serão perdidos.`}
            />
        </div>
    );
};

export default Patients;