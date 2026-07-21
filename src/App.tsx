import { Routes, Route } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/app-layout";
import { DashboardPage } from "@/pages/dashboard-page";
import { PlaceholderPage } from "@/pages/placeholder-page";

export function App() {
  const { t } = useTranslation();

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="books" element={<PlaceholderPage title={t("nav.books")} />} />
        <Route path="authors" element={<PlaceholderPage title={t("nav.authors")} />} />
        <Route path="categories" element={<PlaceholderPage title={t("nav.categories")} />} />
        <Route path="users" element={<PlaceholderPage title={t("nav.users")} />} />
        <Route path="reports/overview" element={<PlaceholderPage title={t("nav.reportsOverview")} />} />
        <Route path="reports/books" element={<PlaceholderPage title={t("nav.reportsBooks")} />} />
        <Route path="reports/users" element={<PlaceholderPage title={t("nav.reportsUsers")} />} />
        <Route path="audit" element={<PlaceholderPage title={t("nav.audit")} />} />
        <Route path="settings" element={<PlaceholderPage title={t("nav.settings")} />} />
        <Route path="*" element={<PlaceholderPage title="404" />} />
      </Route>
    </Routes>
  );
}
