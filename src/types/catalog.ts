import { type PaginationParams } from "./api";

/** A book's author, trimmed to what listings need. */
export type AuthorRef = {
  id: number;
  name: string;
};

export type BookListItem = {
  id: number;
  title: string;
  authors: AuthorRef[];
  categoryId: number;
  categoryName: string | null;
  imageUrl: string | null;
  languageId: number | null;
  /** English fallback; the UI localizes by languageId via the lookups cache. */
  languageName: string | null;
  publishDate: string | null;
  isAvailable: boolean;
  isVisible: boolean;
  downloadsCount: number;
  readsCount: number;
};

export type BookQuery = PaginationParams & {
  search?: string;
  authorId?: number;
  categoryId?: number;
  languageId?: number;
  isAvailable?: boolean;
  /** title | date | rating | downloads | reads */
  sortBy?: string;
  desc?: boolean;
};

/** Full book detail (GET /books/{id}) — the list fields plus the editable metadata. */
export type BookDetails = BookListItem & {
  description: string | null;
  pages: number | null;
  publisherId: number | null;
  publisherName: string | null;
  hasFile: boolean;
  fileSizeMb: number | null;
};

/** Create/update payload — mirrors the backend SaveBookDto. Files are uploaded separately. */
export type SaveBookDto = {
  title: string;
  authorIds: number[];
  categoryId: number;
  description?: string | null;
  publishDate?: string | null;
  pages?: number | null;
  languageId?: number | null;
  publisherId?: number | null;
};

export type Author = {
  id: number;
  fullName: string;
  nationalityCountryId: number | null;
  /** Demonym (English fallback); the UI localizes by nationalityCountryId. */
  nationality: string | null;
  imageUrl: string | null;
  isVisible: boolean;
  hasAccount: boolean;
};

export type AuthorDetails = Author & {
  bio: string | null;
  birthDate: string | null;
  cityId: number | null;
  city: string | null;
  /** Residence country, derived from the city (read-only). */
  countryId: number | null;
  country: string | null;
};

/** Create/update payload — mirrors the backend SaveAuthorDto. */
export type SaveAuthorDto = {
  fullName: string;
  bio?: string | null;
  birthDate?: string | null;
  nationalityCountryId?: number | null;
  cityId?: number | null;
  imageUrl?: string | null;
  isVisible: boolean;
};

export type AuthorQuery = PaginationParams & {
  search?: string;
  sortBy?: string;
  desc?: boolean;
};

/** A category node in the self-referencing tree. */
export type Category = {
  id: number;
  name: string;
  parentCategoryId: number | null;
  children: Category[];
};

/** Create/update payload — mirrors the backend SaveCategoryDto. */
export type SaveCategoryDto = {
  name: string;
  parentCategoryId?: number | null;
};
