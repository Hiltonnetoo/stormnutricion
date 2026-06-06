import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import type { Patient, AnyDietPlan } from "../types";
import {
  SearchIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  UsersIcon,
} from "../components/icons";
import { useAuth } from "../contexts/AuthContext";
import {
  getPatients,
  deletePatient,
  getAllDiets,
} from "../services/firebaseService";
import PatientDietHistoryModal from "../components/modals/PatientDietHistoryModal";
import NewPatientModal from "../components/modals/NewPatientModal";
import { ConfirmationModal } from "../components/modals/PatientModal";
import LoadingState from "../components/patient-list/LoadingState";
import EmptyState from "../components/patient-list/EmptyState";
import PatientAccessModal from "../components/modals/PatientAccessModal";
import { PageHeader, Input, Button, Badge } from "../components/ui";

/* ----------------------------------------------------------------- Toast */
interface ToastProps {
  title: string;
  message: string;
  type: "success" | "error" | "warning";
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ title, message, type, onClose }) => (
  <div className="fixed top-4 left-4 right-4 sm:left-auto sm:w-full sm:max-w-sm z-50 animate-fade-in-down">
    <div className="flex items-start gap-3 rounded-2xl bg-white border border-slate-200 shadow-pop p-4">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
          type === "success"
            ? "bg-sage-50 text-sage-600"
            : type === "warning"
            ? "bg-amber-50 text-amber-600"
            : "bg-rose-50 text-rose-600"
        }`}
      >
        {type === "success" ? (
          <CheckCircleIcon className="h-5 w-5" />
        ) : type === "warning" ? (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        ) : (
          <XCircleIcon className="h-5 w-5" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-900">{title}</p>
        <p className="mt-0.5 text-sm text-slate-500">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-100 transition-colors"
        aria-label="Fechar"
      >
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
        </svg>
      </button>
    </div>
  </div>
);

const PortalLinkIcon: React.FC<{ active?: boolean }> = ({ active }) => (
  <svg className={`w-5 h-5 ${active ? "text-teal-500" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
);

const Patients: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [allDiets, setAllDiets] = useState<AnyDietPlan[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedPatientForHistory, setSelectedPatientForHistory] = useState<Patient | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ title: string; message: string; type: "success" | "error" | "warning" } | null>(null);
  const [portalPatient, setPortalPatient] = useState<Patient | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (toastInfo: { title: string; message: string; type: "success" | "error" | "warning" }) => {
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
          setLoading(false);
          showToast({ title: "Erro", message: "Falha ao carregar os pacientes.", type: "error" });
        },
      );
      const unsubscribeDiets = getAllDiets(
        currentUser.uid,
        (fetchedDiets) => setAllDiets(fetchedDiets),
        (error) => {
          console.error("Error fetching diets:", error);
          showToast({ title: "Erro", message: "Falha ao carregar as dietas.", type: "error" });
        },
      );
      return () => {
        unsubscribePatients();
        unsubscribeDiets();
      };
    }
  }, [currentUser]);

  const latestDietByPatient = useMemo(() => {
    const dietMap = new Map<string, AnyDietPlan>();
    allDiets.forEach((diet) => {
      if (!dietMap.has(diet.patientId)) dietMap.set(diet.patientId, diet);
    });
    return dietMap;
  }, [allDiets]);

  const getDietStatus = (patientId: string): { text: string; tone: "emerald" | "amber" | "slate" } => {
    const diet = latestDietByPatient.get(patientId);
    if (!diet || !diet.id) return { text: "Sem dieta", tone: "slate" };
    const patient = patients.find((p) => p.id === patientId);
    if (patient?.dietNeedsReview) return { text: "Requer revisão", tone: "amber" };
    const dietDate = new Date(diet.createdAt);
    const formattedDate = dietDate.toLocaleDateString("pt-BR");
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return dietDate > thirtyDaysAgo
      ? { text: `Ativa · ${formattedDate}`, tone: "emerald" }
      : { text: `Desatualizada · ${formattedDate}`, tone: "amber" };
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
  const promptDeletePatient = (patient: Patient) => setPatientToDelete(patient);

  const executeDeletePatient = async () => {
    if (!patientToDelete || !patientToDelete.id || !currentUser) return;
    setIsDeleting(true);
    try {
      await deletePatient(currentUser.uid, patientToDelete.id);
      showToast({ title: "Sucesso!", message: "Paciente excluído com sucesso!", type: "success" });
    } catch (error) {
      console.error("Error deleting patient:", error);
      showToast({ title: "Erro!", message: "Falha ao excluir paciente.", type: "error" });
    } finally {
      setPatientToDelete(null);
      setIsDeleting(false);
    }
  };

  const getAge = (dob: string) => {
    if (!dob || typeof dob !== "string" || !/^\d{2}\/\d{2}\/\d{4}$/.test(dob)) return "N/A";
    const [day, month, year] = dob.split("/").map(Number);
    const birthDate = new Date(year, month - 1, day);
    if (isNaN(birthDate.getTime())) return "N/A";
    const ageDate = new Date(Date.now() - birthDate.getTime());
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    return age >= 0 ? age : "N/A";
  };

  const filteredPatients = patients.filter(
    (patient) =>
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const ActionButtons: React.FC<{ patient: Patient }> = ({ patient }) => {
    const isOpen = openMenuId === patient.id;
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

    const computePosition = () => {
      const el = triggerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // Abre para cima quando há pouco espaço abaixo, garantindo que todas as
      // opções (inclusive "Excluir") fiquem sempre visíveis (correção D2).
      const openUp = spaceBelow < 240 && rect.top > spaceBelow;
      const right = Math.max(8, window.innerWidth - rect.right);
      setMenuStyle(
        openUp
          ? { position: "fixed", bottom: window.innerHeight - rect.top + 4, right, maxHeight: rect.top - 16 }
          : { position: "fixed", top: rect.bottom + 4, right, maxHeight: window.innerHeight - rect.bottom - 16 },
      );
    };

    const handleToggle = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isOpen) computePosition();
      setOpenMenuId(isOpen ? null : patient.id!);
    };

    // Fecha ao clicar fora, rolar a página ou redimensionar (posição é fixa).
    useEffect(() => {
      if (!isOpen) return;
      const onDocMouseDown = (ev: MouseEvent) => {
        const t = ev.target as Node;
        if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return;
        setOpenMenuId(null);
      };
      const onScrollOrResize = () => setOpenMenuId(null);
      const onKey = (ev: KeyboardEvent) => { if (ev.key === "Escape") setOpenMenuId(null); };
      document.addEventListener("mousedown", onDocMouseDown);
      window.addEventListener("scroll", onScrollOrResize, true);
      window.addEventListener("resize", onScrollOrResize);
      document.addEventListener("keydown", onKey);
      return () => {
        document.removeEventListener("mousedown", onDocMouseDown);
        window.removeEventListener("scroll", onScrollOrResize, true);
        window.removeEventListener("resize", onScrollOrResize);
        document.removeEventListener("keydown", onKey);
      };
    }, [isOpen]);

    const itemCls =
      "flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors";

    return (
      <>
        <button
          ref={triggerRef}
          onClick={handleToggle}
          aria-label="Mais ações"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          className="flex items-center justify-center w-10 h-10 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 5.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 5.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
          </svg>
        </button>
        {isOpen &&
          createPortal(
            <div
              ref={menuRef}
              role="menu"
              style={menuStyle}
              className="z-[100] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-pop min-w-[210px] overflow-y-auto py-1 animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <button role="menuitem" onClick={() => { handleViewHistory(patient); setOpenMenuId(null); }} className={itemCls}>
                <DocumentTextIcon className="w-4 h-4 text-slate-400 shrink-0" />
                Histórico de dietas
              </button>
              <button role="menuitem" onClick={() => { setPortalPatient(patient); setOpenMenuId(null); }} className={itemCls}>
                <PortalLinkIcon active={!!patient.portalUid} />
                {patient.portalUid ? "Gerenciar portal" : "Convidar ao portal"}
              </button>
              <button role="menuitem" onClick={() => { handleEditPatient(patient); setOpenMenuId(null); }} className={itemCls}>
                <EditIcon className="w-4 h-4 text-slate-400 shrink-0" />
                Editar paciente
              </button>
              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
              <button
                role="menuitem"
                onClick={() => { promptDeletePatient(patient); setOpenMenuId(null); }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
              >
                <TrashIcon className="w-4 h-4 shrink-0" />
                Excluir paciente
              </button>
            </div>,
            document.body,
          )}
      </>
    );
  };

  const renderContent = () => {
    if (loading) return <LoadingState />;
    if (patients.length === 0) return <EmptyState onAddPatient={handleAddPatient} />;
    if (filteredPatients.length === 0)
      return (
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <SearchIcon className="w-6 h-6" />
          </div>
          <p className="font-semibold text-slate-700">Nenhum resultado para “{searchTerm}”</p>
          <p className="text-sm text-slate-400 mt-1">Tente buscar por outro nome ou e-mail.</p>
        </div>
      );

    return (
      <>
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                {["Paciente", "Idade", "Status da Dieta", ""].map((h, i) => (
                  <th key={i} className={`px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider ${i === 3 ? "text-right" : "text-left"}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPatients.map((patient) => {
                const dietStatus = getDietStatus(patient.id!);
                return (
                  <tr key={patient.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group">
                    <td className="px-6 py-3.5 cursor-pointer" onClick={() => navigate(`/patients/${patient.id}`)}>
                      <div className="flex items-center gap-3">
                        <img className="h-10 w-10 rounded-xl object-cover ring-2 ring-white shadow-sm group-hover:scale-105 transition-transform" src={patient.avatarUrl} alt="" />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-sage-600 transition-colors truncate">
                            {patient.firstName} {patient.lastName}
                          </p>
                          <p className="text-xs text-slate-400 truncate">{patient.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-sm text-slate-500 whitespace-nowrap">{getAge(patient.dob)} anos</td>
                    <td className="px-6 py-3.5"><Badge tone={dietStatus.tone}>{dietStatus.text}</Badge></td>
                    <td className="px-6 py-3.5 text-right"><div className="flex justify-end"><ActionButtons patient={patient} /></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {filteredPatients.map((patient) => {
            const dietStatus = getDietStatus(patient.id!);
            return (
              <div key={patient.id} className="p-4">
                <div className="flex items-center gap-3" onClick={() => navigate(`/patients/${patient.id}`)}>
                  <img className="h-11 w-11 rounded-xl object-cover ring-2 ring-white shadow-sm" src={patient.avatarUrl} alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{patient.firstName} {patient.lastName}</p>
                    <p className="text-xs text-slate-400">{getAge(patient.dob)} anos</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Badge tone={dietStatus.tone}>{dietStatus.text}</Badge>
                  <ActionButtons patient={patient} />
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <div className="p-5 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <PageHeader
        icon={<UsersIcon className="w-6 h-6" />}
        title="Pacientes"
        subtitle="Gerencie seus pacientes e acompanhe o progresso."
        actions={
          <Button onClick={handleAddPatient} leftIcon={<PlusIcon className="h-5 w-5" />}>
            Novo Paciente
          </Button>
        }
      />

      <div className="mb-5 max-w-md">
        <Input
          leftIcon={<SearchIcon className="h-4 w-4" />}
          placeholder="Buscar por nome ou e-mail..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="card overflow-hidden">{renderContent()}</div>

      {patients.length > 0 && !loading && (
        <p className="mt-4 text-sm text-slate-400">
          {filteredPatients.length} de {patients.length} paciente{patients.length !== 1 ? "s" : ""}
        </p>
      )}

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
          onClose={() => {
            setIsHistoryModalOpen(false);
            setSelectedPatientForHistory(null);
          }}
          patient={selectedPatientForHistory}
        />
      )}
      <ConfirmationModal
        isOpen={!!patientToDelete}
        onClose={() => !isDeleting && setPatientToDelete(null)}
        onConfirm={executeDeletePatient}
        isConfirmLoading={isDeleting}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja remover ${patientToDelete?.firstName}? Todos os dados e dietas serão perdidos.`}
      />
      {portalPatient && (
        <PatientAccessModal patient={portalPatient} onClose={() => setPortalPatient(null)} />
      )}
    </div>
  );
};

export default Patients;
