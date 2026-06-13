import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslation from "./locales/en/common.json";
import ptTranslation from "./locales/pt/common.json";

const resources = {
  en: {
    translation: enTranslation,
  },
  pt: {
    translation: ptTranslation,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("language") || "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
