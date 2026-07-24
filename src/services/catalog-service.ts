import { api } from "@/lib/api-client";
import { type PagedResult } from "@/types/api";
import {
  type Author,
  type AuthorDetails,
  type AuthorQuery,
  type BookDetails,
  type BookListItem,
  type BookQuery,
  type Category,
  type SaveAuthorDto,
  type SaveBookDto,
  type SaveCategoryDto,
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
  /** The book's PDF as a Blob (streams via the download endpoint, which requires auth). */
  downloadBookPdf: (id: number) => api.blob(`/books/${id}/download`),
  // The toggle endpoints bind a SetFlagDto — the body field is `value`, not the flag's name.
  setBookVisibility: (id: number, value: boolean) =>
    api.patch<null>(`/books/${id}/visibility`, { value }),
  setBookAvailability: (id: number, value: boolean) =>
    api.patch<null>(`/books/${id}/availability`, { value }),

  authors: (query: AuthorQuery) => api.get<PagedResult<Author>>("/authors", query),
  author: (id: number) => api.get<AuthorDetails>(`/authors/${id}`),
  createAuthor: (body: SaveAuthorDto) => api.post<AuthorDetails>("/authors", body),
  updateAuthor: (id: number, body: SaveAuthorDto) => api.put<AuthorDetails>(`/authors/${id}`, body),
  deleteAuthor: (id: number) => api.delete<null>(`/authors/${id}`),
  uploadAuthorImage: (id: number, file: File) =>
    api.upload<{ imageUrl: string }>(`/authors/${id}/image`, file),

  categoryTree: () => api.get<Category[]>("/categories"),
  createCategory: (body: SaveCategoryDto) => api.post<Category>("/categories", body),
  updateCategory: (id: number, body: SaveCategoryDto) => api.put<Category>(`/categories/${id}`, body),
  deleteCategory: (id: number) => api.delete<null>(`/categories/${id}`),
};
