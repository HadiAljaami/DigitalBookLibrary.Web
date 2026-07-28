import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BookOpenText, LogIn, LayoutDashboard, LogOut, Library, UserPlus, PenSquare, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { useAuth } from "@/providers/auth-provider";
import { Roles } from "@/types/auth";

/** Chrome for the public visitor site "واحة المعرفة" — distinct from the admin dashboard shell. */
export function PublicLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const isAuthor = user?.roles.includes(Roles.Author) ?? false;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BookOpenText className="h-5 w-5" />
            </span>
            <span className="hidden text-lg font-bold tracking-tight sm:inline">{t("public.brand")}</span>
          </Link>

          <nav className="flex items-center gap-1 text-sm">
            {[
              { to: "/", label: t("nav.books"), end: true },
              { to: "/authors", label: t("nav.authors"), end: false },
              { to: "/categories", label: t("nav.categories"), end: false },
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

            {!isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden gap-2 sm:inline-flex"
                  onClick={() => navigate("/register")}
                >
                  <UserPlus className="h-4 w-4" />
                  {t("auth.createAccount")}
                </Button>
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={() => navigate("/login", { state: { from: "/" } })}
                >
                  <LogIn className="h-4 w-4" />
                  {t("public.signIn")}
                </Button>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-2">
                    <Avatar className="h-8 w-8">
                      {user && <AvatarImage src={`/api/users/${user.id}/avatar`} alt="" />}
                      <AvatarFallback>{(user?.username ?? "?").slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="hidden text-sm font-medium sm:inline">{user?.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel>
                    <p>{user?.username}</p>
                    <p className="text-xs font-normal text-muted-foreground">{user?.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => navigate("/me")}>
                    <Library className="h-4 w-4" />
                    {t("public.myLibrary")}
                  </DropdownMenuItem>
                  {isAuthor && (
                    <DropdownMenuItem onSelect={() => navigate("/my-books")}>
                      <PenSquare className="h-4 w-4" />
                      {t("public.myBooks")}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onSelect={() => navigate("/account")}>
                    <UserCog className="h-4 w-4" />
                    {t("public.myAccount")}
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onSelect={() => navigate("/dashboard")}>
                      <LayoutDashboard className="h-4 w-4" />
                      {t("public.dashboard")}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={() => logout()}
                  >
                    <LogOut className="h-4 w-4" />
                    {t("user.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
