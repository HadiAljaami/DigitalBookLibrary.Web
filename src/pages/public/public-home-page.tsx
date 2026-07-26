import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
import { CategorySelect } from "@/components/catalog/category-select";
import { catalogService } from "@/services/catalog-service";
import { useLanguages, useLocalName } from "@/hooks/use-lookups";
import { type BookListItem, type BookQuery } from "@/types/catalog";
// Imported (not from /public) so the bundler fingerprints it → the host serves it with a long,
// immutable cache and the browser reuses it across refreshes instead of re-downloading.
import heroVideo from "@/assets/hero.mp4";

const ALL = "all";
const PAGE_SIZE = 12;

export function PublicHomePage() {
  const { t } = useTranslation();
  const { name: localName } = useLocalName();
  const languages = useLanguages();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [categoryId, setCategoryId] = useState(searchParams.get("category") ?? ALL);
  const [languageId, setLanguageId] = useState(ALL);
  const [page, setPage] = useState(1);
  const [videoOk, setVideoOk] = useState(true);

  // Debounce the search box so typing doesn't fire a request per keystroke.
  function onSearchChange(value: string) {
    setSearch(value);
    setPage(1);
    window.clearTimeout((onSearchChange as unknown as { _t?: number })._t);
    (onSearchChange as unknown as { _t?: number })._t = window.setTimeout(() => setDebounced(value), 350);
  }

  const categories = useQuery({ queryKey: ["categories", "tree"], queryFn: () => catalogService.categoryTree() });

  function onCategoryChange(v: string) {
    setCategoryId(v);
    setPage(1);
    // Keep the URL in sync so a category deep-link (from the categories page) stays shareable.
    setSearchParams(v === ALL ? {} : { category: v }, { replace: true });
  }

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

  // Showcase rows appear only on the plain landing view (no search or filter).
  const isDefault = !debounced && categoryId === ALL && languageId === ALL;
  const showcase = (sortBy: string) =>
    useQuery({
      queryKey: ["showcase", sortBy],
      queryFn: () => catalogService.books({ pageNumber: 1, pageSize: 10, sortBy, desc: true }),
      enabled: isDefault,
    });
  const newest = showcase("date");
  const topDownloads = showcase("downloads");
  const topReads = showcase("reads");

  return (
    <div className="space-y-8">
      {/* Hero: a looping background video over a gradient that also serves as the fallback. */}
      <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary via-primary/70 to-primary/40">
        {videoOk && (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src={heroVideo}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden
            onError={() => setVideoOk(false)}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/55 to-black/40" />
        <div className="relative px-6 py-14 text-center sm:px-10 sm:py-20">
          <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow sm:text-5xl">
            {t("public.heroTitle")}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-white/85 sm:text-lg">{t("public.heroSubtitle")}</p>
          <div className="relative mx-auto mt-7 max-w-xl">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t("public.searchPlaceholder")}
              className="h-12 border-transparent bg-background ps-11 text-base shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <CategorySelect
          tree={categories.data ?? []}
          value={categoryId}
          onValueChange={onCategoryChange}
          className="w-52"
          placeholder={t("nav.categories")}
          leadingOption={{ value: ALL, label: t("public.allCategories") }}
        />
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

      {/* Showcase rows on the plain landing view */}
      {isDefault && (
        <div className="space-y-8">
          <Showcase title={t("public.newest")} books={newest.data?.items ?? []} />
          <Showcase title={t("public.mostDownloaded")} books={topDownloads.data?.items ?? []} />
          <Showcase title={t("public.mostRead")} books={topReads.data?.items ?? []} />
        </div>
      )}

      {/* Grid */}
      {isDefault && <h2 className="text-lg font-semibold">{t("public.allBooks")}</h2>}
      {items.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          {books.isLoading ? t("common.loading") : t("common.noData")}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((b) => (
            <BookCard key={b.id} b={b} />
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

/** A single book cover card linking to the book's detail page. */
function BookCard({ b }: { b: BookListItem }) {
  return (
    <Link
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
  );
}

/** A titled, horizontally scrollable row of books (a home-page showcase). */
function Showcase({ title, books }: { title: string; books: BookListItem[] }) {
  if (books.length === 0) return null;
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {books.map((b) => (
          <div key={b.id} className="w-36 shrink-0 sm:w-40">
            <BookCard b={b} />
          </div>
        ))}
      </div>
    </section>
  );
}
