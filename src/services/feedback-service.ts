import { api } from "@/lib/api-client";
import { type PagedResult, type PaginationParams } from "@/types/api";
import { type Comment, type RatingSummary } from "@/types/feedback";

/** Ratings and comments for a book. Summary + thread are public; writing needs auth. */
export const feedbackService = {
  ratingSummary: (bookId: number) => api.get<RatingSummary>(`/books/${bookId}/rating/summary`),
  rate: (bookId: number, value: number) => api.put<RatingSummary>(`/books/${bookId}/rating`, { value }),
  deleteRating: (bookId: number) => api.delete<null>(`/books/${bookId}/rating`),

  /** A page of top-level comments (newest first) with replies nested; totalCount = root count. */
  comments: (bookId: number, params: PaginationParams) =>
    api.get<PagedResult<Comment>>(`/books/${bookId}/comments`, params),
  addComment: (bookId: number, body: { text: string; parentCommentId?: number | null }) =>
    api.post<Comment>(`/books/${bookId}/comments`, body),
  updateComment: (bookId: number, commentId: number, body: { text: string }) =>
    api.put<Comment>(`/books/${bookId}/comments/${commentId}`, body),
  deleteComment: (bookId: number, commentId: number) =>
    api.delete<null>(`/books/${bookId}/comments/${commentId}`),
};
