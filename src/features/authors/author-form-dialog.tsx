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
import { catalogService } from "@/services/catalog-service";
import { useCountries, useCities, useLocalName } from "@/hooks/use-lookups";
import { toast } from "@/lib/toast-store";
import { errorMessage } from "@/lib/error-message";
import { type SaveAuthorDto } from "@/types/catalog";

const schema = z.object({
  fullName: z.string().trim().min(1),
  bio: z.string(),
  birthDate: z.string(),
  nationalityCountryId: z.string(),
  // Residence country is not persisted directly; it filters the city list and is
  // recovered on edit from the city's country.
  residenceCountryId: z.string(),
  cityId: z.string(),
  imageUrl: z.string(),
  isVisible: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

const EMPTY: FormValues = {
  fullName: "",
  bio: "",
  birthDate: "",
  nationalityCountryId: "",
  residenceCountryId: "",
  cityId: "",
  imageUrl: "",
  isVisible: true,
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  authorId?: number;
};

export function AuthorFormDialog({ open, onOpenChange, authorId }: Props) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isEdit = authorId != null;
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

  const residenceCountryId = watch("residenceCountryId");
  const cities = useCities(residenceCountryId ? Number(residenceCountryId) : undefined);

  const detail = useQuery({
    queryKey: ["author", authorId],
    queryFn: () => catalogService.author(authorId!),
    enabled: open && isEdit,
  });

  useEffect(() => {
    if (!open) return;
    if (isEdit && detail.data) {
      const a = detail.data;
      reset({
        fullName: a.fullName,
        bio: a.bio ?? "",
        birthDate: a.birthDate ?? "",
        nationalityCountryId: a.nationalityCountryId != null ? String(a.nationalityCountryId) : "",
        residenceCountryId: a.countryId != null ? String(a.countryId) : "",
        cityId: a.cityId != null ? String(a.cityId) : "",
        imageUrl: a.imageUrl ?? "",
        isVisible: a.isVisible,
      });
    } else if (!isEdit) {
      reset(EMPTY);
    }
  }, [open, isEdit, detail.data, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const dto: SaveAuthorDto = {
        fullName: values.fullName.trim(),
        bio: values.bio || null,
        birthDate: values.birthDate || null,
        nationalityCountryId: values.nationalityCountryId ? Number(values.nationalityCountryId) : null,
        cityId: values.cityId ? Number(values.cityId) : null,
        imageUrl: values.imageUrl || null,
        isVisible: values.isVisible,
      };
      return isEdit ? catalogService.updateAuthor(authorId!, dto) : catalogService.createAuthor(dto);
    },
    onSuccess: () => {
      toast.success(t("common.saved"));
      queryClient.invalidateQueries({ queryKey: ["authors"] });
      onOpenChange(false);
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t(isEdit ? "authors.editTitle" : "authors.addTitle")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="grid gap-4">
          <Field label={t("authors.fullName")} error={errors.fullName && t("common.required")}>
            <Input {...register("fullName")} />
          </Field>

          <Field label={t("authors.bio")}>
            <Textarea {...register("bio")} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("authors.birthDate")}>
              <Input type="date" {...register("birthDate")} />
            </Field>

            <Field label={t("authors.nationality")}>
              <Select
                value={watch("nationalityCountryId")}
                onValueChange={(v) => setValue("nationalityCountryId", v === "none" ? "" : v)}
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

            <Field label={t("authors.country")}>
              <Select
                value={watch("residenceCountryId")}
                onValueChange={(v) => {
                  setValue("residenceCountryId", v === "none" ? "" : v);
                  // The current city belongs to the previous country — clear it.
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

            <Field label={t("authors.city")}>
              <Select
                value={watch("cityId")}
                onValueChange={(v) => setValue("cityId", v === "none" ? "" : v)}
                disabled={!residenceCountryId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={residenceCountryId ? t("common.select") : t("authors.selectCountryFirst")} />
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

          <Field label={t("authors.imageUrl")}>
            <Input dir="ltr" placeholder="https://..." {...register("imageUrl")} />
          </Field>

          <div className="flex items-center gap-3">
            <Switch checked={watch("isVisible")} onCheckedChange={(v) => setValue("isVisible", v)} />
            <Label>{t("authors.visible")}</Label>
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
