import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Printer, Download, BookOpen, Users, PenTool, FolderTree, ArrowDownToLine, Eye } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { dashboardService } from "@/services/dashboard-service";
import { downloadCsv } from "@/lib/csv";
import { formatNumber } from "@/lib/format";

export function ReportsOverviewPage() {
  const { t, i18n } = useTranslation();

  const summary = useQuery({ queryKey: ["dashboard", "summary"], queryFn: () => dashboardService.summary() });
  const topBooks = useQuery({
    queryKey: ["dashboard", "top-books", "downloads", 10],
    queryFn: () => dashboardService.topBooks("downloads", 10),
  });
  const byCategory = useQuery({
    queryKey: ["dashboard", "distribution", "category"],
    queryFn: () => dashboardService.distribution("category"),
  });

  const s = summary.data;
  const cards = [
    { icon: <BookOpen className="h-5 w-5" />, label: t("nav.books"), value: s?.books ?? 0 },
    { icon: <Users className="h-5 w-5" />, label: t("nav.users"), value: s?.users ?? 0 },
    { icon: <PenTool className="h-5 w-5" />, label: t("nav.authors"), value: s?.authors ?? 0 },
    { icon: <FolderTree className="h-5 w-5" />, label: t("nav.categories"), value: s?.categories ?? 0 },
    { icon: <ArrowDownToLine className="h-5 w-5" />, label: t("dashboard.downloads"), value: s?.downloads ?? 0 },
    { icon: <Eye className="h-5 w-5" />, label: t("dashboard.reads"), value: s?.reads ?? 0 },
  ];

  function exportCsv() {
    const headers = [t("common.name"), t("dashboard.downloads"), t("dashboard.reads"), t("reports.rating")];
    const data = (topBooks.data ?? []).map((b) => [b.title, b.downloads, b.reads, b.averageRating]);
    downloadCsv(`overview-top-books-${new Date().toISOString().slice(0, 10)}.csv`, headers, data);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("nav.reportsOverview")}
        description={t("reports.overviewSubtitle")}
        actions={
          <div className="flex gap-2 print:hidden">
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              {t("reports.print")}
            </Button>
            <Button onClick={exportCsv} disabled={(topBooks.data ?? []).length === 0}>
              <Download className="h-4 w-4" />
              {t("reports.exportCsv")}
            </Button>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <div key={c.label} className="flex items-center gap-3 rounded-lg border bg-card p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {c.icon}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className="text-xl font-semibold">{formatNumber(c.value)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Section title={t("dashboard.topBooks")}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("books.title")}</TableHead>
                <TableHead className="text-end">{t("dashboard.downloads")}</TableHead>
                <TableHead className="text-end">{t("dashboard.reads")}</TableHead>
                <TableHead className="text-end">{t("reports.rating")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(topBooks.data ?? []).map((b) => (
                <TableRow key={b.bookId}>
                  <TableCell className="font-medium">{b.title}</TableCell>
                  <TableCell className="text-end">{formatNumber(b.downloads)}</TableCell>
                  <TableCell className="text-end">{formatNumber(b.reads)}</TableCell>
                  <TableCell className="text-end">{b.averageRating.toFixed(1)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Section>

        <Section title={t("dashboard.booksByCategory")}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("nav.categories")}</TableHead>
                <TableHead className="text-end">{t("nav.books")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(byCategory.data ?? []).map((slice) => (
                <TableRow key={slice.label}>
                  <TableCell className="font-medium">{slice.label}</TableCell>
                  <TableCell className="text-end">{formatNumber(slice.count)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Section>
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border">
      <h2 className="border-b px-4 py-3 font-semibold">{title}</h2>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}
