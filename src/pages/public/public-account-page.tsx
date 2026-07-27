import { useTranslation } from "react-i18next";
import { AccountSettings } from "@/features/account/account-settings";

/** A member's (or author's) self-service profile + password page, outside the admin area. */
export function PublicAccountPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("public.myAccount")}</h1>
        <p className="text-muted-foreground">{t("settings.subtitle")}</p>
      </div>
      <AccountSettings />
    </div>
  );
}
