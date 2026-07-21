import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/dashboard/data-table";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useServerTable } from "@/hooks/use-server-table";
import { adminService } from "@/services/admin-service";
import { formatDate } from "@/lib/format";
import { type AuditLog } from "@/types/admin";

const ENTITIES = ["Book", "Author", "Category", "UserAccount", "UserRole"];
const ACTIONS = ["Create", "Update", "Delete"];

const ACTION_VARIANT: Record<string, BadgeProps["variant"]> = {
  Create: "success",
  Update: "default",
  Delete: "destructive",
};

export function AuditPage() {
  const { t } = useTranslation();
  const { query, controller } = useServerTable();
  const [entityName, setEntityName] = useState("all");
  const [action, setAction] = useState("all");

  const audit = useQuery({
    queryKey: ["audit", query, entityName, action],
    queryFn: () =>
      adminService.audit({
        pageNumber: query.pageNumber,
        pageSize: query.pageSize,
        entityName: entityName === "all" ? undefined : entityName,
        action: action === "all" ? undefined : action,
      }),
  });

  const columns: ColumnDef<AuditLog>[] = [
    {
      accessorKey: "createdAt",
      header: t("common.date"),
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      accessorKey: "entityName",
      header: t("audit.entity"),
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.entityName}
          {row.original.entityId ? ` #${row.original.entityId}` : ""}
        </span>
      ),
    },
    {
      accessorKey: "action",
      header: t("audit.action"),
      cell: ({ row }) => (
        <Badge variant={ACTION_VARIANT[row.original.action] ?? "secondary"}>
          {row.original.action}
        </Badge>
      ),
    },
    {
      accessorKey: "username",
      header: t("audit.by"),
      cell: ({ row }) => row.original.username ?? t("audit.system"),
    },
    { accessorKey: "ipAddress", header: t("audit.ip"), cell: ({ row }) => row.original.ipAddress ?? "—" },
  ];

  return (
    <div>
      <PageHeader title={t("nav.audit")} description={t("audit.subtitle")} />
      <DataTable
        columns={columns}
        data={audit.data?.items ?? []}
        loading={audit.isLoading}
        searchable={false}
        server={controller(audit.data?.totalCount ?? 0)}
        toolbar={
          <div className="flex gap-2">
            <Select value={entityName} onValueChange={setEntityName}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t("audit.entity")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("audit.allEntities")}</SelectItem>
                {ENTITIES.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder={t("audit.action")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("audit.allActions")}</SelectItem>
                {ACTIONS.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />
    </div>
  );
}
