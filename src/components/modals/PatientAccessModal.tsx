import React, { useState } from "react";
import { FirebaseError } from "firebase/app";
import { useTranslation } from "react-i18next";
import type { Patient } from "../../types";
import {
  setupPatientPortalAccess,
  sendPortalPasswordReset,
} from "../../services/firebaseService";
import {
  isEmailConfigured,
  sendPortalAccessEmail,
} from "../../services/emailService";
import { useAuth } from "../../contexts/AuthContext";
import { Modal, Button } from "../ui";

interface Props {
  patient: Patient;
  onClose: () => void;
}

const CopyIcon: React.FC = () => (
  <svg
    className="w-4 h-4 text-slate-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
);

const PatientAccessModal: React.FC<Props> = ({ patient, onClose }) => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [password, setPassword] = useState(
    () => Math.random().toString(36).slice(-8) + "A1!",
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isEmailInUse, setIsEmailInUse] = useState(false);
  const [sendEmail, setSendEmail] = useState(isEmailConfigured());
  const [emailStatus, setEmailStatus] = useState<
    "idle" | "sending" | "sent" | "failed"
  >("idle");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const alreadyHasAccess = !!patient.portalUid;

  const handleGenerate = async () => {
    if (!currentUser || !patient.id || !patient.email) return;
    setLoading(true);
    setError("");
    setIsEmailInUse(false);
    setEmailStatus("idle");
    try {
      const defaultSender = t("email_admin.default_sender", {
        defaultValue: "Your nutritionist",
      });
      await setupPatientPortalAccess(
        patient.email,
        password,
        patient.id,
        currentUser.uid,
        currentUser.displayName || currentUser.email || defaultSender,
        currentUser.email || "",
      );

      // Try sending invitation email
      if (sendEmail) {
        setEmailStatus("sending");
        try {
          await sendPortalAccessEmail({
            toEmail: patient.email,
            toName: `${patient.firstName} ${patient.lastName}`,
            fromName:
              currentUser.displayName || currentUser.email || defaultSender,
            portalUrl: window.location.origin + "/#/paciente",
            passwordText: password,
          });
          setEmailStatus("sent");
        } catch (mailErr) {
          console.error("Falha ao enviar e-mail de acesso:", mailErr);
          setEmailStatus("failed");
        }
      }

      setSuccess(true);
    } catch (e) {
      if (
        e instanceof FirebaseError &&
        e.code === "auth/email-already-in-use"
      ) {
        setError(t("modals.patient_access.error_already_use"));
        setIsEmailInUse(true);
      } else {
        setError(t("modals.patient_access.error_create_access"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!patient.email) return;
    setResetLoading(true);
    setError("");
    setResetSuccess(false);
    try {
      await sendPortalPasswordReset(patient.email);
      setResetSuccess(true);
    } catch {
      setError(t("modals.patient_access.error_reset_email"));
    } finally {
      setResetLoading(false);
    }
  };

  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

  return (
    <Modal
      open
      onClose={onClose}
      title={t("modals.patient_access.title")}
      description={`${patient.firstName} ${patient.lastName}`}
      icon={
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 text-xl">
          🔑
        </span>
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {success
              ? t("modals.patient_access.btn_close")
              : t("modals.patient_access.btn_cancel")}
          </Button>
          {!success && !alreadyHasAccess && (
            <Button
              onClick={handleGenerate}
              loading={loading}
              disabled={loading || !patient.email}
            >
              {loading
                ? t("modals.patient_access.btn_creating")
                : t("modals.patient_access.btn_generate")}
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-4 py-1">
        {alreadyHasAccess && !success && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 text-sm text-amber-700 dark:text-amber-300">
            <p className="font-bold mb-1">
              🔑 {t("modals.patient_access.active_access")}
            </p>
            {t("modals.patient_access.active_access_desc")}
            <div className="mt-3">
              <Button
                onClick={handleResetPassword}
                loading={resetLoading}
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 border-none text-white"
              >
                {resetLoading
                  ? t("modals.patient_access.btn_sending_reset")
                  : t("modals.patient_access.btn_send_reset")}
              </Button>
            </div>
            {resetSuccess && (
              <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                {t("modals.patient_access.reset_success", {
                  email: patient.email,
                })}
              </p>
            )}
          </div>
        )}

        {!success ? (
          <>
            <div>
              <label className="input-label">
                {t("modals.patient_access.email_label")}
              </label>
              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5">
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  {patient.email}
                </span>
              </div>
            </div>
            <div>
              <label className="input-label">
                {t("modals.patient_access.password_label")}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field font-mono flex-1"
                />
                <button
                  onClick={() =>
                    setPassword(Math.random().toString(36).slice(-8) + "A1!")
                  }
                  className="btn-secondary btn-sm shrink-0"
                >
                  {t("modals.patient_access.btn_generate_password")}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                {t("modals.patient_access.share_hint")}
              </p>
            </div>
            {isEmailConfigured() ? (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="sendEmailCheckbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-4 w-4 cursor-pointer"
                />
                <label
                  htmlFor="sendEmailCheckbox"
                  className="text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  {t("modals.patient_access.checkbox_send_email")}
                </label>
              </div>
            ) : (
              <div className="flex flex-col mt-2 gap-1 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sendEmailCheckboxDisabled"
                    disabled
                    checked={false}
                    className="rounded border-slate-300 text-slate-400 h-4 w-4 cursor-not-allowed"
                  />
                  <label
                    htmlFor="sendEmailCheckboxDisabled"
                    className="text-xs font-semibold text-slate-400 cursor-not-allowed"
                  >
                    {t("modals.patient_access.checkbox_send_email")}
                  </label>
                </div>
                <span className="text-[10px] text-slate-400">
                  {t("modals.patient_access.email_not_configured_hint", {
                    defaultValue: "Email service not configured. Set up EmailJS in .env to enable.",
                  })}
                </span>
              </div>
            )}
            {error && (
              <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl p-4 text-sm text-rose-600 dark:text-rose-400">
                <p>{error}</p>
                {isEmailInUse && (
                  <div className="mt-3 pt-3 border-t border-rose-200/50 dark:border-rose-900/30">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                      {t("modals.patient_access.reset_existing_email_hint", {
                        defaultValue: "You can trigger a password reset link for this email directly below:",
                      })}
                    </p>
                    <Button
                      onClick={handleResetPassword}
                      loading={resetLoading}
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-700 border-none text-white font-bold text-xs"
                    >
                      {resetLoading
                        ? t("modals.patient_access.btn_sending_reset")
                        : t("modals.patient_access.btn_send_reset")}
                    </Button>
                    {resetSuccess && (
                      <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                        ✓ {t("modals.patient_access.reset_success", {
                          email: patient.email,
                        })}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-3">
            <div className="bg-sage-50 dark:bg-sage-950/30 border border-sage-200 dark:border-sage-900/50 rounded-xl p-5 text-center">
              <div className="text-3xl mb-2">✅</div>
              <p className="font-bold text-sage-800 dark:text-sage-300">
                {t("modals.patient_access.success_title")}
              </p>
              {sendEmail && emailStatus === "sent" && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                  {t("modals.patient_access.success_email_sent")}
                </p>
              )}
              {sendEmail && emailStatus === "failed" && (
                <p className="text-xs text-rose-500 font-semibold mt-1">
                  {t("modals.patient_access.success_email_failed")}
                </p>
              )}
              {!sendEmail && (
                <p className="text-sm text-sage-600 dark:text-sage-400 mt-1">
                  {t("modals.patient_access.success_share")}
                </p>
              )}
            </div>
            <div className="space-y-2">
              {[
                {
                  label: t("modals.patient_access.portal_link_label"),
                  value: window.location.origin + "/#/paciente",
                },
                { label: t("login.email"), value: patient.email },
                { label: t("login.password"), value: password },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="text-sm font-mono font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {value}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(value || "")}
                    className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors shrink-0"
                  >
                    <CopyIcon />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PatientAccessModal;
