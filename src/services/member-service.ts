import { api } from "@/lib/api-client";
import { type PagedResult, type PaginationParams } from "@/types/api";
import { type BookListItem } from "@/types/catalog";
import { type AuthorRequest } from "@/types/author-request";

/** Member self-service against a book: reading, downloading and saving. */
export const memberService = {
  /** The PDF streamed inline for viewing. Opening is NOT counted — the read is recorded by markRead. */
  readBook: (id: number, onProgress?: (p: { loaded: number; total?: number }) => void) =>
    api.blob(`/books/${id}/read`, onProgress),
  /** The PDF as a download (logs the download + bumps the counter). */
  downloadBook: (id: number) => api.blob(`/books/${id}/download`),

  /** Whether the caller has already marked this book as read. */
  readStatus: (id: number) => api.get<{ isRead: boolean }>(`/books/${id}/read-status`),
  /** Explicitly mark the book as read (idempotent — counts once per member). */
  markRead: (id: number) => api.post<null>(`/books/${id}/mark-read`),

  save: (bookId: number) => api.post<null>(`/saved-books/${bookId}`),
  unsave: (bookId: number) => api.delete<null>(`/saved-books/${bookId}`),

  savedBooks: (query: PaginationParams) => api.get<PagedResult<BookListItem>>("/me/saved-books", query),
  readBooks: (query: PaginationParams) => api.get<PagedResult<BookListItem>>("/me/read-books", query),
  downloadedBooks: (query: PaginationParams) =>
    api.get<PagedResult<BookListItem>>("/me/downloaded-books", query),

  /** Books the current (author) user has uploaded, including their hidden ones. */
  publishedBooks: (query: PaginationParams) =>
    api.get<PagedResult<BookListItem>>("/me/published-books", query),

  /** The caller's "become an author" request status (null if never asked). */
  authorRequest: () => api.get<AuthorRequest | null>("/me/author-request"),
  submitAuthorRequest: (note: string | null) =>
    api.post<AuthorRequest>("/me/author-request", { note }),
};
