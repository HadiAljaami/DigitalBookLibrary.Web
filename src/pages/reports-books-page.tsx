import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Download, Printer, BookOpen, ArrowDownToLine, Eye } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { catalogService } from "@/services/catalog-service";
import { reportService } from "@/services/report-service";
import { useLanguages, useLocalName, findById } from "@/hooks/use-lookups";
import { flattenCategories } from "@/lib/categories";
import { downloadCsv } from "@/lib/csv";
import { formatDate, formatNumber } from "@/lib/format";
import { type BooksReportQuery } from "@/types/report";

const ALL = "all";

export function ReportsBooksPage() {
  const { t, i18n } = useTranslation();
  const { name: localName } = useLocalName();
  const languages = useLanguages();

  const [filters, setFilters] = useState<{
    search: string;
    categoryId: string;
    authorId: string;
    languageId: string;
    fromDate: string;
    toDate: string;
  }>({ search: "", categoryId: ALL, authorId: ALL, languageId: ALL, fromDate: "", toDate: "" });

  const categories = useQuery({
    queryKey: ["categories", "tree"],
    queryFn: () => catalogService.categoryTree(),
  });
  const flatCategories = categories.data ? flattenCategories(categories.data) : [];

  const authors = useQuery({
    queryKey: ["authors", "all"],
    queryFn: () => catalogService.authors({ pageSize: 100 }),
  });

  const query: BooksReportQuery = {
    search: filters.search || undefined,
    categoryId: filters.categoryId === ALL ? undefined : Number(filters.categoryId),
    authorId: filters.authorId === ALL ? undefined : Number(filters.authorId),
    languageId: filters.languageId === ALL ? undefined : Number(filters.languageId),
    fromDate: filters.fromDate || undefined,
    toDate: filters.toDate || undefined,
  };

  const report = useQuery({
    queryKey: ["report", "books", query],
    queryFn: () => reportService.books(query),
  });

  const rows = report.data?.rows ?? [];
  const totals = report.data?.totals ?? { books: 0, downloads: 0, reads: 0 };

  const languageName = (id: number | null, fallback: string | null) =>
    localName(findById(languages.data, id), fallback) || "—";
  const authorNames = (r: (typeof rows)[number]) =>
    r.authors.length ? r.authors.map((a) => a.name).join("، ") : "—";

  function exportCsv() {
    const headers = [
      t("books.title"),
      t("nav.authors"),
      t("nav.categories"),
      t("books.language"),
      t("dashboard.downloads"),
      t("dashboard.reads"),
      t("books.publishDate"),
    ];
    const data = rows.map((r) => [
      r.title,
      r.authors.map((a) => a.name).join(" / "),
      r.categoryName ?? "",
      languageName(r.languageId, r.languageName),
      r.downloadsCount,
      r.readsCount,
      r.publishDate ?? "",
    ]);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`books-report-${stamp}.csv`, headers, data);
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={t("nav.reportsBooks")}
        description={t("reports.booksSubtitle")}
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

      {/* Filters */}
      <div className="grid gap-3 rounded-lg border bg-card p-4 sm:grid-cols-2 lg:grid-cols-3 print:hidden">
        <Field label={t("common.search")}>
          <Input
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            placeholder={t("books.searchPlaceholder")}
          />
        </Field>
        <Field label={t("nav.categories")}>
          <FilterSelect
            value={filters.categoryId}
            onValueChange={(v) => setFilters((f) => ({ ...f, categoryId: v }))}
            allLabel={t("common.all")}
            options={flatCategories.map((c) => ({ value: String(c.id), label: c.label }))}
          />
        </Field>
        <Field label={t("nav.authors")}>
          <FilterSelect
            value={filters.authorId}
            onValueChange={(v) => setFilters((f) => ({ ...f, authorId: v }))}
            allLabel={t("common.all")}
            options={(authors.data?.items ?? []).map((a) => ({ value: String(a.id), label: a.fullName }))}
          />
        </Field>
        <Field label={t("books.language")}>
          <FilterSelect
            value={filters.languageId}
            onValueChange={(v) => setFilters((f) => ({ ...f, languageId: v }))}
            allLabel={t("common.all")}
            options={(languages.data ?? []).map((l) => ({ value: String(l.id), label: localName(l) }))}
          />
        </Field>
        <Field label={t("reports.fromDate")}>
          <Input
            type="date"
            value={filters.fromDate}
            onChange={(e) => setFilters((f) => ({ ...f, fromDate: e.target.value }))}
          />
        </Field>
        <Field label={t("reports.toDate")}>
          <Input
            type="date"
            value={filters.toDate}
            onChange={(e) => setFilters((f) => ({ ...f, toDate: e.target.value }))}
          />
        </Field>
      </div>

      {/* Totals */}
      <div className="grid gap-3 sm:grid-cols-3">
        <TotalCard icon={<BookOpen className="h-5 w-5" />} label={t("reports.totalBooks")} value={totals.books} />
        <TotalCard
          icon={<ArrowDownToLine className="h-5 w-5" />}
          label={t("dashboard.downloads")}
          value={totals.downloads}
        />
        <TotalCard icon={<Eye className="h-5 w-5" />} label={t("dashboard.reads")} value={totals.reads} />
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("books.title")}</TableHead>
              <TableHead>{t("nav.authors")}</TableHead>
              <TableHead>{t("nav.categories")}</TableHead>
              <TableHead>{t("books.language")}</TableHead>
              <TableHead className="text-end">{t("dashboard.downloads")}</TableHead>
              <TableHead className="text-end">{t("dashboard.reads")}</TableHead>
              <TableHead>{t("books.publishDate")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  {report.isLoading ? t("common.loading") : t("common.noData")}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.title}</TableCell>
                  <TableCell>{authorNames(r)}</TableCell>
                  <TableCell>{r.categoryName ?? "—"}</TableCell>
                  <TableCell>{languageName(r.languageId, r.languageName)}</TableCell>
                  <TableCell className="text-end">{formatNumber(r.downloadsCount)}</TableCell>
                  <TableCell className="text-end">{formatNumber(r.readsCount)}</TableCell>
                  <TableCell>{formatDate(r.publishDate)}</TableCell>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function FilterSelect({
  value,
  onValueChange,
  allLabel,
  options,
}: {
  value: string;
  onValueChange: (v: string) => void;
  allLabel: string;
  options: { value: string; label: string }[];
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
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
