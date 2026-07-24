import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { lookupService } from "@/services/lookup-service";
import { type City, type Country, type Language } from "@/types/lookup";

// Lookups change very rarely, so cache them for the whole session.
const LOOKUP_OPTIONS = { staleTime: Infinity, gcTime: Infinity } as const;

export function useCountries() {
  return useQuery({
    queryKey: ["lookups", "countries"],
    queryFn: () => lookupService.countries(),
    ...LOOKUP_OPTIONS,
  });
}

export function useCities(countryId?: number) {
  return useQuery({
    queryKey: ["lookups", "cities", countryId ?? "all"],
    queryFn: () => lookupService.cities(countryId),
    ...LOOKUP_OPTIONS,
  });
}

export function useLanguages() {
  return useQuery({
    queryKey: ["lookups", "languages"],
    queryFn: () => lookupService.languages(),
    ...LOOKUP_OPTIONS,
  });
}

type Bilingual = { nameAr: string; nameEn: string };

/** Localizes lookup labels by the active UI language, with fallbacks. */
export function useLocalName() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");

  const name = (item: Bilingual | null | undefined, fallback?: string | null): string =>
    item ? (isAr ? item.nameAr : item.nameEn) : (fallback ?? "");

  const nationality = (country: Country | null | undefined, fallback?: string | null): string =>
    country ? (isAr ? country.nationalityAr : country.nationalityEn) : (fallback ?? "");

  return { name, nationality, isAr };
}

export function findById<T extends { id: number }>(items: T[] | undefined, id: number | null | undefined) {
  if (items == null || id == null) return undefined;
  return items.find((x) => x.id === id);
}

export type { City, Country, Language };
