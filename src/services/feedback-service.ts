import { api } from "@/lib/api-client";
import { type Comment, type RatingSummary } from "@/types/feedback";

/** Ratings and comments for a book. Summary + thread are public; writing needs auth. */
export const feedbackService = {
  ratingSummary: (bookId: number) => api.get<RatingSummary>(`/books/${bookId}/rating/summary`),
  rate: (bookId: number, value: number) => api.put<RatingSummary>(`/books/${bookId}/rating`, { value }),
  deleteRating: (bookId: number) => api.delete<null>(`/books/${bookId}/rating`),

  comments: (bookId: number) => api.get<Comment[]>(`/books/${bookId}/comments`),
  addComment: (bookId: number, body: { text: string; parentCommentId?: number | null }) =>
    api.post<Comment>(`/books/${bookId}/comments`, body),
  updateComment: (bookId: number, commentId: number, body: { text: string }) =>
    api.put<Comment>(`/books/${bookId}/comments/${commentId}`, body),
  deleteComment: (bookId: number, commentId: number) =>
    api.delete<null>(`/books/${bookId}/comments/${commentId}`),
};
