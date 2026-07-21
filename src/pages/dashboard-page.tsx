import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { BookOpen, Users, Download, Eye, PenTool, FolderTree } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { AreaChartCard, BarChartCard, DonutChartCard } from "@/components/dashboard/chart-card";
import { DataTable } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { dashboardService } from "@/services/dashboard-service";
import { formatDate, formatNumber, formatPeriod } from "@/lib/format";
import { type RecentActivity } from "@/types/dashboard";

export function DashboardPage() {
  const { t } = useTranslation();

  const summary = useQuery({ queryKey: ["dashboard", "summary"], queryFn: dashboardService.summary });
  const activity = useQuery({
    queryKey: ["dashboard", "activity", "day"],
    queryFn: () => dashboardService.activitySeries("day"),
  });
  const distribution = useQuery({
    queryKey: ["dashboard", "distribution", "category"],
    queryFn: () => dashboardService.distribution("category"),
  });
  const topBooks = useQuery({
    queryKey: ["dashboard", "top-books", "downloads"],
    queryFn: () => dashboardService.topBooks("downloads", 5),
  });
  const recent = useQuery({
    queryKey: ["dashboard", "recent", "books"],
    queryFn: () => dashboardService.recent("books", 6),
  });

  const s = summary.data;

  const recentColumns: ColumnDef<RecentActivity>[] = [
    { accessorKey: "title", header: t("common.name") },
    {
      accessorKey: "type",
      header: t("common.status"),
      cell: ({ row }) => {
        const type = row.original.type;
        const variant = type === "user" ? "success" : type === "book" ? "default" : "secondary";
        const key = type === "user" ? "users" : type === "book" ? "books" : "reports";
        return <Badge variant={variant}>{t(`nav.${key}`)}</Badge>;
      },
    },
    { accessorKey: "subtitle", header: t("common.email") },
    { accessorKey: "when", header: t("common.date"), cell: ({ row }) => formatDate(row.original.when) },
  ];

  const activityData = (activity.data ?? []).map((p) => ({
    ...p,
    period: formatPeriod(p.period, "day"),
  }));

  return (
    <div>
      <PageHeader title={t("nav.dashboard")} description={t("common.appName")} />

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("nav.books")} value={s ? formatNumber(s.books) : "—"} icon={BookOpen} loading={summary.isLoading} accent="text-primary" />
        <StatCard label={t("nav.users")} value={s ? formatNumber(s.users) : "—"} icon={Users} loading={summary.isLoading} accent="text-[hsl(210_80%_55%)]" />
        <StatCard label={t("nav.authors")} value={s ? formatNumber(s.authors) : "—"} icon={PenTool} loading={summary.isLoading} accent="text-[hsl(280_60%_60%)]" />
        <StatCard label={t("nav.categories")} value={s ? formatNumber(s.categories) : "—"} icon={FolderTree} loading={summary.isLoading} accent="text-[hsl(38_92%_50%)]" />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <StatCard label={t("dashboard.downloads")} value={s ? formatNumber(s.downloads) : "—"} icon={Download} loading={summary.isLoading} accent="text-primary" />
        <StatCard label={t("dashboard.reads")} value={s ? formatNumber(s.reads) : "—"} icon={Eye} loading={summary.isLoading} accent="text-[hsl(210_80%_55%)]" />
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AreaChartCard
            title={t("dashboard.activity")}
            description={t("dashboard.activityDesc")}
            data={activityData}
            xKey="period"
            series={[
              { key: "downloads", label: t("dashboard.downloads") },
              { key: "reads", label: t("dashboard.reads") },
            ]}
          />
        </div>
        <DonutChartCard
          title={t("nav.categories")}
          description={t("dashboard.booksByCategory")}
          data={distribution.data ?? []}
          nameKey="label"
          valueKey="count"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <BarChartCard
          title={t("dashboard.topBooks")}
          description={t("dashboard.byDownloads")}
          data={topBooks.data ?? []}
          xKey="title"
          series={[{ key: "downloads", label: t("dashboard.downloads") }]}
        />
        <div className="rounded-xl border bg-card">
          <div className="p-5 pb-2">
            <h3 className="font-semibold">{t("dashboard.recentActivity")}</h3>
            <p className="text-sm text-muted-foreground">{t("dashboard.latestRecords")}</p>
          </div>
          <div className="p-2">
            <DataTable
              columns={recentColumns}
              data={recent.data ?? []}
              searchable={false}
              loading={recent.isLoading}
              pageSizeOptions={[5, 10]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
