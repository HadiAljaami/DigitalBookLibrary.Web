import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery, useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";
import { Search, BookOpen, Star, Loader2 } from "lucide-react";
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
import { type BookListItem } from "@/types/catalog";
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
  const [videoOk, setVideoOk] = useState(true);

  // Debounce the search box so typing doesn't fire a request per keystroke.
  function onSearchChange(value: string) {
    setSearch(value);
    window.clearTimeout((onSearchChange as unknown as { _t?: number })._t);
    (onSearchChange as unknown as { _t?: number })._t = window.setTimeout(() => setDebounced(value), 350);
  }

  const categories = useQuery({ queryKey: ["categories", "tree"], queryFn: () => catalogService.categoryTree() });

  function onCategoryChange(v: string) {
    setCategoryId(v);
    // Keep the URL in sync so a category deep-link (from the categories page) stays shareable.
    setSearchParams(v === ALL ? {} : { category: v }, { replace: true });
  }

  const filters = {
    search: debounced || undefined,
    categoryId: categoryId === ALL ? undefined : Number(categoryId),
    languageId: languageId === ALL ? undefined : Number(languageId),
  };

  // "Load more" instead of pages: each fetch appends the next batch (changing filters resets it).
  const books = useInfiniteQuery({
    queryKey: ["public-books", filters],
    queryFn: ({ pageParam }) =>
      catalogService.books({ ...filters, pageNumber: pageParam, pageSize: PAGE_SIZE, sortBy: "date", desc: true }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNext ? last.pageNumber + 1 : undefined),
    placeholderData: keepPreviousData,
  });

  const total = books.data?.pages[0]?.totalCount ?? 0;
  const items = books.data?.pages.flatMap((p) => p.items) ?? [];

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
        <Select value={languageId} onValueChange={(v) => setLanguageId(v)}>
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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {items.map((b) => (
            <BookCard key={b.id} b={b} />
          ))}
        </div>
      )}

      {/* Load more */}
      {books.hasNextPage && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" onClick={() => books.fetchNextPage()} disabled={books.isFetchingNextPage}>
            {books.isFetchingNextPage && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("common.loadMore")}
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
      className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card transition hover:shadow-md"
    >
      {/* Padded, contained cover so the whole book shows (no cropping at the edges) with a soft shelf look. */}
      <div className="flex aspect-[3/4] items-center justify-center overflow-hidden bg-gradient-to-b from-muted/40 to-muted p-3">
        {b.imageUrl ? (
          <img
            src={b.imageUrl}
            alt={b.title}
            className="h-full w-full object-contain drop-shadow-md transition group-hover:scale-105"
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
        {b.ratingCount > 0 && (
          <span className="mt-2 inline-flex items-center gap-1 text-xs text-amber-500">
            <Star className="h-3.5 w-3.5 fill-current" />
            {b.averageRating.toFixed(1)}
            <span className="text-muted-foreground">({b.ratingCount})</span>
          </span>
        )}
      </div>
    </Link>
  );
}

/** A titled showcase row — the same responsive grid as the main list, so every card is one size. */
function Showcase({ title, books }: { title: string; books: BookListItem[] }) {
  if (books.length === 0) return null;
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {books.slice(0, 5).map((b) => (
          <BookCard key={b.id} b={b} />
        ))}
      </div>
    </section>
  );
}
