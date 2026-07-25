import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, Star, Download, Eye, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ZoomableImage } from "@/components/ui/zoomable-image";
import { catalogService } from "@/services/catalog-service";
import { useLanguages, useLocalName, findById } from "@/hooks/use-lookups";
import { useAuth } from "@/providers/auth-provider";
import { formatNumber } from "@/lib/format";

export function PublicBookPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const bookId = Number(id);
  const { name: localName } = useLocalName();
  const { isAuthenticated } = useAuth();
  const languages = useLanguages();

  const book = useQuery({
    queryKey: ["public-book", bookId],
    queryFn: () => catalogService.book(bookId),
    enabled: Number.isFinite(bookId),
  });

  const b = book.data;

  if (book.isLoading) {
    return <p className="py-16 text-center text-muted-foreground">{t("common.loading")}</p>;
  }
  if (!b) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">{t("common.noData")}</p>
        <Button asChild variant="link" className="mt-2">
          <Link to="/library">{t("public.backToLibrary")}</Link>
        </Button>
      </div>
    );
  }

  const languageName = localName(findById(languages.data, b.languageId), b.languageName);

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="gap-2">
        <Link to="/library">
          <ArrowLeft className="h-4 w-4" />
          {t("public.backToLibrary")}
        </Link>
      </Button>

      <div className="grid gap-8 md:grid-cols-[280px_1fr]">
        {/* Cover */}
        <div className="mx-auto w-full max-w-[280px]">
          <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-xl border bg-muted">
            {b.imageUrl ? (
              <ZoomableImage
                src={b.imageUrl}
                alt={b.title}
                wrapperClassName="h-full w-full"
                className="h-full w-full object-cover"
                caption={b.title}
              />
            ) : (
              <BookOpen className="h-16 w-16 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">{b.title}</h1>
            <p className="mt-1 text-muted-foreground">
              {b.authors.length ? b.authors.map((a) => a.name).join("، ") : "—"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {b.categoryName && <Badge variant="secondary">{b.categoryName}</Badge>}
            {languageName && <Badge variant="outline">{languageName}</Badge>}
            {b.publisherName && <Badge variant="outline">{b.publisherName}</Badge>}
            {b.ratingCount > 0 && (
              <span className="inline-flex items-center gap-1 text-sm text-amber-500">
                <Star className="h-4 w-4 fill-current" />
                {b.averageRating.toFixed(1)}
                <span className="text-muted-foreground">({b.ratingCount})</span>
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Download className="h-4 w-4" /> {formatNumber(b.downloadsCount)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye className="h-4 w-4" /> {formatNumber(b.readsCount)}
            </span>
            {b.pages != null && <span>{b.pages} {t("books.pages")}</span>}
          </div>

          {b.description && (
            <p className="whitespace-pre-line leading-relaxed text-foreground/90">{b.description}</p>
          )}

          {/* Actions — reading/downloading requires an account (wired in the next slice). */}
          <div className="flex flex-wrap gap-3 pt-2">
            {isAuthenticated ? (
              <>
                <Button className="gap-2" disabled={!b.hasFile}>
                  <Eye className="h-4 w-4" />
                  {t("public.read")}
                </Button>
                <Button variant="outline" className="gap-2" disabled={!b.hasFile || !b.isAvailable}>
                  <Download className="h-4 w-4" />
                  {t("public.download")}
                </Button>
              </>
            ) : (
              <Button asChild className="gap-2">
                <Link to="/login">
                  <Lock className="h-4 w-4" />
                  {t("public.signInToRead")}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
