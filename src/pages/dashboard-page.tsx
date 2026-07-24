import { useState } from "react";
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
import {
  type DistributionBy,
  type RecentActivity,
  type RecentActivityType,
  type SeriesInterval,
  type TopBooksMetric,
} from "@/types/dashboard";

/** A compact segmented toggle used in chart headers. */
function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="inline-flex rounded-md border bg-muted/40 p-0.5 text-xs">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={
            "rounded px-2.5 py-1 transition " +
            (value === o.value
              ? "bg-background font-medium text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground")
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function DashboardPage() {
  const { t } = useTranslation();

  const [interval, setInterval] = useState<SeriesInterval>("day");
  const [distBy, setDistBy] = useState<DistributionBy>("category");
  const [topMetric, setTopMetric] = useState<TopBooksMetric>("downloads");
  const [recentType, setRecentType] = useState<RecentActivityType>("books");

  const summary = useQuery({ queryKey: ["dashboard", "summary"], queryFn: dashboardService.summary });
  const activity = useQuery({
    queryKey: ["dashboard", "activity", interval],
    queryFn: () => dashboardService.activitySeries(interval),
  });
  const distribution = useQuery({
    queryKey: ["dashboard", "distribution", distBy],
    queryFn: () => dashboardService.distribution(distBy),
  });
  const topBooks = useQuery({
    queryKey: ["dashboard", "top-books", topMetric],
    queryFn: () => dashboardService.topBooks(topMetric, 5),
  });
  const recent = useQuery({
    queryKey: ["dashboard", "recent", recentType],
    queryFn: () => dashboardService.recent(recentType, 6),
  });

  const s = summary.data;

  const metricLabel: Record<TopBooksMetric, string> = {
    downloads: t("dashboard.downloads"),
    reads: t("dashboard.reads"),
    rating: t("reports.rating"),
  };
  // The API field for the "rating" metric is averageRating.
  const metricKey: Record<TopBooksMetric, string> = {
    downloads: "downloads",
    reads: "reads",
    rating: "averageRating",
  };

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
    period: formatPeriod(p.period, interval),
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
            action={
              <Segmented
                value={interval}
                onChange={setInterval}
                options={[
                  { value: "day", label: t("dashboard.daily") },
                  { value: "month", label: t("dashboard.monthly") },
                ]}
              />
            }
          />
        </div>
        <DonutChartCard
          title={distBy === "category" ? t("nav.categories") : t("books.language")}
          description={distBy === "category" ? t("dashboard.booksByCategory") : t("dashboard.booksByLanguage")}
          data={distribution.data ?? []}
          nameKey="label"
          valueKey="count"
          action={
            <Segmented
              value={distBy}
              onChange={setDistBy}
              options={[
                { value: "category", label: t("nav.categories") },
                { value: "language", label: t("books.language") },
              ]}
            />
          }
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <BarChartCard
          title={t("dashboard.topBooks")}
          description={metricLabel[topMetric]}
          data={topBooks.data ?? []}
          xKey="title"
          series={[{ key: metricKey[topMetric], label: metricLabel[topMetric] }]}
          action={
            <Segmented
              value={topMetric}
              onChange={setTopMetric}
              options={[
                { value: "downloads", label: t("dashboard.downloads") },
                { value: "reads", label: t("dashboard.reads") },
                { value: "rating", label: t("reports.rating") },
              ]}
            />
          }
        />
        <div className="rounded-xl border bg-card">
          <div className="flex items-start justify-between p-5 pb-2">
            <div>
              <h3 className="font-semibold">{t("dashboard.recentActivity")}</h3>
              <p className="text-sm text-muted-foreground">{t("dashboard.latestRecords")}</p>
            </div>
            <Segmented
              value={recentType}
              onChange={setRecentType}
              options={[
                { value: "books", label: t("nav.books") },
                { value: "users", label: t("nav.users") },
                { value: "comments", label: t("reports.comments") },
              ]}
            />
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
