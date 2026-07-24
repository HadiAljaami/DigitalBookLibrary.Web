import { api } from "@/lib/api-client";
import { type City, type Country, type Language } from "@/types/lookup";

export const lookupService = {
  countries: () => api.get<Country[]>("/lookups/countries"),
  cities: (countryId?: number) =>
    api.get<City[]>("/lookups/cities", countryId ? { countryId } : undefined),
  languages: () => api.get<Language[]>("/lookups/languages"),
};
