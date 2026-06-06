import React, { useState } from "react";
import { FirebaseError } from "firebase/app";
import type { Patient } from "../../types";
import {
  setupPatientPortalAccess,
  sendPortalPasswordReset,
} from "../../services/firebaseService";
import { isEmailConfigured, sendPortalAccessEmail } from "../../services/emailService";
import { useAuth } from "../../contexts/AuthContext";
import { Modal, Button } from "../ui";

interface Props {
  patient: Patient;
  onClose: () => void;
}

const CopyIcon: React.FC = () => (
  <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const PatientAccessModal: React.FC<Props> = ({ patient, onClose }) => {
  const { currentUser } = useAuth();
  const [password, setPassword] = useState(() => Math.random().toString(36).slice(-8) + "A1!");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [sendEmail, setSendEmail] = useState(isEmailConfigured());
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const alreadyHasAccess = !!patient.portalUid;

  const handleGenerate = async () => {
    if (!currentUser || !patient.id || !patient.email) return;
    setLoading(true);
    setError("");
    setEmailStatus("idle");
    try {
      await setupPatientPortalAccess(
        patient.email,
        password,
        patient.id,
        currentUser.uid,
        currentUser.displayName || currentUser.email || "Nutricionista",
        currentUser.email || ""
      );

      // Try sending invitation email
      if (sendEmail) {
        setEmailStatus("sending");
        try {
          await sendPortalAccessEmail({
            toEmail: patient.email,
            toName: `${patient.firstName} ${patient.lastName}`,
            fromName: currentUser.displayName || currentUser.email || "Seu Nutricionista",
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
      if (e instanceof FirebaseError && e.code === "auth/email-already-in-use") {
        setError("Este e-mail já possui acesso ao portal. Para gerar uma nova senha, use a opção de redefinição abaixo.");
      } else {
        setError("Não foi possível criar o acesso. Verifique sua conexão e tente novamente.");
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
      setError("Não foi possível enviar o e-mail de redefinição. Verifique as configurações.");
    } finally {
      setResetLoading(false);
    }
  };

  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

  return (
    <Modal
      open
      onClose={onClose}
      title="Portal do Paciente"
      description={`${patient.firstName} ${patient.lastName}`}
      icon={<span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 text-xl">🔑</span>}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>{success ? "Fechar" : "Cancelar"}</Button>
          {!success && !alreadyHasAccess && (
            <Button onClick={handleGenerate} loading={loading} disabled={loading || !patient.email}>
              {loading ? "Criando acesso..." : "Gerar Acesso"}
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-4 py-1">
        {alreadyHasAccess && !success && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 text-sm text-amber-700 dark:text-amber-300">
            <p className="font-bold mb-1">🔑 Acesso Ativo</p>
            Este paciente já possui acesso ao portal. Se ele esqueceu a senha, você pode enviar um e-mail de redefinição clicando abaixo:
            <div className="mt-3">
              <Button onClick={handleResetPassword} loading={resetLoading} size="sm" className="bg-amber-600 hover:bg-amber-700 border-none text-white">
                {resetLoading ? "Enviando e-mail..." : "Enviar link de redefinição de senha"}
              </Button>
            </div>
            {resetSuccess && (
              <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                ✓ E-mail de redefinição enviado com sucesso para {patient.email}!
              </p>
            )}
          </div>
        )}

        {!success ? (
          <>
            <div>
              <label className="input-label">E-mail do paciente</label>
              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5">
                <span className="text-sm text-slate-600 dark:text-slate-300">{patient.email}</span>
              </div>
            </div>
            <div>
              <label className="input-label">Senha de acesso</label>
              <div className="flex gap-2">
                <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field font-mono flex-1" />
                <button onClick={() => setPassword(Math.random().toString(36).slice(-8) + "A1!")} className="btn-secondary btn-sm shrink-0">
                  Gerar senha
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1.5">Compartilhe estas credenciais com o paciente de forma segura.</p>
            </div>
            {isEmailConfigured() && (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="sendEmailCheckbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
                />
                <label htmlFor="sendEmailCheckbox" className="text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">
                  Enviar e-mail de convite automaticamente com as credenciais
                </label>
              </div>
            )}
            {error && <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-sm text-rose-600">{error}</div>}
          </>
        ) : (
          <div className="space-y-3">
            <div className="bg-sage-50 dark:bg-sage-950/30 border border-sage-200 dark:border-sage-900/50 rounded-xl p-5 text-center">
              <div className="text-3xl mb-2">✅</div>
              <p className="font-bold text-sage-800 dark:text-sage-300">Acesso criado com sucesso!</p>
              {sendEmail && emailStatus === "sent" && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                  ✓ Um e-mail com as instruções e credenciais foi enviado para o paciente!
                </p>
              )}
              {sendEmail && emailStatus === "failed" && (
                <p className="text-xs text-rose-500 font-semibold mt-1">
                  ⚠️ O e-mail de convite falhou ao enviar, mas o acesso foi criado. Copie as credenciais abaixo.
                </p>
              )}
              {!sendEmail && (
                <p className="text-sm text-sage-600 dark:text-sage-400 mt-1">Compartilhe as credenciais abaixo com o paciente.</p>
              )}
            </div>
            <div className="space-y-2">
              {[
                { label: "Link do portal", value: window.location.origin + "/#/paciente" },
                { label: "E-mail", value: patient.email },
                { label: "Senha", value: password },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="text-sm font-mono font-semibold text-slate-800 dark:text-slate-200 truncate">{value}</p>
                  </div>
                  <button onClick={() => copyToClipboard(value)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors shrink-0">
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
