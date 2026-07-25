import { api } from "@/lib/api-client";
import { type PagedResult, type PaginationParams } from "@/types/api";
import { type BookListItem } from "@/types/catalog";

/** Member self-service against a book: reading, downloading and saving. */
export const memberService = {
  /** The PDF streamed inline (logs the read + bumps the counter). */
  readBook: (id: number) => api.blob(`/books/${id}/read`),
  /** The PDF as a download (logs the download + bumps the counter). */
  downloadBook: (id: number) => api.blob(`/books/${id}/download`),

  save: (bookId: number) => api.post<null>(`/saved-books/${bookId}`),
  unsave: (bookId: number) => api.delete<null>(`/saved-books/${bookId}`),

  savedBooks: (query: PaginationParams) => api.get<PagedResult<BookListItem>>("/me/saved-books", query),
  readBooks: (query: PaginationParams) => api.get<PagedResult<BookListItem>>("/me/read-books", query),
  downloadedBooks: (query: PaginationParams) =>
    api.get<PagedResult<BookListItem>>("/me/downloaded-books", query),
};
