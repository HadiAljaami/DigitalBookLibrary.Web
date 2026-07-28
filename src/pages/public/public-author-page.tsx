import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, User, BookOpen, BadgeCheck, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ZoomableImage } from "@/components/ui/zoomable-image";
import { catalogService } from "@/services/catalog-service";
import { useCountries, useCities, useLocalName, findById } from "@/hooks/use-lookups";
import { formatDate } from "@/lib/format";

export function PublicAuthorPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const authorId = Number(id);
  const { name: localName, nationality: localNationality } = useLocalName();
  const countries = useCountries();
  const cities = useCities();

  const author = useQuery({
    queryKey: ["public-author", authorId],
    queryFn: () => catalogService.author(authorId),
    enabled: Number.isFinite(authorId),
  });

  const a = author.data;

  if (author.isLoading) {
    return <p className="py-16 text-center text-muted-foreground">{t("common.loading")}</p>;
  }
  if (!a) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">{t("common.noData")}</p>
        <Button asChild variant="link" className="mt-2">
          <Link to="/authors">{t("public.backToAuthors")}</Link>
        </Button>
      </div>
    );
  }

  const nationality = localNationality(findById(countries.data, a.nationalityCountryId), a.nationality);
  const city = localName(findById(cities.data, a.cityId), a.city);
  const country = localName(findById(countries.data, a.countryId), a.country);
  const location = [city, country].filter(Boolean).join("، ");

  return (
    <div className="space-y-8">
      <Button asChild variant="ghost" size="sm" className="gap-2">
        <Link to="/authors">
          <ArrowLeft className="h-4 w-4" />
          {t("public.backToAuthors")}
        </Link>
      </Button>

      <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:text-start">
        {a.imageUrl ? (
          <ZoomableImage
            src={a.imageUrl}
            alt={a.fullName}
            className="h-32 w-32 rounded-full border object-cover"
            caption={a.fullName}
          />
        ) : (
          <Avatar className="h-32 w-32">
            <AvatarFallback>
              <User className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>
        )}

        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <h1 className="text-2xl font-bold sm:text-3xl">{a.fullName}</h1>
            {a.hasAccount && (
              <Badge variant="secondary" className="gap-1">
                <BadgeCheck className="h-3.5 w-3.5" />
                {t("public.registeredAuthor")}
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-3 text-sm text-muted-foreground sm:justify-start">
            {nationality && <span>{nationality}</span>}
            {location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {location}
              </span>
            )}
            {a.birthDate && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> {formatDate(a.birthDate)}
              </span>
            )}
          </div>
          {a.bio && <p className="max-w-2xl whitespace-pre-line leading-relaxed text-foreground/90">{a.bio}</p>}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">
          {t("public.authorBooks")} <span className="text-muted-foreground">({a.books.length})</span>
        </h2>
        {a.books.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">{t("common.noData")}</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {a.books.map((b) => (
              <Link
                key={b.id}
                to={`/books/${b.id}`}
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
                <div className="p-3">
                  <p className="line-clamp-2 text-sm font-medium leading-snug">{b.title}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
