import { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Library, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { useAuth } from "@/providers/auth-provider";
import { tokenStorage } from "@/lib/token-storage";
import { errorMessage } from "@/lib/error-message";
import { Roles } from "@/types/auth";

export function LoginPage() {
  const { t } = useTranslation();
  const { isAuthenticated, isAdmin, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: string })?.from;

  // Admins land on the dashboard; members land on the public library.
  function destinationFor(admin: boolean) {
    if (from) return from;
    return admin ? "/" : "/library";
  }

  // Already signed in → go to where they were headed (or their home area).
  if (isAuthenticated) {
    return <Navigate to={destinationFor(isAdmin)} replace />;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(identifier.trim(), password);
      const admin = tokenStorage.getUser()?.roles.includes(Roles.Admin) ?? false;
      navigate(destinationFor(admin), { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="absolute end-4 top-4 flex items-center gap-1">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-sm shadow-lg">
        <CardContent className="p-8">
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Library className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{t("auth.loginTitle")}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{t("auth.loginSubtitle")}</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">{t("auth.identifier")}</Label>
              <Input
                id="identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? t("auth.signingIn") : t("auth.signIn")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
