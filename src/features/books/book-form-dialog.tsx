import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { catalogService } from "@/services/catalog-service";
import { flattenCategories } from "@/lib/categories";
import { toast } from "@/lib/toast-store";
import { errorMessage } from "@/lib/error-message";
import { type SaveBookDto } from "@/types/catalog";

const schema = z.object({
  title: z.string().trim().min(1),
  authorId: z.string().min(1),
  categoryId: z.string().min(1),
  description: z.string(),
  publishDate: z.string(),
  pages: z.string(),
  language: z.string(),
  publisherName: z.string(),
});
type FormValues = z.infer<typeof schema>;

const EMPTY: FormValues = {
  title: "",
  authorId: "",
  categoryId: "",
  description: "",
  publishDate: "",
  pages: "",
  language: "",
  publisherName: "",
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** undefined → create; a number → edit that book. */
  bookId?: number;
};

export function BookFormDialog({ open, onOpenChange, bookId }: Props) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isEdit = bookId != null;

  const coverRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY });

  // Dropdown sources.
  const authors = useQuery({
    queryKey: ["authors", "all"],
    queryFn: () => catalogService.authors({ pageSize: 100 }),
    enabled: open,
  });
  const categories = useQuery({
    queryKey: ["categories", "tree"],
    queryFn: () => catalogService.categoryTree(),
    enabled: open,
  });
  const flatCategories = categories.data ? flattenCategories(categories.data) : [];

  // Prefill in edit mode.
  const bookDetail = useQuery({
    queryKey: ["book", bookId],
    queryFn: () => catalogService.book(bookId!),
    enabled: open && isEdit,
  });

  useEffect(() => {
    if (!open) return;
    if (isEdit && bookDetail.data) {
      const b = bookDetail.data;
      reset({
        title: b.title,
        authorId: String(b.authorId),
        categoryId: String(b.categoryId),
        description: b.description ?? "",
        publishDate: b.publishDate ?? "",
        pages: b.pages != null ? String(b.pages) : "",
        language: b.language ?? "",
        publisherName: b.publisherName ?? "",
      });
    } else if (!isEdit) {
      reset(EMPTY);
    }
  }, [open, isEdit, bookDetail.data, reset]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const dto: SaveBookDto = {
        title: values.title.trim(),
        authorId: Number(values.authorId),
        categoryId: Number(values.categoryId),
        description: values.description || null,
        publishDate: values.publishDate || null,
        pages: values.pages ? Number(values.pages) : null,
        language: values.language || null,
        publisherName: values.publisherName || null,
      };

      const saved = isEdit
        ? await catalogService.updateBook(bookId!, dto)
        : await catalogService.createBook(dto);

      // Files are uploaded to the saved book's id, after its metadata exists.
      const cover = coverRef.current?.files?.[0];
      const pdf = pdfRef.current?.files?.[0];
      if (cover) await catalogService.uploadBookCover(saved.id, cover);
      if (pdf) await catalogService.uploadBookPdf(saved.id, pdf);
    },
    onSuccess: () => {
      toast.success(t("common.saved"));
      queryClient.invalidateQueries({ queryKey: ["books"] });
      onOpenChange(false);
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t(isEdit ? "books.editTitle" : "books.addTitle")}</DialogTitle>
          <DialogDescription>{t("books.formSubtitle")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="grid gap-4">
          <Field label={t("books.title")} error={errors.title && t("common.required")}>
            <Input {...register("title")} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("nav.authors")} error={errors.authorId && t("common.required")}>
              <Select value={watch("authorId")} onValueChange={(v) => setValue("authorId", v, { shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue placeholder={t("common.select")} />
                </SelectTrigger>
                <SelectContent>
                  {authors.data?.items.map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {a.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label={t("nav.categories")} error={errors.categoryId && t("common.required")}>
              <Select value={watch("categoryId")} onValueChange={(v) => setValue("categoryId", v, { shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue placeholder={t("common.select")} />
                </SelectTrigger>
                <SelectContent>
                  {flatCategories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label={t("books.description")}>
            <Textarea {...register("description")} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t("books.publishDate")}>
              <Input type="date" {...register("publishDate")} />
            </Field>
            <Field label={t("books.pages")}>
              <Input type="number" min={1} {...register("pages")} />
            </Field>
            <Field label={t("books.language")}>
              <Input {...register("language")} />
            </Field>
          </div>

          <Field label={t("books.publisher")}>
            <Input {...register("publisherName")} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("books.cover")}>
              <Input ref={coverRef} type="file" accept="image/*" className="cursor-pointer" />
            </Field>
            <Field label={t("books.pdf")}>
              <Input ref={pdfRef} type="file" accept="application/pdf" className="cursor-pointer" />
            </Field>
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
