import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";
import { Search, User, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { catalogService } from "@/services/catalog-service";
import { useCountries, useLocalName, findById } from "@/hooks/use-lookups";

const PAGE_SIZE = 18;

export function PublicAuthorsPage() {
  const { t } = useTranslation();
  const { nationality: localNationality } = useLocalName();
  const countries = useCountries();

  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  function onSearchChange(value: string) {
    setSearch(value);
    window.clearTimeout((onSearchChange as unknown as { _t?: number })._t);
    (onSearchChange as unknown as { _t?: number })._t = window.setTimeout(() => setDebounced(value), 350);
  }

  // Most-influential authors first (by total downloads + reads of their books); "load more" appends.
  const authors = useInfiniteQuery({
    queryKey: ["public-authors", debounced],
    queryFn: ({ pageParam }) =>
      catalogService.authors({
        pageNumber: pageParam,
        pageSize: PAGE_SIZE,
        search: debounced || undefined,
        sortBy: "popularity",
        desc: true,
      }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNext ? last.pageNumber + 1 : undefined),
    placeholderData: keepPreviousData,
  });

  const items = authors.data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("nav.authors")}</h1>
        <p className="text-muted-foreground">{t("public.authorsSubtitle")}</p>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("authors.searchPlaceholder")}
          className="ps-9"
        />
      </div>

      {items.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          {authors.isLoading ? t("common.loading") : t("common.noData")}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((a) => {
            const nationality = localNationality(findById(countries.data, a.nationalityCountryId), a.nationality);
            return (
              <Link
                key={a.id}
                to={`/library/authors/${a.id}`}
                className="flex flex-col items-center gap-3 rounded-xl border bg-card p-5 text-center transition hover:shadow-md"
              >
                <Avatar className="h-20 w-20">
                  {a.imageUrl && <AvatarImage src={a.imageUrl} alt={a.fullName} />}
                  <AvatarFallback>
                    {a.imageUrl ? <User className="h-8 w-8" /> : a.fullName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium leading-snug">{a.fullName}</p>
                  {nationality && <p className="mt-0.5 text-xs text-muted-foreground">{nationality}</p>}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {authors.hasNextPage && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" onClick={() => authors.fetchNextPage()} disabled={authors.isFetchingNextPage}>
            {authors.isFetchingNextPage && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("common.loadMore")}
          </Button>
        </div>
      )}
    </div>
  );
}
