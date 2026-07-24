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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { publisherService } from "@/services/publisher-service";
import { useCountries, useCities, useLocalName } from "@/hooks/use-lookups";
import { toast } from "@/lib/toast-store";
import { errorMessage } from "@/lib/error-message";
import { type SavePublisherDto } from "@/types/publisher";

const schema = z.object({
  name: z.string().trim().min(1),
  description: z.string(),
  website: z.string(),
  email: z.string(),
  phone: z.string(),
  countryId: z.string(),
  cityId: z.string(),
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
  countryId: "",
  cityId: "",
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
  const { name: localName } = useLocalName();
  const countries = useCountries();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY });

  const countryId = watch("countryId");
  const cities = useCities(countryId ? Number(countryId) : undefined);

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
        countryId: p.countryId != null ? String(p.countryId) : "",
        cityId: p.cityId != null ? String(p.cityId) : "",
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
        countryId: values.countryId ? Number(values.countryId) : null,
        cityId: values.cityId ? Number(values.cityId) : null,
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
              <Select
                value={watch("countryId")}
                onValueChange={(v) => {
                  setValue("countryId", v === "none" ? "" : v);
                  setValue("cityId", "");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("common.select")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("common.none")}</SelectItem>
                  {countries.data?.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {localName(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label={t("publishers.city")}>
              <Select
                value={watch("cityId")}
                onValueChange={(v) => setValue("cityId", v === "none" ? "" : v)}
                disabled={!countryId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={countryId ? t("common.select") : t("authors.selectCountryFirst")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("common.none")}</SelectItem>
                  {cities.data?.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {localName(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
