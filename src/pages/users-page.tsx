import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useServerTable } from "@/hooks/use-server-table";
import { toast } from "@/lib/toast-store";
import { useAuth } from "@/providers/auth-provider";
import { adminService } from "@/services/admin-service";
import { errorMessage } from "@/lib/error-message";
import { formatDate } from "@/lib/format";
import { Roles } from "@/types/auth";
import { type AdminUser } from "@/types/admin";

const ALL_ROLES = [Roles.Admin, Roles.Member];

export function UsersPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const { query, controller } = useServerTable();
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");

  const isActive = activeFilter === "all" ? undefined : activeFilter === "active";

  const users = useQuery({
    queryKey: ["users", query, isActive],
    queryFn: () => adminService.users({ ...query, isActive }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["users"] });

  const activeMutation = useMutation({
    mutationFn: ({ id, value }: { id: number; value: boolean }) =>
      adminService.setUserActive(id, value),
    onSuccess: () => {
      toast.success(t("common.saved"));
      invalidate();
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const rolesMutation = useMutation({
    mutationFn: ({ id, roles }: { id: number; roles: string[] }) =>
      adminService.setUserRoles(id, roles),
    onSuccess: () => {
      toast.success(t("common.saved"));
      invalidate();
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  function toggleRole(user: AdminUser, role: string) {
    const roles = user.roles.includes(role)
      ? user.roles.filter((r) => r !== role)
      : [...user.roles, role];
    rolesMutation.mutate({ id: user.id, roles });
  }

  const columns: ColumnDef<AdminUser>[] = [
    { accessorKey: "username", header: t("common.name") },
    { accessorKey: "email", header: t("common.email") },
    {
      accessorKey: "phone",
      header: t("common.phone"),
      cell: ({ row }) => row.original.phone ?? "—",
    },
    {
      accessorKey: "roles",
      header: t("common.role"),
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.roles.map((role) => (
            <Badge key={role} variant={role === Roles.Admin ? "default" : "secondary"}>
              {role}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "isActive",
      header: t("common.status"),
      cell: ({ row }) => {
        const user = row.original;
        const isSelf = user.id === currentUser?.id;
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={user.isActive}
              disabled={isSelf || activeMutation.isPending}
              onCheckedChange={(value) => activeMutation.mutate({ id: user.id, value })}
            />
            <span className="text-sm text-muted-foreground">
              {t(user.isActive ? "common.active" : "common.inactive")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "dateCreated",
      header: t("common.date"),
      cell: ({ row }) => formatDate(row.original.dateCreated),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const user = row.original;
        const isSelf = user.id === currentUser?.id;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isSelf}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                {t("users.roles")}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ALL_ROLES.map((role) => (
                <DropdownMenuCheckboxItem
                  key={role}
                  checked={user.roles.includes(role)}
                  disabled={rolesMutation.isPending}
                  onSelect={(e) => {
                    e.preventDefault();
                    toggleRole(user, role);
                  }}
                >
                  {role}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader title={t("nav.users")} description={t("users.subtitle")} />
      <DataTable
        columns={columns}
        data={users.data?.items ?? []}
        loading={users.isLoading}
        searchPlaceholder={t("users.searchPlaceholder")}
        server={controller(users.data?.totalCount ?? 0)}
        toolbar={
          <Select value={activeFilter} onValueChange={(v) => setActiveFilter(v as typeof activeFilter)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              <SelectItem value="active">{t("common.active")}</SelectItem>
              <SelectItem value="inactive">{t("common.inactive")}</SelectItem>
            </SelectContent>
          </Select>
        }
      />
    </div>
  );
}
