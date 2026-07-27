import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { adminService } from "@/services/admin-service";
import { useCountries, useCities, useLocalName, findById } from "@/hooks/use-lookups";
import { toast } from "@/lib/toast-store";
import { errorMessage } from "@/lib/error-message";
import { Roles } from "@/types/auth";
import { type AdminUser, type CreateUserDto, type SaveUserDto } from "@/types/admin";

const ALL_ROLES = [Roles.Admin, Roles.Member, Roles.Author];

const schema = z.object({
  username: z.string().trim().min(1),
  email: z.string().trim().email(),
  fullName: z.string(),
  phone: z.string(),
  bio: z.string(),
  birthDate: z.string(),
  nationalityCountryId: z.string(),
  // Residence country is not persisted directly; it filters the city list and is
  // recovered on edit from the saved city's country.
  residenceCountryId: z.string(),
  cityId: z.string(),
  password: z.string(),
  roles: z.array(z.string()),
});
type FormValues = z.infer<typeof schema>;

const EMPTY: FormValues = {
  username: "",
  email: "",
  fullName: "",
  phone: "",
  bio: "",
  birthDate: "",
  nationalityCountryId: "",
  residenceCountryId: "",
  cityId: "",
  password: "",
  roles: [Roles.Member],
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The account being edited; null → create a new one. */
  user: AdminUser | null;
};

export function UserFormDialog({ open, onOpenChange, user }: Props) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isEdit = user !== null;
  const { name: localName } = useLocalName();
  const countries = useCountries();
  const allCities = useCities();
  const avatarRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } =
    useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY });

  // Edit mode loads the full backing Person so every field can be shown, not just the four list columns.
  const detail = useQuery({
    queryKey: ["admin-user", user?.id],
    queryFn: () => adminService.user(user!.id),
    enabled: open && isEdit,
  });

  // The residence country isn't stored; recover it from the saved city so the cascade pre-selects.
  const residenceFromCity = useMemo(() => {
    const cityId = detail.data?.cityId;
    return cityId ? findById(allCities.data, cityId)?.countryId : undefined;
  }, [detail.data?.cityId, allCities.data]);

  useEffect(() => {
    if (!open) return;
    if (isEdit) {
      const d = detail.data;
      if (!d) return;
      reset({
        username: d.username,
        email: d.email,
        fullName: d.fullName ?? "",
        phone: d.phone ?? "",
        bio: d.bio ?? "",
        birthDate: d.birthDate ?? "",
        nationalityCountryId: d.nationalityCountryId != null ? String(d.nationalityCountryId) : "",
        residenceCountryId: residenceFromCity != null ? String(residenceFromCity) : "",
        cityId: d.cityId != null ? String(d.cityId) : "",
        password: "",
        roles: d.roles,
      });
    } else {
      reset(EMPTY);
    }
  }, [open, isEdit, detail.data, residenceFromCity, reset]);

  const residenceCountryId = watch("residenceCountryId");
  const cities = useCities(residenceCountryId ? Number(residenceCountryId) : undefined);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const nationalityCountryId = values.nationalityCountryId
        ? Number(values.nationalityCountryId)
        : null;
      const cityId = values.cityId ? Number(values.cityId) : null;

      let targetId: number;
      if (isEdit) {
        const dto: SaveUserDto = {
          username: values.username.trim(),
          email: values.email.trim(),
          phone: values.phone || null,
          fullName: values.fullName || null,
          bio: values.bio || null,
          birthDate: values.birthDate || null,
          nationalityCountryId,
          cityId,
        };
        const saved = await adminService.updateUser(user!.id, dto);
        targetId = saved.id;
      } else {
        const dto: CreateUserDto = {
          username: values.username.trim(),
          email: values.email.trim(),
          password: values.password,
          phone: values.phone || null,
          fullName: values.fullName || null,
          bio: values.bio || null,
          birthDate: values.birthDate || null,
          nationalityCountryId,
          cityId,
          roles: values.roles,
        };
        const saved = await adminService.createUser(dto);
        targetId = saved.id;
      }

      // The avatar is uploaded to the saved account's id, after its record exists.
      const avatar = avatarRef.current?.files?.[0];
      if (avatar) await adminService.uploadUserAvatar(targetId, avatar);
    },
    onSuccess: () => {
      toast.success(t("common.saved"));
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user", user?.id] });
      onOpenChange(false);
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const roles = watch("roles");
  function toggleRole(role: string) {
    setValue("roles", roles.includes(role) ? roles.filter((r) => r !== role) : [...roles, role]);
  }

  const passwordShort = !isEdit && watch("password").length > 0 && watch("password").length < 6;
  const initials = (watch("username") || "?").slice(0, 2).toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t(isEdit ? "users.editTitle" : "users.addTitle")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="grid gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {isEdit && detail.data?.imageUrl && <AvatarImage src={detail.data.imageUrl} alt="" />}
              <AvatarFallback>
                {isEdit && detail.data?.imageUrl ? <User className="h-6 w-6" /> : initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1.5">
              <Label>{t("settings.avatar")}</Label>
              <Input ref={avatarRef} type="file" accept="image/*" className="cursor-pointer" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("users.username")} error={errors.username && t("common.required")}>
              <Input {...register("username")} />
            </Field>
            <Field label={t("common.email")} error={errors.email && t("common.required")}>
              <Input dir="ltr" type="email" {...register("email")} />
            </Field>
            <Field label={t("authors.fullName")}>
              <Input {...register("fullName")} />
            </Field>
            <Field label={t("common.phone")}>
              <Input dir="ltr" {...register("phone")} />
            </Field>
          </div>

          <Field label={t("authors.bio")}>
            <Textarea {...register("bio")} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t("authors.birthDate")}>
              <Input type="date" {...register("birthDate")} />
            </Field>
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
                  // The current city belongs to the previous country — clear it.
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

          {!isEdit && (
            <>
              <Field
                label={t("settings.newPassword")}
                error={passwordShort && t("settings.passwordTooShort")}
              >
                <Input type="password" autoComplete="new-password" {...register("password")} />
              </Field>
              <div className="space-y-2">
                <Label>{t("users.roles")}</Label>
                <div className="flex gap-4">
                  {ALL_ROLES.map((role) => (
                    <label key={role} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-input accent-primary"
                        checked={roles.includes(role)}
                        onChange={() => toggleRole(role)}
                      />
                      {role}
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {isEdit && (
            <p className="text-xs text-muted-foreground">{t("users.rolesEditHint")}</p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={
                mutation.isPending ||
                (isEdit && detail.isLoading) ||
                (!isEdit && (watch("password").length < 6 || roles.length === 0))
              }
            >
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
