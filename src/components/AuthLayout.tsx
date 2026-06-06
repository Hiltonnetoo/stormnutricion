import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  UtensilsIcon,
  CheckCircleIcon,
  StarIcon,
} from "./icons";
import LanguageSelector from "./LanguageSelector";

interface AuthLayoutProps {
  children: React.ReactNode;
  /** Visual panel theme */
  tone?: "sage" | "teal";
  panelTitle: string;
  panelText: string;
  /** Optional testimonial block (used on register) */
  testimonial?: { quote: string; name: string; role: string };
  /** Bullet highlights shown on the panel */
  highlights?: string[];
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  tone = "sage",
  panelTitle,
  panelText,
  testimonial,
  highlights,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex bg-white">
      {/* ---- Form side ---- */}
      <div className="flex-1 flex flex-col justify-center px-5 sm:px-8 lg:flex-none lg:w-[480px] xl:w-[560px] relative">
        <button
          onClick={() => navigate("/")}
          className="absolute top-7 left-6 sm:left-8 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-sage-600 transition-colors focus-ring rounded-lg px-1 py-1 cursor-pointer"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          {t("common.back", "Voltar")}
        </button>
        <div className="absolute top-7 right-6 sm:right-8">
          <LanguageSelector />
        </div>
        <div className="mx-auto w-full max-w-sm py-16 animate-fade-in-up">
          {children}
        </div>
      </div>

      {/* ---- Visual panel ---- */}
      <div className="hidden lg:block relative flex-1 overflow-hidden">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${
            tone === "teal"
              ? "from-teal-500 via-sage-600 to-sage-800"
              : "from-sage-600 via-sage-700 to-slate-900"
          }`}
        />
        {/* decorative shapes */}
        <div className="absolute -top-24 -right-16 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-10 -left-20 h-80 w-80 rounded-full bg-teal-300/20 blur-3xl" />
        <div className="absolute inset-0 grid-pattern opacity-[0.07]" />

        <div className="relative h-full flex flex-col justify-between p-12 text-white">
          {/* brand */}
          <div className="flex items-center gap-3">
            <div className="bg-white/15 backdrop-blur-sm p-2 rounded-xl border border-white/20">
              <UtensilsIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">
              Isanutri<span className="text-sage-200">.pro</span>
            </span>
          </div>

          <div className="max-w-md space-y-8">
            {testimonial && (
              <figure className="rounded-2xl bg-white/10 backdrop-blur-md p-6 border border-white/20">
                <div className="flex gap-0.5 mb-3 text-amber-300">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} className="w-4 h-4" />
                  ))}
                </div>
                <blockquote className="text-sage-50 text-sm leading-relaxed italic">
                  “{testimonial.quote}”
                </blockquote>
                <figcaption className="mt-4 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-white/20 border border-white/30 flex items-center justify-center font-bold text-sm">
                    {testimonial.name
                      .split(" ")
                      .slice(0, 2)
                      .map((p) => p[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-sage-200">{testimonial.role}</p>
                  </div>
                </figcaption>
              </figure>
            )}

            <div>
              <h2 className="text-3xl font-extrabold leading-tight tracking-tight">
                {panelTitle}
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-sage-100">
                {panelText}
              </p>
            </div>

            {highlights && (
              <ul className="space-y-3">
                {highlights.map((h) => (
                  <li key={h} className="flex items-center gap-3 text-sage-50 font-medium">
                    <CheckCircleIcon className="w-5 h-5 text-sage-200 shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="text-xs text-sage-200/80">
            &copy; {new Date().getFullYear()} Isanutri · {t("home.footer_text")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
