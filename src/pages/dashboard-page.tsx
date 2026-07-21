import { useTranslation } from "react-i18next";
import { type ColumnDef } from "@tanstack/react-table";
import { BookOpen, Users, Download, Eye } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { AreaChartCard, BarChartCard, DonutChartCard } from "@/components/dashboard/chart-card";
import { DataTable } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import {
  activitySeries,
  categoryDistribution,
  topBooks,
  recentActivity,
  type RecentRow,
} from "@/data/mock-dashboard";

export function DashboardPage() {
  const { t } = useTranslation();

  const recentColumns: ColumnDef<RecentRow>[] = [
    { accessorKey: "title", header: t("common.name") },
    {
      accessorKey: "type",
      header: t("common.status"),
      cell: ({ row }) => {
        const type = row.original.type;
        const variant = type === "user" ? "success" : type === "book" ? "default" : "secondary";
        return <Badge variant={variant}>{t(`nav.${type === "user" ? "users" : "books"}`)}</Badge>;
      },
    },
    { accessorKey: "subtitle", header: t("common.email") },
    { accessorKey: "when", header: t("common.date") },
  ];

  return (
    <div>
      <PageHeader
        title={t("nav.dashboard")}
        description={t("common.appName")}
      />

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("nav.books")} value="1,284" icon={BookOpen} trend={12} hint={t("common.appName")} accent="text-primary" />
        <StatCard label={t("nav.users")} value="3,510" icon={Users} trend={8} accent="text-[hsl(210_80%_55%)]" />
        <StatCard label="Downloads" value="18,942" icon={Download} trend={-3} accent="text-[hsl(38_92%_50%)]" />
        <StatCard label="Reads" value="42,180" icon={Eye} trend={21} accent="text-[hsl(280_60%_60%)]" />
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AreaChartCard
            title="Activity"
            description="Downloads & reads over time"
            data={activitySeries}
            xKey="period"
            series={[
              { key: "downloads", label: "Downloads" },
              { key: "reads", label: "Reads" },
            ]}
          />
        </div>
        <DonutChartCard
          title={t("nav.categories")}
          description="Books by category"
          data={categoryDistribution}
          nameKey="label"
          valueKey="count"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <BarChartCard
          title="Top Books"
          description="By downloads"
          data={topBooks}
          xKey="title"
          series={[{ key: "downloads", label: "Downloads" }]}
        />
        <div className="rounded-xl border bg-card p-1">
          <div className="p-5 pb-2">
            <h3 className="font-semibold">Recent Activity</h3>
            <p className="text-sm text-muted-foreground">Latest records</p>
          </div>
          <div className="p-2">
            <DataTable
              columns={recentColumns}
              data={recentActivity}
              searchable={false}
              pageSizeOptions={[5, 10]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
