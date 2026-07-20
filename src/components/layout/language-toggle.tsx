import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      aria-label={t("language.toggle")}
      className="gap-2"
    >
      <Languages className="h-5 w-5" />
      <span className="text-sm font-medium">{language === "ar" ? "EN" : "ع"}</span>
    </Button>
  );
}
