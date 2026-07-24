import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2, Plus, User } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthorFormDialog } from "@/features/authors/author-form-dialog";
import { useServerTable } from "@/hooks/use-server-table";
import { useCountries, useLocalName, findById } from "@/hooks/use-lookups";
import { toast } from "@/lib/toast-store";
import { catalogService } from "@/services/catalog-service";
import { errorMessage } from "@/lib/error-message";
import { type Author } from "@/types/catalog";

export function AuthorsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { query, controller } = useServerTable();
  const { nationality: localNationality } = useLocalName();
  const countries = useCountries();
  const [formAuthorId, setFormAuthorId] = useState<number | null | undefined>(undefined);
  const formOpen = formAuthorId !== undefined;

  const authors = useQuery({
    queryKey: ["authors", query],
    queryFn: () => catalogService.authors(query),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => catalogService.deleteAuthor(id),
    onSuccess: () => {
      toast.success(t("common.deleted"));
      queryClient.invalidateQueries({ queryKey: ["authors"] });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const columns: ColumnDef<Author>[] = [
    {
      accessorKey: "fullName",
      header: t("authors.fullName"),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar>
            {row.original.imageUrl && <AvatarImage src={row.original.imageUrl} alt="" />}
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{row.original.fullName}</span>
        </div>
      ),
    },
    {
      accessorKey: "nationality",
      header: t("authors.nationality"),
      cell: ({ row }) =>
        localNationality(findById(countries.data, row.original.nationalityCountryId), row.original.nationality) ||
        "—",
    },
    {
      accessorKey: "hasAccount",
      header: t("authors.hasAccount"),
      cell: ({ row }) =>
        row.original.hasAccount ? <Badge variant="secondary">{t("common.yes")}</Badge> : "—",
    },
    {
      accessorKey: "isVisible",
      header: t("common.status"),
      cell: ({ row }) => (
        <Badge variant={row.original.isVisible ? "success" : "secondary"}>
          {t(row.original.isVisible ? "authors.visible" : "books.hidden")}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const author = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setFormAuthorId(author.id)}>
                <Pencil className="h-4 w-4" />
                {t("common.edit")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={() => {
                  if (confirm(t("authors.confirmDelete", { name: author.fullName }))) {
                    deleteMutation.mutate(author.id);
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
        title={t("nav.authors")}
        description={t("authors.subtitle")}
        actions={
          <Button onClick={() => setFormAuthorId(null)}>
            <Plus className="h-4 w-4" />
            {t("authors.addButton")}
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={authors.data?.items ?? []}
        loading={authors.isLoading}
        searchPlaceholder={t("authors.searchPlaceholder")}
        server={controller(authors.data?.totalCount ?? 0)}
      />

      <AuthorFormDialog
        open={formOpen}
        onOpenChange={(open) => !open && setFormAuthorId(undefined)}
        authorId={formAuthorId ?? undefined}
      />
    </div>
  );
}
