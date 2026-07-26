import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { Check, X } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/dashboard/data-table";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useServerTable } from "@/hooks/use-server-table";
import { adminService } from "@/services/admin-service";
import { toast } from "@/lib/toast-store";
import { errorMessage } from "@/lib/error-message";
import { formatDate } from "@/lib/format";
import { type AuthorRequest, type AuthorRequestStatus } from "@/types/author-request";

const STATUS_VARIANT: Record<AuthorRequestStatus, BadgeProps["variant"]> = {
  Pending: "warning",
  Approved: "success",
  Rejected: "destructive",
};

export function AuthorRequestsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { query, controller } = useServerTable();
  const [status, setStatus] = useState<"all" | AuthorRequestStatus>("Pending");

  const requests = useQuery({
    queryKey: ["author-requests", query, status],
    queryFn: () =>
      adminService.authorRequests({
        pageNumber: query.pageNumber,
        pageSize: query.pageSize,
        status: status === "all" ? undefined : status,
      }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["author-requests"] });

  const approve = useMutation({
    mutationFn: (id: number) => adminService.approveAuthorRequest(id),
    onSuccess: () => {
      toast.success(t("authorRequests.approved"));
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["authors"] });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const reject = useMutation({
    mutationFn: ({ id, note }: { id: number; note: string | null }) =>
      adminService.rejectAuthorRequest(id, note),
    onSuccess: () => {
      toast.success(t("authorRequests.rejected"));
      invalidate();
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const columns: ColumnDef<AuthorRequest>[] = [
    {
      accessorKey: "username",
      header: t("common.name"),
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.username}</p>
          {row.original.fullName && (
            <p className="text-xs text-muted-foreground">{row.original.fullName}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "note",
      header: t("authorRequests.note"),
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.note ?? "—"}</span>,
    },
    {
      accessorKey: "status",
      header: t("common.status"),
      cell: ({ row }) => (
        <Badge variant={STATUS_VARIANT[row.original.status]}>{t(`authorRequests.status_${row.original.status}`)}</Badge>
      ),
    },
    {
      accessorKey: "dateCreated",
      header: t("common.date"),
      cell: ({ row }) => formatDate(row.original.dateCreated),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) =>
        row.original.status === "Pending" ? (
          <div className="flex gap-1">
            <Button
              size="sm"
              className="h-8 gap-1"
              disabled={approve.isPending}
              onClick={() => approve.mutate(row.original.id)}
            >
              <Check className="h-3.5 w-3.5" />
              {t("authorRequests.approve")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1"
              disabled={reject.isPending}
              onClick={() => {
                const note = window.prompt(t("authorRequests.rejectReason")) ?? null;
                reject.mutate({ id: row.original.id, note });
              }}
            >
              <X className="h-3.5 w-3.5" />
              {t("authorRequests.reject")}
            </Button>
          </div>
        ) : null,
    },
  ];

  return (
    <div>
      <PageHeader title={t("nav.authorRequests")} description={t("authorRequests.subtitle")} />
      <DataTable
        columns={columns}
        data={requests.data?.items ?? []}
        loading={requests.isLoading}
        searchable={false}
        server={controller(requests.data?.totalCount ?? 0)}
        toolbar={
          <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              <SelectItem value="Pending">{t("authorRequests.status_Pending")}</SelectItem>
              <SelectItem value="Approved">{t("authorRequests.status_Approved")}</SelectItem>
              <SelectItem value="Rejected">{t("authorRequests.status_Rejected")}</SelectItem>
            </SelectContent>
          </Select>
        }
      />
    </div>
  );
}
