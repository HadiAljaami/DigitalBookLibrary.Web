import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/dashboard/page-header";
import { AccountSettings } from "@/features/account/account-settings";

export function SettingsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-5">
      <PageHeader title={t("nav.settings")} description={t("settings.subtitle")} />
      <AccountSettings />
    </div>
  );
}
