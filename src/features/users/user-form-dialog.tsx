import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
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
import { adminService } from "@/services/admin-service";
import { toast } from "@/lib/toast-store";
import { errorMessage } from "@/lib/error-message";
import { Roles } from "@/types/auth";
import { type AdminUser, type CreateUserDto, type SaveUserDto } from "@/types/admin";

const ALL_ROLES = [Roles.Admin, Roles.Member];

const schema = z.object({
  username: z.string().trim().min(1),
  email: z.string().trim().email(),
  fullName: z.string(),
  phone: z.string(),
  password: z.string(),
  roles: z.array(z.string()),
});
type FormValues = z.infer<typeof schema>;

const EMPTY: FormValues = {
  username: "",
  email: "",
  fullName: "",
  phone: "",
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

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } =
    useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY });

  useEffect(() => {
    if (!open) return;
    if (user) {
      reset({
        username: user.username,
        email: user.email,
        fullName: user.fullName ?? "",
        phone: user.phone ?? "",
        password: "",
        roles: user.roles,
      });
    } else {
      reset(EMPTY);
    }
  }, [open, user, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      if (isEdit) {
        const dto: SaveUserDto = {
          username: values.username.trim(),
          email: values.email.trim(),
          phone: values.phone || null,
          fullName: values.fullName || null,
        };
        return adminService.updateUser(user!.id, dto);
      }
      const dto: CreateUserDto = {
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
        fullName: values.fullName || null,
        phone: values.phone || null,
        roles: values.roles,
      };
      return adminService.createUser(dto);
    },
    onSuccess: () => {
      toast.success(t("common.saved"));
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onOpenChange(false);
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const roles = watch("roles");
  function toggleRole(role: string) {
    setValue("roles", roles.includes(role) ? roles.filter((r) => r !== role) : [...roles, role]);
  }

  const passwordShort = !isEdit && watch("password").length > 0 && watch("password").length < 6;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t(isEdit ? "users.editTitle" : "users.addTitle")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="grid gap-4">
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending || (!isEdit && (watch("password").length < 6 || roles.length === 0))}
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
