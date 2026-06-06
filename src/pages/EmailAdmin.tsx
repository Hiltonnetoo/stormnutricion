import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getPatients, getDietPlansForPatient } from "../services/firebaseService";
import { sendDietEmail, isEmailConfigured } from "../services/emailService";
import {
  CheckCircleIcon,
  XCircleIcon,
  PaperAirplaneIcon,
} from "../components/icons";
import type { Patient, EmailLog, AnyDietPlan } from "../types";
import { PageHeader, Card, Button } from "../components/ui";

const selectClass = "input-field";

const EmailAdmin: React.FC = () => {
  const { currentUser } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [dietPlans, setDietPlans] = useState<AnyDietPlan[]>([]);
  const [selectedDietId, setSelectedDietId] = useState<string>("");
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<"success" | "error" | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState("");
  const [sendErrorMsg, setSendErrorMsg] = useState("");
  const emailReady = isEmailConfigured();

  useEffect(() => {
    if (currentUser) {
      const unsubscribe = getPatients(currentUser.uid, setPatients, (error) => {
        console.error("EmailAdmin: Error fetching patients", error);
        setLoadError("Falha ao carregar a lista de pacientes.");
      });
      return () => unsubscribe();
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && selectedPatientId) {
      const unsubscribe = getDietPlansForPatient(currentUser.uid, selectedPatientId, setDietPlans, (error) => {
        console.error("EmailAdmin: Error fetching diets", error);
        setLoadError("Falha ao carregar os planos alimentares.");
      });
      setSelectedDietId("");
      return () => unsubscribe();
    } else {
      setDietPlans([]);
    }
  }, [currentUser, selectedPatientId]);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !selectedDietId) {
      setValidationError("Selecione um paciente e um plano de dieta antes de continuar.");
      return;
    }
    setValidationError("");
    const patient = patients.find((p) => p.id === selectedPatientId);
    const diet = dietPlans.find((d) => d.id === selectedDietId);
    if (!patient || !diet) {
      setSendStatus("error");
      return;
    }

    setIsSending(true);
    setSendStatus(null);
    setSendErrorMsg("");

    const dietDate = new Date(diet.createdAt).toLocaleDateString("pt-BR");
    try {
      await sendDietEmail({
        toEmail: patient.email,
        toName: `${patient.firstName} ${patient.lastName}`,
        fromName:
          localStorage.getItem("clinicName") ||
          currentUser?.displayName ||
          "Seu nutricionista",
        dietDate,
      });
      const newLog: EmailLog = {
        id: String(Date.now()),
        patientName: `${patient.firstName} ${patient.lastName}`,
        patientEmail: patient.email,
        dietDate,
        sentAt: new Date().toISOString(),
        status: "Sent",
      };
      setEmailLogs((prevLogs) => [newLog, ...prevLogs]);
      setSendStatus("success");
      setSelectedPatientId("");
      setSelectedDietId("");
    } catch (err) {
      const notConfigured = err instanceof Error && err.message === "EMAIL_NOT_CONFIGURED";
      setSendErrorMsg(
        notConfigured
          ? "O envio de e-mail ainda não foi configurado. Defina as variáveis VITE_EMAILJS_* no arquivo .env.local (veja .env.example)."
          : "Falha ao enviar o e-mail. Verifique o endereço do paciente e sua conexão, e tente novamente.",
      );
      const newLog: EmailLog = {
        id: String(Date.now()),
        patientName: `${patient.firstName} ${patient.lastName}`,
        patientEmail: patient.email,
        dietDate,
        sentAt: new Date().toISOString(),
        status: "Failed",
      };
      setEmailLogs((prevLogs) => [newLog, ...prevLogs]);
      setSendStatus("error");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-5 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      <PageHeader
        icon={<PaperAirplaneIcon className="w-6 h-6" />}
        title="Mensagens"
        subtitle="Envie planos alimentares por e-mail e acompanhe o histórico de envios."
      />

      {!emailReady && (
        <div className="mb-5 flex items-start gap-3 p-4 bg-sky-50 border border-sky-200 text-sky-800 rounded-xl text-sm">
          <PaperAirplaneIcon className="w-5 h-5 shrink-0 mt-0.5" />
          <span>
            <strong>Configure o envio de e-mails:</strong> defina as variáveis{" "}
            <code className="font-mono text-xs bg-sky-100 px-1 py-0.5 rounded">VITE_EMAILJS_*</code>{" "}
            no arquivo <code className="font-mono text-xs bg-sky-100 px-1 py-0.5 rounded">.env.local</code>{" "}
            (veja o <code className="font-mono text-xs bg-sky-100 px-1 py-0.5 rounded">.env.example</code>) para
            disparar mensagens reais aos pacientes.
          </span>
        </div>
      )}

      {loadError && (
        <div className="mb-5 flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-sm">
          <XCircleIcon className="w-5 h-5 shrink-0" />
          <span>{loadError}</span>
          <button onClick={() => setLoadError(null)} className="ml-auto font-bold hover:text-rose-900">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sender */}
        <Card className="lg:col-span-1 p-6 self-start">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Enviar Dieta por E-mail</h2>
          <form onSubmit={handleSendEmail} className="space-y-4">
            <div>
              <label htmlFor="patient" className="input-label">Paciente</label>
              <select id="patient" value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)} className={selectClass} required>
                <option value="" disabled>-- Selecione um paciente --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="diet-plan" className="input-label">Plano Alimentar</label>
              <select id="diet-plan" value={selectedDietId} onChange={(e) => setSelectedDietId(e.target.value)} disabled={!selectedPatientId || dietPlans.length === 0} className={selectClass} required>
                <option value="" disabled>-- Selecione um plano --</option>
                {dietPlans.map((d) => (
                  <option key={d.id} value={d.id}>Plano de {new Date(d.createdAt).toLocaleDateString("pt-BR")}</option>
                ))}
              </select>
              {selectedPatientId && dietPlans.length === 0 && (
                <p className="text-xs text-slate-400 mt-1.5">Este paciente não possui dietas salvas.</p>
              )}
            </div>
            <Button type="submit" fullWidth loading={isSending} disabled={isSending || !selectedDietId} leftIcon={<PaperAirplaneIcon className="w-5 h-5" />}>
              {isSending ? "Enviando..." : "Enviar E-mail"}
            </Button>
            {validationError && (
              <p className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2"><XCircleIcon className="w-4 h-4 shrink-0" /> {validationError}</p>
            )}
            {sendStatus === "success" && (
              <p className="flex items-center gap-2 text-sm text-sage-700 font-medium"><CheckCircleIcon className="w-4 h-4" /> E-mail enviado com sucesso!</p>
            )}
            {sendStatus === "error" && (
              <p className="flex items-start gap-2 text-sm text-rose-600 font-medium"><XCircleIcon className="w-4 h-4 shrink-0 mt-0.5" /> {sendErrorMsg || "Falha ao enviar e-mail. Tente novamente."}</p>
            )}
          </form>
        </Card>

        {/* Logs */}
        <Card className="lg:col-span-2 overflow-hidden">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white p-6 pb-4">Histórico de Envios</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-y border-slate-100 dark:border-slate-800">
                  {["Paciente", "Dieta", "Status"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {emailLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-3.5">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{log.patientName}</p>
                      <p className="text-xs text-slate-400">{log.patientEmail}</p>
                    </td>
                    <td className="px-6 py-3.5 text-sm text-slate-500 whitespace-nowrap">Plano de {log.dietDate}</td>
                    <td className="px-6 py-3.5">
                      <span className={`badge ${log.status === "Sent" ? "badge-emerald" : "badge-rose"}`}>
                        {log.status === "Sent" ? <CheckCircleIcon className="w-3.5 h-3.5" /> : <XCircleIcon className="w-3.5 h-3.5" />}
                        {log.status === "Sent" ? "Enviado" : "Falhou"}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-1">{new Date(log.sentAt).toLocaleString("pt-BR")}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EmailAdmin;
