import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import {
  getPatients,
  getDietPlansForPatient,
} from "../services/firebaseService";
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
  const { t, i18n } = useTranslation();
  const { currentUser } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [dietPlans, setDietPlans] = useState<AnyDietPlan[]>([]);
  const [selectedDietId, setSelectedDietId] = useState<string>("");
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<"success" | "error" | null>(
    null,
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState("");
  const [sendErrorMsg, setSendErrorMsg] = useState("");
  const emailReady = isEmailConfigured();

  useEffect(() => {
    if (currentUser) {
      const unsubscribe = getPatients(currentUser.uid, setPatients, (error) => {
        console.error("EmailAdmin: Error fetching patients", error);
        setLoadError(t("email_admin.error_load_patients"));
      });
      return () => unsubscribe();
    }
  }, [currentUser, t]);

  useEffect(() => {
    if (currentUser && selectedPatientId) {
      const unsubscribe = getDietPlansForPatient(
        currentUser.uid,
        selectedPatientId,
        setDietPlans,
        (error) => {
          console.error("EmailAdmin: Error fetching diets", error);
          setLoadError(t("email_admin.error_load_diets"));
        },
      );
      setSelectedDietId("");
      return () => unsubscribe();
    } else {
      setDietPlans([]);
    }
  }, [currentUser, selectedPatientId, t]);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !selectedDietId) {
      setValidationError(t("email_admin.validation_error"));
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

    const dietDate = new Date(diet.createdAt).toLocaleDateString(
      i18n.language === "pt" ? "pt-BR" : "en-US",
    );
    try {
      await sendDietEmail({
        toEmail: patient.email,
        toName: `${patient.firstName} ${patient.lastName}`,
        fromName:
          localStorage.getItem("clinicName") ||
          currentUser?.displayName ||
          t("email_admin.default_sender"),
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
      const notConfigured =
        err instanceof Error && err.message === "EMAIL_NOT_CONFIGURED";
      setSendErrorMsg(
        notConfigured
          ? t("email_admin.send_error_not_configured")
          : t("email_admin.send_error_failed"),
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
        title={t("email_admin.title")}
        subtitle={t("email_admin.subtitle")}
      />

      {!emailReady && (
        <div className="mb-5 flex items-start gap-3 p-4 bg-sky-50 border border-sky-200 text-sky-800 rounded-xl text-sm">
          <PaperAirplaneIcon className="w-5 h-5 shrink-0 mt-0.5" />
          <span>
            <strong>{t("email_admin.configure_alert")}</strong>{" "}
            {i18n.language === "en" ? "set" : "defina"} variables{" "}
            <code className="font-mono text-xs bg-sky-100 px-1 py-0.5 rounded">
              VITE_EMAILJS_*
            </code>{" "}
            {i18n.language === "en" ? "in the file" : "no arquivo"}{" "}
            <code className="font-mono text-xs bg-sky-100 px-1 py-0.5 rounded">
              .env.local
            </code>{" "}
            ({i18n.language === "en" ? "see" : "veja o"}{" "}
            <code className="font-mono text-xs bg-sky-100 px-1 py-0.5 rounded">
              .env.example
            </code>
            ){" "}
            {i18n.language === "en"
              ? "to dispatch real messages to patients."
              : "para disparar mensagens reais aos pacientes."}
          </span>
        </div>
      )}

      {loadError && (
        <div className="mb-5 flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-sm">
          <XCircleIcon className="w-5 h-5 shrink-0" />
          <span>{loadError}</span>
          <button
            onClick={() => setLoadError(null)}
            className="ml-auto font-bold hover:text-rose-900"
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sender */}
        <Card className="lg:col-span-1 p-6 self-start">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            {t("email_admin.send_diet_title")}
          </h2>
          <form onSubmit={handleSendEmail} className="space-y-4">
            <div>
              <label htmlFor="patient" className="input-label">
                {t("email_admin.patient_label")}
              </label>
              <select
                id="patient"
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className={selectClass}
                required
              >
                <option value="" disabled>
                  {t("email_admin.select_patient_placeholder")}
                </option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="diet-plan" className="input-label">
                {t("email_admin.diet_label")}
              </label>
              <select
                id="diet-plan"
                value={selectedDietId}
                onChange={(e) => setSelectedDietId(e.target.value)}
                disabled={!selectedPatientId || dietPlans.length === 0}
                className={selectClass}
                required
              >
                <option value="" disabled>
                  {t("email_admin.select_diet_placeholder")}
                </option>
                {dietPlans.map((d) => (
                  <option key={d.id} value={d.id}>
                    {t("email_admin.diet_date_label", {
                      date: new Date(d.createdAt).toLocaleDateString(
                        i18n.language === "pt" ? "pt-BR" : "en-US",
                      ),
                    })}
                  </option>
                ))}
              </select>
              {selectedPatientId && dietPlans.length === 0 && (
                <p className="text-xs text-slate-400 mt-1.5">
                  {t("email_admin.no_diets_alert")}
                </p>
              )}
            </div>
            <Button
              type="submit"
              fullWidth
              loading={isSending}
              disabled={isSending || !selectedDietId}
              leftIcon={<PaperAirplaneIcon className="w-5 h-5" />}
            >
              {isSending
                ? t("email_admin.sending_btn")
                : t("email_admin.send_btn")}
            </Button>
            {validationError && (
              <p className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                <XCircleIcon className="w-4 h-4 shrink-0" /> {validationError}
              </p>
            )}
            {sendStatus === "success" && (
              <p className="flex items-center gap-2 text-sm text-sage-700 font-medium">
                <CheckCircleIcon className="w-4 h-4" />{" "}
                {t("email_admin.send_success")}
              </p>
            )}
            {sendStatus === "error" && (
              <p className="flex items-start gap-2 text-sm text-rose-600 font-medium">
                <XCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />{" "}
                {sendErrorMsg}
              </p>
            )}
          </form>
        </Card>

        {/* Logs */}
        <Card className="lg:col-span-2 overflow-hidden">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white p-6 pb-4">
            {t("email_admin.history_title")}
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-y border-slate-100 dark:border-slate-800">
                  {["patient", "diet", "status"].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider"
                    >
                      {t(`email_admin.th_${h}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {emailLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-6 py-3.5">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {log.patientName}
                      </p>
                      <p className="text-xs text-slate-400">
                        {log.patientEmail}
                      </p>
                    </td>
                    <td className="px-6 py-3.5 text-sm text-slate-500 whitespace-nowrap">
                      {t("email_admin.diet_date_label", { date: log.dietDate })}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`badge ${log.status === "Sent" ? "badge-emerald" : "badge-rose"}`}
                      >
                        {log.status === "Sent" ? (
                          <CheckCircleIcon className="w-3.5 h-3.5" />
                        ) : (
                          <XCircleIcon className="w-3.5 h-3.5" />
                        )}
                        {log.status === "Sent"
                          ? t("email_admin.status_sent")
                          : t("email_admin.status_failed")}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {new Date(log.sentAt).toLocaleString(
                          i18n.language === "pt" ? "pt-BR" : "en-US",
                        )}
                      </p>
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
