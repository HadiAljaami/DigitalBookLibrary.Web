import { api } from "@/lib/api-client";
import { type PagedResult } from "@/types/api";
import {
  type Author,
  type BookDetails,
  type BookListItem,
  type BookQuery,
  type Category,
  type SaveBookDto,
} from "@/types/catalog";

export const catalogService = {
  books: (query: BookQuery) => api.get<PagedResult<BookListItem>>("/books", query),
  book: (id: number) => api.get<BookDetails>(`/books/${id}`),
  createBook: (body: SaveBookDto) => api.post<BookDetails>("/books", body),
  updateBook: (id: number, body: SaveBookDto) => api.put<BookDetails>(`/books/${id}`, body),
  deleteBook: (id: number) => api.delete<null>(`/books/${id}`),
  uploadBookCover: (id: number, file: File) =>
    api.upload<{ imageUrl: string }>(`/books/${id}/cover`, file),
  uploadBookPdf: (id: number, file: File) => api.upload<null>(`/books/${id}/file`, file),
  // The toggle endpoints bind a SetFlagDto — the body field is `value`, not the flag's name.
  setBookVisibility: (id: number, value: boolean) =>
    api.patch<null>(`/books/${id}/visibility`, { value }),
  setBookAvailability: (id: number, value: boolean) =>
    api.patch<null>(`/books/${id}/availability`, { value }),

  authors: (query: { pageNumber?: number; pageSize?: number; search?: string }) =>
    api.get<PagedResult<Author>>("/authors", query),

  categoryTree: () => api.get<Category[]>("/categories"),
};
