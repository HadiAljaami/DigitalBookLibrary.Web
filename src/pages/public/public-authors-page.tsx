import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { catalogService } from "@/services/catalog-service";
import { useCountries, useLocalName, findById } from "@/hooks/use-lookups";
import { type AuthorQuery } from "@/types/catalog";

const PAGE_SIZE = 18;

export function PublicAuthorsPage() {
  const { t } = useTranslation();
  const { nationality: localNationality } = useLocalName();
  const countries = useCountries();

  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);

  function onSearchChange(value: string) {
    setSearch(value);
    setPage(1);
    window.clearTimeout((onSearchChange as unknown as { _t?: number })._t);
    (onSearchChange as unknown as { _t?: number })._t = window.setTimeout(() => setDebounced(value), 350);
  }

  const query: AuthorQuery = {
    pageNumber: page,
    pageSize: PAGE_SIZE,
    search: debounced || undefined,
  };

  const authors = useQuery({
    queryKey: ["public-authors", query],
    queryFn: () => catalogService.authors(query),
    placeholderData: keepPreviousData,
  });

  const items = authors.data?.items ?? [];
  const total = authors.data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

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
