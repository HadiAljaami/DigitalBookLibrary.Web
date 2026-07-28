import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BookOpenText, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { useAuth } from "@/providers/auth-provider";
import { authService } from "@/services/auth-service";
import { errorMessage } from "@/lib/error-message";

export function PublicRegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ fullName: "", username: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const mismatch = form.confirm.length > 0 && form.password !== form.confirm;
  const tooShort = form.password.length > 0 && form.password.length < 6;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mismatch || tooShort) return;
    setError(null);
    setLoading(true);
    try {
      await authService.register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        fullName: form.fullName.trim() || null,
      });
      // Sign the new member straight in and drop them into the library.
      await login(form.username.trim(), form.password);
      navigate("/", { replace: true });
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
              <BookOpenText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{t("auth.registerTitle")}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{t("auth.registerSubtitle")}</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <Field label={t("authors.fullName")}>
              <Input value={form.fullName} onChange={set("fullName")} autoFocus />
            </Field>
            <Field label={t("users.username")}>
              <Input value={form.username} onChange={set("username")} autoComplete="username" required />
            </Field>
            <Field label={t("common.email")}>
              <Input dir="ltr" type="email" value={form.email} onChange={set("email")} autoComplete="email" required />
            </Field>
            <Field
              label={t("auth.password")}
              error={tooShort ? t("settings.passwordTooShort") : undefined}
            >
              <Input
                type="password"
                value={form.password}
                onChange={set("password")}
                autoComplete="new-password"
                required
              />
            </Field>
            <Field
              label={t("settings.confirmPassword")}
              error={mismatch ? t("settings.passwordMismatch") : undefined}
            >
              <Input
                type="password"
                value={form.confirm}
                onChange={set("confirm")}
                autoComplete="new-password"
                required
              />
            </Field>

            {error && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading || mismatch || tooShort}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("auth.createAccount")}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {t("auth.haveAccount")}{" "}
              <Link to="/login" state={{ from: "/" }} className="font-medium text-primary hover:underline">
                {t("auth.signIn")}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
