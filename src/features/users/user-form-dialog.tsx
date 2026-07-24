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
import { type AdminUser, type SaveUserDto } from "@/types/admin";

const schema = z.object({
  username: z.string().trim().min(1),
  email: z.string().trim().email(),
  phone: z.string(),
});
type FormValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The account being edited. */
  user: AdminUser | null;
};

export function UserFormDialog({ open, onOpenChange, user }: Props) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", email: "", phone: "" },
  });

  useEffect(() => {
    if (open && user) {
      reset({ username: user.username, email: user.email, phone: user.phone ?? "" });
    }
  }, [open, user, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const dto: SaveUserDto = {
        username: values.username.trim(),
        email: values.email.trim(),
        phone: values.phone || null,
      };
      return adminService.updateUser(user!.id, dto);
    },
    onSuccess: () => {
      toast.success(t("common.saved"));
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onOpenChange(false);
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("users.editTitle")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="grid gap-4">
          <Field label={t("users.username")} error={errors.username && t("common.required")}>
            <Input {...register("username")} />
          </Field>
          <Field label={t("common.email")} error={errors.email && t("common.required")}>
            <Input dir="ltr" type="email" {...register("email")} />
          </Field>
          <Field label={t("common.phone")}>
            <Input dir="ltr" {...register("phone")} />
          </Field>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | false;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
