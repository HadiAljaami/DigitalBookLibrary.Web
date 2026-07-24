import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Search, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { catalogService } from "@/services/catalog-service";
import { useLanguages, useLocalName } from "@/hooks/use-lookups";
import { flattenCategories } from "@/lib/categories";
import { type BookQuery } from "@/types/catalog";

const ALL = "all";
const PAGE_SIZE = 12;

export function PublicHomePage() {
  const { t } = useTranslation();
  const { name: localName } = useLocalName();
  const languages = useLanguages();

  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [categoryId, setCategoryId] = useState(ALL);
  const [languageId, setLanguageId] = useState(ALL);
  const [page, setPage] = useState(1);

  // Debounce the search box so typing doesn't fire a request per keystroke.
  function onSearchChange(value: string) {
    setSearch(value);
    setPage(1);
    window.clearTimeout((onSearchChange as unknown as { _t?: number })._t);
    (onSearchChange as unknown as { _t?: number })._t = window.setTimeout(() => setDebounced(value), 350);
  }

  const categories = useQuery({ queryKey: ["categories", "tree"], queryFn: () => catalogService.categoryTree() });
  const flatCategories = categories.data ? flattenCategories(categories.data) : [];

  const query: BookQuery = {
    pageNumber: page,
    pageSize: PAGE_SIZE,
    search: debounced || undefined,
    categoryId: categoryId === ALL ? undefined : Number(categoryId),
    languageId: languageId === ALL ? undefined : Number(languageId),
    sortBy: "date",
    desc: true,
  };

  const books = useQuery({
    queryKey: ["public-books", query],
    queryFn: () => catalogService.books(query),
    placeholderData: keepPreviousData,
  });

  const total = books.data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const items = books.data?.items ?? [];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="rounded-2xl border bg-gradient-to-br from-primary/10 via-card to-card p-8 text-center sm:p-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("public.heroTitle")}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{t("public.heroSubtitle")}</p>
        <div className="relative mx-auto mt-6 max-w-xl">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("public.searchPlaceholder")}
            className="h-12 ps-11 text-base"
          />
        </div>
      </section>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={categoryId} onValueChange={(v) => { setCategoryId(v); setPage(1); }}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t("nav.categories")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("public.allCategories")}</SelectItem>
            {flatCategories.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={languageId} onValueChange={(v) => { setLanguageId(v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t("books.language")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("public.allLanguages")}</SelectItem>
            {(languages.data ?? []).map((l) => (
              <SelectItem key={l.id} value={String(l.id)}>{localName(l)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{t("public.results", { count: total })}</span>
      </div>

      {/* Grid */}
      {items.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          {books.isLoading ? t("common.loading") : t("common.noData")}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((b) => (
            <Link
              key={b.id}
              to={`/library/books/${b.id}`}
              className="group flex flex-col overflow-hidden rounded-xl border bg-card transition hover:shadow-md"
            >
              <div className="flex aspect-[3/4] items-center justify-center overflow-hidden bg-muted">
                {b.imageUrl ? (
                  <img
                    src={b.imageUrl}
                    alt={b.title}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <BookOpen className="h-10 w-10 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-1 flex-col p-3">
                <p className="line-clamp-2 font-medium leading-snug">{b.title}</p>
                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                  {b.authors.length ? b.authors.map((a) => a.name).join("، ") : "—"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            {t("table.previous")}
          </Button>
          <span className="text-sm text-muted-foreground">{t("table.page")} {page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            {t("table.next")}
          </Button>
        </div>
      )}
    </div>
  );
}
