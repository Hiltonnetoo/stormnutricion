import React, { useState, useRef } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import {
  updateProfile,
  uploadProfilePicture,
  auth,
} from "../services/firebaseService";
import { PageHeader, Card, Input, Button } from "../components/ui";
import { CheckCircleIcon, XCircleIcon } from "../components/icons";
import BillingSection from "../components/settings/BillingSection";

const SettingsGear: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const Settings: React.FC = () => {
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const [displayName, setDisplayName] = useState(
    currentUser?.displayName || "",
  );
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    currentUser?.photoURL || null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [theme, setTheme] = useState(
    () =>
      localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"),
  );

  const [pwLoading, setPwLoading] = useState(false);
  const [pwMessage, setPwMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  /* ---- Clínica & Marca ---- */
  const [clinicName, setClinicName] = useState(
    () => localStorage.getItem("clinicName") || "",
  );
  const [clinicSpecialty, setClinicSpecialty] = useState(
    () => localStorage.getItem("clinicSpecialty") || "",
  );
  const [clinicPhone, setClinicPhone] = useState(
    () => localStorage.getItem("clinicPhone") || "",
  );
  const [clinicSaved, setClinicSaved] = useState(false);

  const handleSaveClinic = () => {
    localStorage.setItem("clinicName", clinicName);
    localStorage.setItem("clinicSpecialty", clinicSpecialty);
    localStorage.setItem("clinicPhone", clinicPhone);
    setClinicSaved(true);
    setTimeout(() => setClinicSaved(false), 3000);
  };

  /* ---- Notificações ---- */
  const [notifEvalComplete, setNotifEvalComplete] = useState(
    () => localStorage.getItem("notif_evalComplete") !== "false",
  );
  const [notifWeightLog, setNotifWeightLog] = useState(
    () => localStorage.getItem("notif_weightLog") !== "false",
  );
  const [notifAppointment, setNotifAppointment] = useState(
    () => localStorage.getItem("notif_appointment") !== "false",
  );

  const handleNotifToggle = (key: string, value: boolean) => {
    localStorage.setItem(key, String(value));
  };

  const handlePasswordReset = async () => {
    if (!currentUser?.email) return;
    setPwLoading(true);
    setPwMessage(null);
    try {
      await sendPasswordResetEmail(auth, currentUser.email);
      setPwMessage({
        type: "success",
        text: t("settings.reset_password_success"),
      });
    } catch {
      setPwMessage({
        type: "error",
        text: t("settings.reset_password_error"),
      });
    } finally {
      setPwLoading(false);
    }
  };

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError(t("settings.unauthenticated"));
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const updates: { displayName?: string; photoURL?: string } = {};
      if (displayName !== currentUser.displayName)
        updates.displayName = displayName;
      if (photoFile) {
        const newPhotoURL = await uploadProfilePicture(
          currentUser.uid,
          photoFile,
        );
        updates.photoURL = newPhotoURL;
      }
      if (Object.keys(updates).length > 0)
        await updateProfile(currentUser, updates);
      setSuccess(t("settings.profile_updated"));
      setPhotoFile(null);
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : "unknown error";
      setError(`${t("settings.update_failed")}: ${message}`);
      setLoading(false);
    }
  };

  return (
    <div className="p-5 sm:p-6 lg:p-8 max-w-3xl mx-auto animate-fade-in">
      <PageHeader
        icon={<SettingsGear className="w-6 h-6" />}
        title={t("settings.title")}
        subtitle={t("settings.subtitle")}
      />

      <div className="space-y-6">
        {/* Profile */}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {t("settings.profile")}
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            {t("settings.profile_desc")}
          </p>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="flex items-center gap-5">
              <img
                src={
                  photoPreview ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || currentUser?.email || "U")}&background=0D9488&color=fff&bold=true`
                }
                alt="Perfil"
                className="h-20 w-20 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-700"
              />
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  className="hidden"
                  accept="image/png, image/jpeg"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer"
                >
                  {t("settings.change_photo")}
                </Button>
                <p className="mt-2 text-xs text-slate-400">
                  {t("settings.photo_hint")}
                </p>
              </div>
            </div>

            <Input
              label={t("settings.display_name")}
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Dr(a). Maria Silva"
            />
            <Input
              label={t("login.email")}
              id="email"
              type="email"
              value={currentUser?.email || ""}
              disabled
              hint={t("settings.email_hint")}
            />

            {error && (
              <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl p-3">
                <XCircleIcon className="w-5 h-5 shrink-0" /> {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 text-sm text-sage-700 bg-sage-50 border border-sage-100 rounded-xl p-3">
                <CheckCircleIcon className="w-5 h-5 shrink-0" /> {success}
              </div>
            )}

            <div className="flex justify-end pt-1">
              <Button
                type="submit"
                loading={loading}
                className="cursor-pointer"
              >
                {loading
                  ? success
                    ? t("settings.saved")
                    : t("settings.saving")
                  : t("settings.save_changes")}
              </Button>
            </div>
          </form>
        </Card>

        {/* Appearance */}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {t("settings.appearance")}
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            {t("settings.appearance_desc")}
          </p>
          <div className="grid grid-cols-2 gap-4">
            {(
              [
                { key: "light", icon: "☀️", label: t("settings.mode_light") },
                { key: "dark", icon: "🌙", label: t("settings.mode_dark") },
              ] as const
            ).map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => handleThemeChange(opt.key)}
                className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                  theme === opt.key
                    ? "border-sage-500 bg-sage-50/60 dark:bg-sage-900/10"
                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <span className="text-2xl">{opt.icon}</span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </Card>

        {/* Security */}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {t("settings.security")}
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            {t("settings.security_desc")}
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {t("login.password")}
              </p>
              <p className="text-sm text-slate-500">
                {t("settings.password_desc")}
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={handlePasswordReset}
              loading={pwLoading}
              disabled={pwLoading || !currentUser?.email}
              className="cursor-pointer"
            >
              {t("settings.reset_password")}
            </Button>
          </div>

          {pwMessage && (
            <div
              className={`mt-4 flex items-center gap-2 text-sm rounded-xl p-3 border ${
                pwMessage.type === "success"
                  ? "text-sage-700 bg-sage-50 border-sage-100"
                  : "text-rose-600 bg-rose-50 border-rose-100"
              }`}
            >
              {pwMessage.type === "success" ? (
                <CheckCircleIcon className="w-5 h-5 shrink-0" />
              ) : (
                <XCircleIcon className="w-5 h-5 shrink-0" />
              )}
              {pwMessage.text}
            </div>
          )}
        </Card>

        {/* Clínica & Marca */}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {t("settings.clinic_brand")}
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            {t("settings.clinic_brand_desc")}
          </p>
          <div className="space-y-4">
            <Input
              label={t("settings.clinic_name")}
              id="clinicName"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              placeholder={t("settings.clinic_name_placeholder")}
            />
            <Input
              label={t("settings.clinic_specialty")}
              id="clinicSpecialty"
              value={clinicSpecialty}
              onChange={(e) => setClinicSpecialty(e.target.value)}
              placeholder={t("settings.clinic_specialty_placeholder")}
            />
            <Input
              label={t("settings.clinic_phone")}
              id="clinicPhone"
              value={clinicPhone}
              onChange={(e) => setClinicPhone(e.target.value)}
              placeholder="(00) 00000-0000"
            />
            {clinicSaved && (
              <div className="flex items-center gap-2 text-sm text-sage-700 bg-sage-50 border border-sage-100 rounded-xl p-3">
                <CheckCircleIcon className="w-5 h-5 shrink-0" />{" "}
                {t("settings.clinic_saved")}
              </div>
            )}
            <div className="flex justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={handleSaveClinic}
                className="cursor-pointer"
              >
                {t("settings.save_clinic_btn")}
              </Button>
            </div>
          </div>
        </Card>

        {/* Notificações */}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {t("notifications.title")}
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            {t("settings.notifications_desc")}
          </p>
          <div className="space-y-4">
            {(
              [
                {
                  key: "notif_evalComplete",
                  label: t("settings.notif_eval"),
                  value: notifEvalComplete,
                  set: setNotifEvalComplete,
                },
                {
                  key: "notif_weightLog",
                  label: t("settings.notif_weight"),
                  value: notifWeightLog,
                  set: setNotifWeightLog,
                },
                {
                  key: "notif_appointment",
                  label: t("settings.notif_appt"),
                  value: notifAppointment,
                  set: setNotifAppointment,
                },
              ] as const
            ).map(({ key, label, value, set }) => (
              <label
                key={key}
                className="flex items-center justify-between gap-4 cursor-pointer"
              >
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {label}
                </span>
                <div className="relative shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={value}
                    onChange={(e) => {
                      set(e.target.checked);
                      handleNotifToggle(key, e.target.checked);
                    }}
                  />
                  <div className="w-11 h-6 bg-slate-200 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-slate-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sage-600" />
                </div>
              </label>
            ))}
          </div>
        </Card>

        {/* Dados & Privacidade */}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {t("settings.privacy")}
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            {t("settings.privacy_desc")}
          </p>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {t("settings.export_data")}
                </p>
                <p className="text-xs text-slate-500">
                  {t("settings.export_data_desc")}
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="cursor-pointer"
                onClick={() => {
                  const data = {
                    email: currentUser?.email,
                    displayName: currentUser?.displayName,
                    uid: currentUser?.uid,
                    exportedAt: new Date().toISOString(),
                  };
                  const blob = new Blob([JSON.stringify(data, null, 2)], {
                    type: "application/json",
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "meus-dados-stormnutrition.json";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                {t("settings.export_btn")}
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {t("settings.privacy_policy")}
                </p>
                <p className="text-xs text-slate-500">
                  {t("settings.privacy_policy_desc")}
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="cursor-pointer"
                onClick={() =>
                  window.open(
                    "https://stormnutrition.com/privacidade",
                    "_blank",
                  )
                }
              >
                {t("settings.view_policy_btn")}
              </Button>
            </div>
          </div>
        </Card>

        {/* Plano & Faturamento */}
        <BillingSection />
      </div>
    </div>
  );
};

export default Settings;
