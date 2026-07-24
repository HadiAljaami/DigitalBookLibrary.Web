import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Download, Printer, Users, ArrowDownToLine, Eye } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { reportService } from "@/services/report-service";
import { downloadCsv } from "@/lib/csv";
import { formatDate, formatNumber } from "@/lib/format";
import { type UsersReportQuery } from "@/types/report";

export function ReportsUsersPage() {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<"all" | "active" | "inactive">("all");

  const query: UsersReportQuery = {
    search: search || undefined,
    isActive: active === "all" ? undefined : active === "active",
  };

  const report = useQuery({
    queryKey: ["report", "users", query],
    queryFn: () => reportService.users(query),
  });

  const rows = report.data?.rows ?? [];
  const totals = report.data?.totals ?? { users: 0, reads: 0, downloads: 0 };

  function exportCsv() {
    const headers = [
      t("users.username"),
      t("common.email"),
      t("common.status"),
      t("dashboard.reads"),
      t("dashboard.downloads"),
      t("reports.saved"),
      t("reports.comments"),
      t("reports.ratings"),
      t("reports.lastActive"),
    ];
    const data = rows.map((r) => [
      r.username,
      r.email,
      r.isActive ? t("common.active") : t("common.inactive"),
      r.reads,
      r.downloads,
      r.saved,
      r.comments,
      r.ratings,
      r.lastActivity ?? "",
    ]);
    downloadCsv(`users-report-${new Date().toISOString().slice(0, 10)}.csv`, headers, data);
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={t("nav.reportsUsers")}
        description={t("reports.usersSubtitle")}
        actions={
          <div className="flex gap-2 print:hidden">
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              {t("reports.print")}
            </Button>
            <Button onClick={exportCsv} disabled={rows.length === 0}>
              <Download className="h-4 w-4" />
              {t("reports.exportCsv")}
            </Button>
          </div>
        }
      />

      <div className="grid gap-3 rounded-lg border bg-card p-4 sm:grid-cols-2 print:hidden">
        <div className="space-y-1.5">
          <Label>{t("common.search")}</Label>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("users.searchPlaceholder")}
          />
        </div>
        <div className="space-y-1.5">
          <Label>{t("common.status")}</Label>
          <Select value={active} onValueChange={(v) => setActive(v as typeof active)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              <SelectItem value="active">{t("common.active")}</SelectItem>
              <SelectItem value="inactive">{t("common.inactive")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <TotalCard icon={<Users className="h-5 w-5" />} label={t("reports.totalUsers")} value={totals.users} />
        <TotalCard icon={<Eye className="h-5 w-5" />} label={t("dashboard.reads")} value={totals.reads} />
        <TotalCard
          icon={<ArrowDownToLine className="h-5 w-5" />}
          label={t("dashboard.downloads")}
          value={totals.downloads}
        />
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("users.username")}</TableHead>
              <TableHead>{t("common.email")}</TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead className="text-end">{t("dashboard.reads")}</TableHead>
              <TableHead className="text-end">{t("dashboard.downloads")}</TableHead>
              <TableHead className="text-end">{t("reports.saved")}</TableHead>
              <TableHead className="text-end">{t("reports.comments")}</TableHead>
              <TableHead className="text-end">{t("reports.ratings")}</TableHead>
              <TableHead>{t("reports.lastActive")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                  {report.isLoading ? t("common.loading") : t("common.noData")}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.userId}>
                  <TableCell className="font-medium">{r.username}</TableCell>
                  <TableCell dir="ltr" className="text-start">{r.email}</TableCell>
                  <TableCell>
                    <Badge variant={r.isActive ? "success" : "secondary"}>
                      {t(r.isActive ? "common.active" : "common.inactive")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-end">{formatNumber(r.reads)}</TableCell>
                  <TableCell className="text-end">{formatNumber(r.downloads)}</TableCell>
                  <TableCell className="text-end">{formatNumber(r.saved)}</TableCell>
                  <TableCell className="text-end">{formatNumber(r.comments)}</TableCell>
                  <TableCell className="text-end">{formatNumber(r.ratings)}</TableCell>
                  <TableCell>{r.lastActivity ? formatDate(r.lastActivity) : "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        {t("reports.generatedAt", {
          date: new Intl.DateTimeFormat(i18n.language, { dateStyle: "long", timeStyle: "short" }).format(
            new Date(),
          ),
        })}
      </p>
    </div>
  );
}

function TotalCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold">{formatNumber(value)}</p>
      </div>
    </div>
  );
}
