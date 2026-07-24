import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, FileText, ExternalLink, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { publisherService } from "@/services/publisher-service";
import { useLanguages, useLocalName } from "@/hooks/use-lookups";
import { flattenCategories } from "@/lib/categories";
import { toast } from "@/lib/toast-store";
import { errorMessage } from "@/lib/error-message";
import { type SaveBookDto } from "@/types/catalog";

const schema = z.object({
  title: z.string().trim().min(1),
  authorIds: z.array(z.number()).min(1),
  categoryId: z.string().min(1),
  description: z.string(),
  publishDate: z.string(),
  pages: z.string(),
  languageId: z.string(),
  publisherId: z.string(),
});
type FormValues = z.infer<typeof schema>;

const EMPTY: FormValues = {
  title: "",
  authorIds: [],
  categoryId: "",
  description: "",
  publishDate: "",
  pages: "",
  languageId: "",
  publisherId: "",
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
  const { name: localName } = useLocalName();
  const languages = useLanguages();

  const coverRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);
  const [openingPdf, setOpeningPdf] = useState(false);

  // Opens the book's PDF in a new tab. The download endpoint needs the auth header, so the file is
  // fetched as a blob and shown via an object URL rather than a plain link.
  async function openPdf() {
    if (bookId == null) return;
    setOpeningPdf(true);
    try {
      const blob = await catalogService.downloadBookPdf(bookId);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setOpeningPdf(false);
    }
  }

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

  const publishers = useQuery({
    queryKey: ["publishers", "all"],
    queryFn: () => publisherService.list({ pageSize: 100, isActive: true }),
    enabled: open,
  });

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
        authorIds: b.authors.map((a) => a.id),
        categoryId: String(b.categoryId),
        description: b.description ?? "",
        publishDate: b.publishDate ?? "",
        pages: b.pages != null ? String(b.pages) : "",
        languageId: b.languageId != null ? String(b.languageId) : "",
        publisherId: b.publisherId != null ? String(b.publisherId) : "",
      });
    } else if (!isEdit) {
      reset(EMPTY);
    }
  }, [open, isEdit, bookDetail.data, reset]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const dto: SaveBookDto = {
        title: values.title.trim(),
        authorIds: values.authorIds,
        categoryId: Number(values.categoryId),
        description: values.description || null,
        publishDate: values.publishDate || null,
        pages: values.pages ? Number(values.pages) : null,
        languageId: values.languageId ? Number(values.languageId) : null,
        publisherId: values.publisherId ? Number(values.publisherId) : null,
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

          <Field label={t("nav.authors")} error={errors.authorIds && t("common.required")}>
            {(() => {
              const selectedIds = watch("authorIds");
              const all = authors.data?.items ?? [];
              const available = all.filter((a) => !selectedIds.includes(a.id));
              return (
                <div className="space-y-2">
                  {selectedIds.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedIds.map((id) => {
                        const a = all.find((x) => x.id === id);
                        return (
                          <Badge key={id} variant="secondary" className="gap-1 pe-1">
                            {a?.fullName ?? `#${id}`}
                            <button
                              type="button"
                              className="rounded-sm hover:text-destructive"
                              onClick={() =>
                                setValue(
                                  "authorIds",
                                  selectedIds.filter((x) => x !== id),
                                  { shouldValidate: true },
                                )
                              }
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                  <Select
                    value=""
                    onValueChange={(v) =>
                      setValue("authorIds", [...selectedIds, Number(v)], { shouldValidate: true })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("books.addAuthor")} />
                    </SelectTrigger>
                    <SelectContent>
                      {available.map((a) => (
                        <SelectItem key={a.id} value={String(a.id)}>
                          {a.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            })()}
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
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
              <Select
                value={watch("languageId")}
                onValueChange={(v) => setValue("languageId", v === "none" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("common.select")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("common.none")}</SelectItem>
                  {languages.data?.map((l) => (
                    <SelectItem key={l.id} value={String(l.id)}>
                      {localName(l)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label={t("books.publisher")}>
            <Select
              value={watch("publisherId")}
              onValueChange={(v) => setValue("publisherId", v === "none" ? "" : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("common.select")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t("common.none")}</SelectItem>
                {publishers.data?.items.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("books.cover")}>
              {isEdit && bookDetail.data?.imageUrl && (
                <img
                  src={bookDetail.data.imageUrl}
                  alt={t("books.cover")}
                  className="mb-2 h-28 w-20 rounded border object-cover"
                />
              )}
              <Input ref={coverRef} type="file" accept="image/*" className="cursor-pointer" />
              {isEdit && bookDetail.data?.imageUrl && (
                <p className="mt-1 text-xs text-muted-foreground">{t("books.replaceHint")}</p>
              )}
            </Field>

            <Field label={t("books.pdf")}>
              {isEdit && bookDetail.data?.hasFile && (
                <div className="mb-2 flex items-center gap-2 rounded-md border p-2 text-sm">
                  <FileText className="h-4 w-4 shrink-0 text-primary" />
                  <span className="flex-1 truncate">{bookDetail.data.title}.pdf</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1"
                    onClick={openPdf}
                    disabled={openingPdf}
                  >
                    {openingPdf ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <ExternalLink className="h-3.5 w-3.5" />
                    )}
                    {t("common.view")}
                  </Button>
                </div>
              )}
              <Input ref={pdfRef} type="file" accept="application/pdf" className="cursor-pointer" />
              {isEdit && bookDetail.data?.hasFile && (
                <p className="mt-1 text-xs text-muted-foreground">{t("books.replaceHint")}</p>
              )}
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
