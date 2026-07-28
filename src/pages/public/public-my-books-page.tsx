import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookFormDialog } from "@/features/books/book-form-dialog";
import { memberService } from "@/services/member-service";
import { catalogService } from "@/services/catalog-service";
import { accountService } from "@/services/account-service";
import { toast } from "@/lib/toast-store";
import { errorMessage } from "@/lib/error-message";

export function PublicMyBooksPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  // undefined = closed; null = create; number = edit.
  const [formBookId, setFormBookId] = useState<number | null | undefined>(undefined);

  const books = useQuery({
    queryKey: ["books", "me-published"],
    queryFn: () => memberService.publishedBooks({ pageNumber: 1, pageSize: 50 }),
  });

  // The author's own id locks the publish form to their name.
  const profile = useQuery({ queryKey: ["me", "profile"], queryFn: () => accountService.profile() });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => catalogService.deleteBook(id),
    onSuccess: () => {
      toast.success(t("common.deleted"));
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const visibilityMutation = useMutation({
    mutationFn: ({ id, value }: { id: number; value: boolean }) =>
      catalogService.setBookVisibility(id, value),
    onSuccess: () => {
      toast.success(t("common.saved"));
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const availabilityMutation = useMutation({
    mutationFn: ({ id, value }: { id: number; value: boolean }) =>
      catalogService.setBookAvailability(id, value),
    onSuccess: () => {
      toast.success(t("common.saved"));
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const items = books.data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t("public.myBooks")}</h1>
          <p className="text-muted-foreground">{t("public.myBooksSubtitle")}</p>
        </div>
        <Button className="gap-2" onClick={() => setFormBookId(null)}>
          <Plus className="h-4 w-4" />
          {t("public.publishBook")}
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border py-16 text-center text-muted-foreground">
          {books.isLoading ? t("common.loading") : t("public.noPublished")}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((b) => (
            <div key={b.id} className="flex items-center gap-4 rounded-xl border bg-card p-3">
              <div className="flex h-16 w-12 shrink-0 items-center justify-center overflow-hidden rounded bg-muted">
                {b.imageUrl ? (
                  <img src={b.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link to={`/books/${b.id}`} className="font-medium hover:underline">
                  {b.title}
                </Link>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    title={t("books.toggleVisibility")}
                    disabled={visibilityMutation.isPending}
                    onClick={() => visibilityMutation.mutate({ id: b.id, value: !b.isVisible })}
                  >
                    <Badge variant={b.isVisible ? "success" : "secondary"} className="cursor-pointer">
                      {t(b.isVisible ? "books.visible" : "books.hidden")}
                    </Badge>
                  </button>
                  <button
                    type="button"
                    title={t("books.toggleAvailability")}
                    disabled={availabilityMutation.isPending}
                    onClick={() => availabilityMutation.mutate({ id: b.id, value: !b.isAvailable })}
                  >
                    <Badge variant={b.isAvailable ? "default" : "warning"} className="cursor-pointer">
                      {t(b.isAvailable ? "books.available" : "books.unavailable")}
                    </Badge>
                  </button>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setFormBookId(b.id)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => {
                    if (confirm(t("books.confirmDelete", { title: b.title }))) deleteMutation.mutate(b.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <BookFormDialog
        open={formBookId !== undefined}
        onOpenChange={(open) => !open && setFormBookId(undefined)}
        bookId={formBookId ?? undefined}
        restrictAuthorId={profile.data?.authorId ?? undefined}
      />
    </div>
  );
}
