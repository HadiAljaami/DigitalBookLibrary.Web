import { useTranslation } from "react-i18next";
import { type AppLanguage, isRtl } from "@/i18n/config";

/** Convenience hook: current language, direction, and a setter. */
export function useLanguage() {
  const { i18n } = useTranslation();
  const language = i18n.language as AppLanguage;

  return {
    language,
    dir: isRtl(language) ? ("rtl" as const) : ("ltr" as const),
    isRtl: isRtl(language),
    setLanguage: (lang: AppLanguage) => i18n.changeLanguage(lang),
    toggleLanguage: () => i18n.changeLanguage(language === "ar" ? "en" : "ar"),
  };
}
