import { Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { LoginPage } from "@/pages/login-page";
import { DashboardPage } from "@/pages/dashboard-page";
import { UsersPage } from "@/pages/users-page";
import { AuditPage } from "@/pages/audit-page";
import { BooksPage } from "@/pages/books-page";
import { AuthorsPage } from "@/pages/authors-page";
import { CategoriesPage } from "@/pages/categories-page";
import { PublishersPage } from "@/pages/publishers-page";
import { ReportsBooksPage } from "@/pages/reports-books-page";
import { ReportsUsersPage } from "@/pages/reports-users-page";
import { ReportsOverviewPage } from "@/pages/reports-overview-page";
import { SettingsPage } from "@/pages/settings-page";
import { PublicLayout } from "@/components/public/public-layout";
import { PublicHomePage } from "@/pages/public/public-home-page";
import { PublicBookPage } from "@/pages/public/public-book-page";
import { PublicAuthorsPage } from "@/pages/public/public-authors-page";
import { PublicAuthorPage } from "@/pages/public/public-author-page";
import { PublicCategoriesPage } from "@/pages/public/public-categories-page";
import { PlaceholderPage } from "@/pages/placeholder-page";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Public visitor site "واحة المعرفة" — no authentication required to browse. */}
      <Route path="/library" element={<PublicLayout />}>
        <Route index element={<PublicHomePage />} />
        <Route path="books/:id" element={<PublicBookPage />} />
        <Route path="authors" element={<PublicAuthorsPage />} />
        <Route path="authors/:id" element={<PublicAuthorPage />} />
        <Route path="categories" element={<PublicCategoriesPage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="books" element={<BooksPage />} />
        <Route path="authors" element={<AuthorsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="publishers" element={<PublishersPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="reports/overview" element={<ReportsOverviewPage />} />
        <Route path="reports/books" element={<ReportsBooksPage />} />
        <Route path="reports/users" element={<ReportsUsersPage />} />
        <Route path="audit" element={<AuditPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<PlaceholderPage title="404" />} />
      </Route>
    </Routes>
  );
}
