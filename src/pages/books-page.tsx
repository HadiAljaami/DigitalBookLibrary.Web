import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Eye, EyeOff, Download, CheckCircle2, XCircle, Trash2, Pencil, Plus } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookFormDialog } from "@/features/books/book-form-dialog";
import { useServerTable } from "@/hooks/use-server-table";
import { useLanguages, useLocalName, findById } from "@/hooks/use-lookups";
import { toast } from "@/lib/toast-store";
import { catalogService } from "@/services/catalog-service";
import { errorMessage } from "@/lib/error-message";
import { formatDate, formatNumber } from "@/lib/format";
import { type BookListItem } from "@/types/catalog";

export function BooksPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { query, controller } = useServerTable();
  const { name: localName } = useLocalName();
  const languages = useLanguages();

  // undefined = closed; null = create; number = edit that book.
  const [formBookId, setFormBookId] = useState<number | null | undefined>(undefined);
  const formOpen = formBookId !== undefined;

  const books = useQuery({
    queryKey: ["books", query],
    queryFn: () => catalogService.books(query),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["books"] });
  const onError = (err: unknown) => toast.error(errorMessage(err));
  const onSaved = () => {
    toast.success(t("common.saved"));
    invalidate();
  };

  const visibilityMutation = useMutation({
    mutationFn: ({ id, value }: { id: number; value: boolean }) =>
      catalogService.setBookVisibility(id, value),
    onSuccess: onSaved,
    onError,
  });
  const availabilityMutation = useMutation({
    mutationFn: ({ id, value }: { id: number; value: boolean }) =>
      catalogService.setBookAvailability(id, value),
    onSuccess: onSaved,
    onError,
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => catalogService.deleteBook(id),
    onSuccess: () => {
      toast.success(t("common.deleted"));
      invalidate();
    },
    onError,
  });

  const columns: ColumnDef<BookListItem>[] = [
    {
      accessorKey: "title",
      header: t("books.title"),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-8 shrink-0 items-center justify-center overflow-hidden rounded bg-muted">
            {row.original.imageUrl ? (
              <img src={row.original.imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs text-muted-foreground">—</span>
            )}
          </div>
          <div>
            <p className="font-medium">{row.original.title}</p>
            <p className="text-xs text-muted-foreground">{row.original.authorName ?? "—"}</p>
          </div>
        </div>
      ),
    },
    { accessorKey: "categoryName", header: t("nav.categories"), cell: ({ row }) => row.original.categoryName ?? "—" },
    {
      accessorKey: "languageId",
      header: t("books.language"),
      cell: ({ row }) =>
        localName(findById(languages.data, row.original.languageId), row.original.languageName) || "—",
    },
    {
      accessorKey: "publishDate",
      header: t("books.publishDate"),
      cell: ({ row }) => formatDate(row.original.publishDate),
    },
    {
      accessorKey: "downloadsCount",
      header: t("dashboard.downloads"),
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <Download className="h-3.5 w-3.5" />
          {formatNumber(row.original.downloadsCount)}
        </span>
      ),
    },
    {
      accessorKey: "readsCount",
      header: t("dashboard.reads"),
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <Eye className="h-3.5 w-3.5" />
          {formatNumber(row.original.readsCount)}
        </span>
      ),
    },
    {
      id: "state",
      header: t("common.status"),
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          <Badge variant={row.original.isVisible ? "success" : "secondary"}>
            {t(row.original.isVisible ? "books.visible" : "books.hidden")}
          </Badge>
          <Badge variant={row.original.isAvailable ? "default" : "warning"}>
            {t(row.original.isAvailable ? "books.available" : "books.unavailable")}
          </Badge>
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const book = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onSelect={() => setFormBookId(book.id)}>
                <Pencil className="h-4 w-4" />
                {t("books.edit")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => visibilityMutation.mutate({ id: book.id, value: !book.isVisible })}
              >
                {book.isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {t(book.isVisible ? "books.hide" : "books.show")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => availabilityMutation.mutate({ id: book.id, value: !book.isAvailable })}
              >
                {book.isAvailable ? (
                  <XCircle className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {t(book.isAvailable ? "books.makeUnavailable" : "books.makeAvailable")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={() => {
                  if (confirm(t("books.confirmDelete", { title: book.title }))) {
                    deleteMutation.mutate(book.id);
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
                {t("common.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title={t("nav.books")}
        description={t("books.subtitle")}
        actions={
          <Button onClick={() => setFormBookId(null)}>
            <Plus className="h-4 w-4" />
            {t("books.addButton")}
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={books.data?.items ?? []}
        loading={books.isLoading}
        searchPlaceholder={t("books.searchPlaceholder")}
        server={controller(books.data?.totalCount ?? 0)}
      />

      <BookFormDialog
        open={formOpen}
        onOpenChange={(open) => !open && setFormBookId(undefined)}
        bookId={formBookId ?? undefined}
      />
    </div>
  );
}
