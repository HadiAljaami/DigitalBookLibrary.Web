import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, User } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { accountService } from "@/services/account-service";
import { useCountries, useCities, useLocalName, findById } from "@/hooks/use-lookups";
import { toast } from "@/lib/toast-store";
import { errorMessage } from "@/lib/error-message";
import { type ChangePasswordDto, type UpdateProfileDto } from "@/types/auth";

export function SettingsPage() {
  const { t } = useTranslation();
  const profile = useQuery({ queryKey: ["me", "profile"], queryFn: () => accountService.profile() });

  return (
    <div className="space-y-5">
      <PageHeader title={t("nav.settings")} description={t("settings.subtitle")} />
      {profile.isLoading ? (
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <ProfileCard />
          <PasswordCard />
        </div>
      )}
    </div>
  );
}

const profileSchema = z.object({
  fullName: z.string().trim().min(1),
  phone: z.string(),
  bio: z.string(),
  birthDate: z.string(),
  nationalityCountryId: z.string(),
  residenceCountryId: z.string(),
  cityId: z.string(),
});
type ProfileValues = z.infer<typeof profileSchema>;

function ProfileCard() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { name: localName } = useLocalName();
  const countries = useCountries();
  const allCities = useCities();
  const avatarRef = useRef<HTMLInputElement>(null);

  const profile = useQuery({ queryKey: ["me", "profile"], queryFn: () => accountService.profile() });

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } =
    useForm<ProfileValues>({
      resolver: zodResolver(profileSchema),
      defaultValues: {
        fullName: "",
        phone: "",
        bio: "",
        birthDate: "",
        nationalityCountryId: "",
        residenceCountryId: "",
        cityId: "",
      },
    });

  // The residence country isn't stored; recover it from the saved city.
  const residenceFromCity = useMemo(() => {
    const cityId = profile.data?.cityId;
    return cityId ? findById(allCities.data, cityId)?.countryId : undefined;
  }, [profile.data?.cityId, allCities.data]);

  useEffect(() => {
    const p = profile.data;
    if (!p) return;
    reset({
      fullName: p.fullName ?? "",
      phone: p.phone ?? "",
      bio: p.bio ?? "",
      birthDate: p.birthDate ?? "",
      nationalityCountryId: p.nationalityCountryId != null ? String(p.nationalityCountryId) : "",
      residenceCountryId: residenceFromCity != null ? String(residenceFromCity) : "",
      cityId: p.cityId != null ? String(p.cityId) : "",
    });
  }, [profile.data, residenceFromCity, reset]);

  const residenceCountryId = watch("residenceCountryId");
  const cities = useCities(residenceCountryId ? Number(residenceCountryId) : undefined);

  const mutation = useMutation({
    mutationFn: async (values: ProfileValues) => {
      const dto: UpdateProfileDto = {
        fullName: values.fullName.trim(),
        phone: values.phone || null,
        bio: values.bio || null,
        birthDate: values.birthDate || null,
        nationalityCountryId: values.nationalityCountryId ? Number(values.nationalityCountryId) : null,
        cityId: values.cityId ? Number(values.cityId) : null,
      };
      await accountService.updateProfile(dto);
      const avatar = avatarRef.current?.files?.[0];
      if (avatar) await accountService.uploadAvatar(avatar);
    },
    onSuccess: () => {
      toast.success(t("common.saved"));
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const initials = (profile.data?.username ?? "?").slice(0, 2).toUpperCase();

  return (
    <Card title={t("settings.profile")}>
      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="grid gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            {profile.data?.imageUrl && <AvatarImage src={profile.data.imageUrl} alt="" />}
            <AvatarFallback>
              {profile.data?.imageUrl ? <User className="h-6 w-6" /> : initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1.5">
            <Label>{t("settings.avatar")}</Label>
            <Input ref={avatarRef} type="file" accept="image/*" className="cursor-pointer" />
          </div>
        </div>

        <Field label={t("authors.fullName")} error={errors.fullName && t("common.required")}>
          <Input {...register("fullName")} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("common.phone")}>
            <Input dir="ltr" {...register("phone")} />
          </Field>
          <Field label={t("authors.birthDate")}>
            <Input type="date" {...register("birthDate")} />
          </Field>
        </div>

        <Field label={t("authors.bio")}>
          <Textarea {...register("bio")} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={t("authors.nationality")}>
            <LookupSelect
              value={watch("nationalityCountryId")}
              onValueChange={(v) => setValue("nationalityCountryId", v)}
              placeholder={t("common.select")}
              noneLabel={t("common.none")}
              options={(countries.data ?? []).map((c) => ({ value: String(c.id), label: localName(c) }))}
            />
          </Field>
          <Field label={t("authors.country")}>
            <LookupSelect
              value={watch("residenceCountryId")}
              onValueChange={(v) => {
                setValue("residenceCountryId", v);
                setValue("cityId", "");
              }}
              placeholder={t("common.select")}
              noneLabel={t("common.none")}
              options={(countries.data ?? []).map((c) => ({ value: String(c.id), label: localName(c) }))}
            />
          </Field>
          <Field label={t("authors.city")}>
            <LookupSelect
              value={watch("cityId")}
              onValueChange={(v) => setValue("cityId", v)}
              placeholder={residenceCountryId ? t("common.select") : t("authors.selectCountryFirst")}
              noneLabel={t("common.none")}
              disabled={!residenceCountryId}
              options={(cities.data ?? []).map((c) => ({ value: String(c.id), label: localName(c) }))}
            />
          </Field>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("common.save")}
          </Button>
        </div>
      </form>
    </Card>
  );
}

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6),
    confirmPassword: z.string().min(1),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "mismatch",
  });
type PasswordValues = z.infer<typeof passwordSchema>;

function PasswordCard() {
  const { t } = useTranslation();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: PasswordValues) => {
      const dto: ChangePasswordDto = {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      };
      return accountService.changePassword(dto);
    },
    onSuccess: () => {
      toast.success(t("settings.passwordChanged"));
      reset();
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  return (
    <Card title={t("settings.changePassword")}>
      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="grid gap-4">
        <Field label={t("settings.currentPassword")} error={errors.currentPassword && t("common.required")}>
          <Input type="password" autoComplete="current-password" {...register("currentPassword")} />
        </Field>
        <Field label={t("settings.newPassword")} error={errors.newPassword && t("settings.passwordTooShort")}>
          <Input type="password" autoComplete="new-password" {...register("newPassword")} />
        </Field>
        <Field label={t("settings.confirmPassword")} error={errors.confirmPassword && t("settings.passwordMismatch")}>
          <Input type="password" autoComplete="new-password" {...register("confirmPassword")} />
        </Field>
        <div className="flex justify-end">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("settings.changePassword")}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card">
      <h2 className="border-b px-5 py-3 font-semibold">{title}</h2>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string | false; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function LookupSelect({
  value,
  onValueChange,
  placeholder,
  noneLabel,
  options,
  disabled,
}: {
  value: string;
  onValueChange: (v: string) => void;
  placeholder: string;
  noneLabel: string;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <Select value={value} onValueChange={(v) => onValueChange(v === "none" ? "" : v)} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">{noneLabel}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
