import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import ar from "./locales/ar.json";
import en from "./locales/en.json";

export type AppLanguage = "ar" | "en";
export const LANGUAGES: AppLanguage[] = ["ar", "en"];
const STORAGE_KEY = "app.language";

/** Right-to-left languages. Used to set <html dir> and pick Tailwind logical flow. */
export const RTL_LANGUAGES: AppLanguage[] = ["ar"];

export function isRtl(lang: string): boolean {
  return RTL_LANGUAGES.includes(lang as AppLanguage);
}

const stored = (localStorage.getItem(STORAGE_KEY) as AppLanguage) ?? "ar";

i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    en: { translation: en },
  },
  lng: stored,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

/** Keeps <html lang/dir> and localStorage in sync whenever the language changes. */
export function applyLanguageSideEffects(lang: AppLanguage) {
  localStorage.setItem(STORAGE_KEY, lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = isRtl(lang) ? "rtl" : "ltr";
}

applyLanguageSideEffects(stored);
i18n.on("languageChanged", (lng) => applyLanguageSideEffects(lng as AppLanguage));

export default i18n;
