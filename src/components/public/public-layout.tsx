import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BookOpenText, LogIn, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { useAuth } from "@/providers/auth-provider";
import { Roles } from "@/types/auth";

/** Chrome for the public visitor site "واحة المعرفة" — distinct from the admin dashboard shell. */
export function PublicLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.roles.includes(Roles.Admin);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <Link to="/library" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BookOpenText className="h-5 w-5" />
            </span>
            <span className="hidden text-lg font-bold tracking-tight sm:inline">{t("public.brand")}</span>
          </Link>

          <nav className="flex items-center gap-1 text-sm">
            {[
              { to: "/library", label: t("nav.books"), end: true },
              { to: "/library/authors", label: t("nav.authors"), end: false },
              { to: "/library/categories", label: t("nav.categories"), end: false },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  "rounded-md px-3 py-1.5 transition " +
                  (isActive
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex flex-1 items-center justify-end gap-1">
            <LanguageToggle />
            <ThemeToggle />
            {isAdmin && (
              <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate("/")}>
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">{t("public.dashboard")}</span>
              </Button>
            )}
            {!isAuthenticated && (
              <Button size="sm" className="gap-2" onClick={() => navigate("/login")}>
                <LogIn className="h-4 w-4" />
                {t("public.signIn")}
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} {t("public.brand")}
      </footer>
    </div>
  );
}
