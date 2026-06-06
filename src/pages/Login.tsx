import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  googleProvider,
  auth,
} from "../services/firebaseService";
import { UtensilsIcon, GoogleIcon, ShieldIcon, CheckCircleIcon } from "../components/icons";
import AuthLayout from "../components/AuthLayout";
import { Button, Input } from "../components/ui";

interface LoginProps {
  isPatient?: boolean;
}

const getFriendlyErrorMessage = (errorCode: string, t: TFunction) => {
  switch (errorCode) {
    case "auth/invalid-email":
      return t("login.error_invalid_email", "O formato do e-mail é inválido.");
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return t("login.error_wrong_credentials", "E-mail ou senha incorretos. Verifique suas credenciais.");
    case "auth/user-disabled":
      return t("login.error_user_disabled", "Esta conta de usuário foi desabilitada.");
    case "auth/unauthorized-domain":
      return t("login.error_unauthorized_domain", "Erro de Domínio: Este domínio não está autorizado no Firebase.");
    case "auth/popup-closed-by-user":
      return t("login.error_popup_closed", "O login com Google foi cancelado.");
    default:
      return errorCode ? t("login.error_generic", `Erro no login (${errorCode}). Tente novamente.`, { code: errorCode }) : null;
  }
};

const Login: React.FC<LoginProps> = ({ isPatient = false }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(getFriendlyErrorMessage(err instanceof FirebaseError ? err.code : "", t));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError(getFriendlyErrorMessage(err instanceof FirebaseError ? err.code : "", t));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError(null);
    setInfo(null);
    if (!email) {
      setError(t("login.forgot_password_instruction"));
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setInfo(t("login.forgot_password_success"));
    } catch (err) {
      setError(getFriendlyErrorMessage(err instanceof FirebaseError ? err.code : "", t));
    }
  };

  return (
    <AuthLayout
      tone={isPatient ? "teal" : "sage"}
      panelTitle={
        isPatient
          ? t("login.patient_desc")
          : t("login.professional_desc")
      }
      panelText={
        isPatient
          ? t("login.patient_sub")
          : t("login.professional_sub")
      }
      highlights={
        isPatient
          ? undefined
          : (t("login.professional_highlights", { returnObjects: true }) as string[])
      }
    >
      <div className="text-center mb-9">
        <div
          className={`inline-flex items-center justify-center h-14 w-14 rounded-2xl mb-6 shadow-glow ${
            isPatient ? "bg-teal-50 text-teal-600" : "bg-sage-50 text-sage-600"
          }`}
        >
          <UtensilsIcon className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {isPatient ? t("login.patient_title") : t("login.professional_title")}
        </h1>
        <p className="mt-2 text-slate-500">
          {isPatient
            ? t("login.login_patient_form_desc")
            : t("login.login_form_desc")}
        </p>
      </div>

      <form onSubmit={handleEmailLogin} className="space-y-5">
        <Input
          label={t("login.email")}
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seuemail@exemplo.com"
        />

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="password" className="text-sm font-semibold text-slate-700">
              {t("login.password")}
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className={`text-xs font-semibold ${
                isPatient ? "text-teal-600" : "text-sage-600"
              } hover:opacity-80 cursor-pointer`}
            >
              {t("login.forgot_password")}
            </button>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm flex items-start gap-3 animate-fade-in">
            <ShieldIcon className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {info && (
          <div className="p-3.5 rounded-xl bg-sage-50 border border-sage-100 text-sage-700 text-sm flex items-start gap-3 animate-fade-in">
            <CheckCircleIcon className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{info}</span>
          </div>
        )}

        <Button
          type="submit"
          loading={loading}
          fullWidth
          size="lg"
          className={isPatient ? "bg-teal-600 hover:bg-teal-700 shadow-teal-600/25 cursor-pointer" : "cursor-pointer"}
        >
          {t("login.submit")}
        </Button>
      </form>

      {!isPatient && (
        <>
          <div className="my-6 flex items-center gap-4">
            <span className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-medium text-slate-400">{t("login.or_continue_with")}</span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>
          <Button
            type="button"
            variant="secondary"
            fullWidth
            size="lg"
            onClick={handleGoogleLogin}
            disabled={loading}
            leftIcon={<GoogleIcon className="w-5 h-5" />}
            className="cursor-pointer"
          >
            {t("login.google_login")}
          </Button>

          <p className="mt-8 text-center text-sm text-slate-600">
            {t("login.no_account")}{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="font-bold text-sage-600 hover:text-sage-700 hover:underline cursor-pointer"
            >
              {t("login.register_free")}
            </button>
          </p>
        </>
      )}

      {isPatient && (
        <p className="mt-8 text-center text-sm text-slate-505">
          {t("login.patient_footer_desc")}
        </p>
      )}
    </AuthLayout>
  );
};

export default Login;
