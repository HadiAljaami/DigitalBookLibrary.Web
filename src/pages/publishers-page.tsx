import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2, Plus, Building2 } from "lucide-react";
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
import { PublisherFormDialog } from "@/features/publishers/publisher-form-dialog";
import { useServerTable } from "@/hooks/use-server-table";
import { toast } from "@/lib/toast-store";
import { publisherService } from "@/services/publisher-service";
import { errorMessage } from "@/lib/error-message";
import { type PublisherListItem } from "@/types/publisher";

export function PublishersPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { query, controller } = useServerTable();
  const [formId, setFormId] = useState<number | null | undefined>(undefined);
  const formOpen = formId !== undefined;

  const publishers = useQuery({
    queryKey: ["publishers", query],
    queryFn: () => publisherService.list(query),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => publisherService.delete(id),
    onSuccess: () => {
      toast.success(t("common.deleted"));
      queryClient.invalidateQueries({ queryKey: ["publishers"] });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const columns: ColumnDef<PublisherListItem>[] = [
    {
      accessorKey: "name",
      header: t("publishers.name"),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
            <Building2 className="h-4 w-4" />
          </div>
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    { accessorKey: "country", header: t("publishers.country"), cell: ({ row }) => row.original.country ?? "—" },
    { accessorKey: "city", header: t("publishers.city"), cell: ({ row }) => row.original.city ?? "—" },
    { accessorKey: "booksCount", header: t("publishers.books") },
    {
      accessorKey: "isActive",
      header: t("common.status"),
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "success" : "secondary"}>
          {t(row.original.isActive ? "common.active" : "common.inactive")}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const publisher = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setFormId(publisher.id)}>
                <Pencil className="h-4 w-4" />
                {t("common.edit")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={() => {
                  if (confirm(t("publishers.confirmDelete", { name: publisher.name }))) {
                    deleteMutation.mutate(publisher.id);
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
        title={t("nav.publishers")}
        description={t("publishers.subtitle")}
        actions={
          <Button onClick={() => setFormId(null)}>
            <Plus className="h-4 w-4" />
            {t("publishers.addButton")}
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={publishers.data?.items ?? []}
        loading={publishers.isLoading}
        searchPlaceholder={t("publishers.searchPlaceholder")}
        server={controller(publishers.data?.totalCount ?? 0)}
      />

      <PublisherFormDialog
        open={formOpen}
        onOpenChange={(open) => !open && setFormId(undefined)}
        publisherId={formId ?? undefined}
      />
    </div>
  );
}
