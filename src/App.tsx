import { Routes, Route } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/app-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { LoginPage } from "@/pages/login-page";
import { DashboardPage } from "@/pages/dashboard-page";
import { UsersPage } from "@/pages/users-page";
import { AuditPage } from "@/pages/audit-page";
import { BooksPage } from "@/pages/books-page";
import { PlaceholderPage } from "@/pages/placeholder-page";

export function App() {
  const { t } = useTranslation();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="books" element={<BooksPage />} />
        <Route path="authors" element={<PlaceholderPage title={t("nav.authors")} />} />
        <Route path="categories" element={<PlaceholderPage title={t("nav.categories")} />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="reports/overview" element={<PlaceholderPage title={t("nav.reportsOverview")} />} />
        <Route path="reports/books" element={<PlaceholderPage title={t("nav.reportsBooks")} />} />
        <Route path="reports/users" element={<PlaceholderPage title={t("nav.reportsUsers")} />} />
        <Route path="audit" element={<AuditPage />} />
        <Route path="settings" element={<PlaceholderPage title={t("nav.settings")} />} />
        <Route path="*" element={<PlaceholderPage title="404" />} />
      </Route>
    </Routes>
  );
}
