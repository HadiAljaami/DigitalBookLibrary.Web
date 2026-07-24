import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { publisherService } from "@/services/publisher-service";
import { toast } from "@/lib/toast-store";
import { errorMessage } from "@/lib/error-message";
import { type SavePublisherDto } from "@/types/publisher";

const schema = z.object({
  name: z.string().trim().min(1),
  description: z.string(),
  website: z.string(),
  email: z.string(),
  phone: z.string(),
  country: z.string(),
  city: z.string(),
  address: z.string(),
  logoUrl: z.string(),
  isActive: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

const EMPTY: FormValues = {
  name: "",
  description: "",
  website: "",
  email: "",
  phone: "",
  country: "",
  city: "",
  address: "",
  logoUrl: "",
  isActive: true,
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  publisherId?: number;
};

export function PublisherFormDialog({ open, onOpenChange, publisherId }: Props) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isEdit = publisherId != null;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY });

  const detail = useQuery({
    queryKey: ["publisher", publisherId],
    queryFn: () => publisherService.get(publisherId!),
    enabled: open && isEdit,
  });

  useEffect(() => {
    if (!open) return;
    if (isEdit && detail.data) {
      const p = detail.data;
      reset({
        name: p.name,
        description: p.description ?? "",
        website: p.website ?? "",
        email: p.email ?? "",
        phone: p.phone ?? "",
        country: p.country ?? "",
        city: p.city ?? "",
        address: p.address ?? "",
        logoUrl: p.logoUrl ?? "",
        isActive: p.isActive,
      });
    } else if (!isEdit) {
      reset(EMPTY);
    }
  }, [open, isEdit, detail.data, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const dto: SavePublisherDto = {
        name: values.name.trim(),
        description: values.description || null,
        website: values.website || null,
        email: values.email || null,
        phone: values.phone || null,
        country: values.country || null,
        city: values.city || null,
        address: values.address || null,
        logoUrl: values.logoUrl || null,
        isActive: values.isActive,
      };
      return isEdit ? publisherService.update(publisherId!, dto) : publisherService.create(dto);
    },
    onSuccess: () => {
      toast.success(t("common.saved"));
      queryClient.invalidateQueries({ queryKey: ["publishers"] });
      onOpenChange(false);
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t(isEdit ? "publishers.editTitle" : "publishers.addTitle")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="grid gap-4">
          <Field label={t("publishers.name")} error={errors.name && t("common.required")}>
            <Input {...register("name")} />
          </Field>

          <Field label={t("publishers.description")}>
            <Textarea {...register("description")} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("publishers.website")}>
              <Input dir="ltr" placeholder="https://..." {...register("website")} />
            </Field>
            <Field label={t("publishers.email")}>
              <Input dir="ltr" type="email" {...register("email")} />
            </Field>
            <Field label={t("publishers.phone")}>
              <Input dir="ltr" {...register("phone")} />
            </Field>
            <Field label={t("publishers.logoUrl")}>
              <Input dir="ltr" placeholder="https://..." {...register("logoUrl")} />
            </Field>
            <Field label={t("publishers.country")}>
              <Input {...register("country")} />
            </Field>
            <Field label={t("publishers.city")}>
              <Input {...register("city")} />
            </Field>
          </div>

          <Field label={t("publishers.address")}>
            <Input {...register("address")} />
          </Field>

          <div className="flex items-center gap-3">
            <Switch checked={watch("isActive")} onCheckedChange={(v) => setValue("isActive", v)} />
            <Label>{t("publishers.active")}</Label>
          </div>

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
