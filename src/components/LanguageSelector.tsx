import React from "react";
import { useTranslation } from "react-i18next";

export const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const toggleLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
  };

  return (
    <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50 shrink-0">
      <button
        type="button"
        onClick={() => toggleLanguage("en")}
        className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
          currentLanguage.startsWith("en")
            ? "bg-white dark:bg-slate-750 text-sage-700 dark:text-sage-400 shadow-sm"
            : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => toggleLanguage("pt")}
        className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
          currentLanguage.startsWith("pt")
            ? "bg-white dark:bg-slate-750 text-sage-700 dark:text-sage-400 shadow-sm"
            : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        }`}
      >
        PT
      </button>
    </div>
  );
};

export default LanguageSelector;
