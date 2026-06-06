import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import {
  auth,
  signInWithPopup,
  googleProvider,
} from "../services/firebaseService";
import {
  UtensilsIcon,
  EyeIcon,
  EyeOffIcon,
  GoogleIcon,
  ShieldIcon,
} from "../components/icons";
import AuthLayout from "../components/AuthLayout";
import { Button, Input } from "../components/ui";

const getFriendlyErrorMessage = (errorCode: string, t: TFunction) => {
  switch (errorCode) {
    case "auth/email-already-in-use":
      return t("register.error_email_in_use", "Este e-mail já está em uso por outra conta.");
    case "auth/invalid-email":
      return t("login.error_invalid_email", "O formato do e-mail é inválido.");
    case "auth/weak-password":
      return t("register.error_weak_password", "A senha é muito fraca. A senha deve ter no mínimo 6 caracteres.");
    case "auth/unauthorized-domain":
      return t("login.error_unauthorized_domain", "Erro de Domínio: Este domínio não está autorizado no Firebase.");
    case "auth/popup-closed-by-user":
      return t("login.error_popup_closed", "O cadastro com Google foi cancelado.");
    default:
      return t("register.error_generic", "Ocorreu um erro ao criar a conta. Tente novamente.");
  }
};

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError(t("register.error_weak_password"));
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
    } catch (err) {
      setError(getFriendlyErrorMessage(err instanceof FirebaseError ? err.code : "", t));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError(getFriendlyErrorMessage(err instanceof FirebaseError ? err.code : "", t));
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    if (password.length === 0)
      return { step: 0, color: "bg-slate-200", text: "", textColor: "text-slate-400" };
    if (password.length < 6)
      return { step: 1, color: "bg-rose-500", text: t("register.password_strength_weak"), textColor: "text-rose-600" };
    if (password.length < 10)
      return { step: 2, color: "bg-amber-500", text: t("register.password_strength_medium"), textColor: "text-amber-600" };
    return { step: 3, color: "bg-emerald-500", text: t("register.password_strength_strong"), textColor: "text-emerald-600" };
  };

  const strength = passwordStrength();

  return (
    <AuthLayout
      tone="teal"
      panelTitle={t("register.desc")}
      panelText={t("register.sub")}
      highlights={t("register.highlights", { returnObjects: true }) as string[]}
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-sage-50 text-sage-600 mb-6 shadow-glow">
          <UtensilsIcon className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {t("register.title")}
        </h1>
        <p className="mt-2 text-slate-500">
          {t("register.register_form_desc")}
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <Input
          label={t("register.full_name")}
          id="displayName"
          name="displayName"
          type="text"
          autoComplete="name"
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Dr(a). Maria Silva"
        />

        <Input
          label={t("register.professional_email")}
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seunome@clinica.com"
        />

        <div>
          <Input
            label={t("login.password")}
            id="password"
            name="password"
            type={passwordVisible ? "text" : "password"}
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("register.password_placeholder")}
            rightSlot={
              <button
                type="button"
                onClick={() => setPasswordVisible((v) => !v)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                aria-label={passwordVisible ? "Ocultar senha" : "Mostrar senha"}
              >
                {passwordVisible ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            }
          />
          {password.length > 0 && (
            <div className="mt-2.5 flex items-center gap-3">
              <div className="flex-1 grid grid-cols-3 gap-1.5">
                {[1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i <= strength.step ? strength.color : "bg-slate-100"
                    }`}
                  />
                ))}
              </div>
              <span className={`text-xs font-semibold ${strength.textColor}`}>
                {strength.text}
              </span>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm flex items-start gap-3 animate-fade-in">
            <ShieldIcon className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <Button type="submit" loading={loading} fullWidth size="lg" className="cursor-pointer">
          {t("register.submit")}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-medium text-slate-400">{t("register.or_register_with")}</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <Button
        type="button"
        variant="secondary"
        fullWidth
        size="lg"
        onClick={handleGoogleRegister}
        disabled={loading}
        leftIcon={<GoogleIcon className="w-5 h-5" />}
        className="cursor-pointer"
      >
        {t("register.google_register")}
      </Button>

      <p className="mt-7 text-center text-sm text-slate-600">
        {t("register.have_account")}{" "}
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="font-bold text-sage-600 hover:text-sage-700 hover:underline cursor-pointer"
        >
          {t("register.login_link")}
        </button>
      </p>
    </AuthLayout>
  );
};

export default Register;
