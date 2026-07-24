import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
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
import { type AdminUser } from "@/types/admin";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser | null;
};

export function ResetPasswordDialog({ open, onOpenChange, user }: Props) {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (open) setPassword("");
  }, [open]);

  const mutation = useMutation({
    mutationFn: () => adminService.resetUserPassword(user!.id, password),
    onSuccess: () => {
      toast.success(t("users.passwordReset"));
      onOpenChange(false);
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("users.resetPasswordFor", { name: user?.username ?? "" })}</DialogTitle>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label>{t("settings.newPassword")}</Label>
          <Input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {password.length > 0 && password.length < 6 && (
            <p className="text-xs text-destructive">{t("settings.passwordTooShort")}</p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || password.length < 6}>
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("users.resetPassword")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
