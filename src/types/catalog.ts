import { type PaginationParams } from "./api";

export type BookListItem = {
  id: number;
  title: string;
  authorId: number;
  authorName: string | null;
  categoryId: number;
  categoryName: string | null;
  imageUrl: string | null;
  language: string | null;
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
  language?: string;
  isAvailable?: boolean;
  /** title | date | rating | downloads | reads */
  sortBy?: string;
  desc?: boolean;
};

/** Full book detail (GET /books/{id}) — the list fields plus the editable metadata. */
export type BookDetails = BookListItem & {
  description: string | null;
  pages: number | null;
  publisherName: string | null;
};

/** Create/update payload — mirrors the backend SaveBookDto. Files are uploaded separately. */
export type SaveBookDto = {
  title: string;
  authorId: number;
  categoryId: number;
  description?: string | null;
  publishDate?: string | null;
  pages?: number | null;
  language?: string | null;
  publisherName?: string | null;
};

export type Author = {
  id: number;
  fullName: string;
  nationality: string | null;
  imageUrl: string | null;
  isVisible: boolean;
  hasAccount: boolean;
};

/** A category node in the self-referencing tree. */
export type Category = {
  id: number;
  name: string;
  parentCategoryId: number | null;
  children: Category[];
};
